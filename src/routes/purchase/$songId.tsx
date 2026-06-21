import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Building2,
  Upload,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  FileText,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/purchase/$songId")({
  component: PurchasePage,
});

function PurchasePage() {
  const { songId } = Route.useParams();
  const { data: song } = useSuspenseQuery(convexQuery(api.songs.get, { id: songId as any }));
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createPurchase = useMutation(api.purchases.create);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"form" | "submitting" | "success">("form");

  if (!song) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-stone-100">
        <h1 className="text-4xl font-serif font-bold mb-4">Song Not Found</h1>
        <Link to="/" className="text-amber-500 hover:underline">Return to Home</Link>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const convexUrl = import.meta.env.VITE_CONVEX_URL;
      const uploadUrl = await generateUploadUrl();
      const finalUploadUrl = uploadUrl.replace("http://127.0.0.1:3210", convexUrl);

      const result = await fetch(finalUploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");

      const { storageId } = await result.json();
      setProofUrl(storageId);
    } catch (err) {
      console.error("Upload failed", err);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl) return;

    setStatus("submitting");
    try {
      await createPurchase({
        songId: song._id,
        amount: song.price,
        proofOfPaymentUrl: proofUrl,
      });
      setStatus("success");
    } catch (err) {
      console.error("Submission failed", err);
      setStatus("form");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
            <CheckCircle2 className="text-green-500" size={48} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-stone-100">Order Received</h1>
          <p className="text-stone-400 leading-relaxed">
            Your proof of payment for <span className="text-amber-500 font-bold">"{song.title}"</span> has been submitted. 
            Once verified by the studio, the high-quality file will be added to your library.
          </p>
          <div className="pt-8">
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-800 text-stone-100 font-bold rounded-xl hover:bg-zinc-700 transition-all border border-stone-700">
              <ArrowLeft size={18} />
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-stone-300 selection:bg-amber-500/30">
      <nav className="border-b border-stone-900 bg-zinc-950/50 backdrop-blur-xl px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 text-stone-100 hover:text-amber-500 transition-colors font-bold uppercase tracking-widest text-xs">
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="text-sm font-serif italic text-amber-500/80">Securing your acquisition...</div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-zinc-900 border border-stone-800 rounded-3xl p-8 md:p-12 shadow-2xl">
               <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-100 mb-8 tracking-tight">Complete Acquisition</h1>
               
               <div className="space-y-8">
                 <div className="flex items-start gap-6 bg-zinc-950 p-8 rounded-2xl border border-stone-800">
                   <Building2 className="text-amber-500 shrink-0 mt-1" size={32} />
                   <div className="space-y-4">
                     <h2 className="text-xl font-bold text-stone-100 uppercase tracking-wider">Bank Transfer Details</h2>
                     <div className="space-y-2">
                        <p className="text-stone-500 text-xs uppercase font-bold tracking-widest">Account Name</p>
                        <p className="text-stone-100 font-mono text-lg">TENSHON</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <p className="text-stone-500 text-xs uppercase font-bold tracking-widest">Bank</p>
                           <p className="text-stone-100 font-mono">NCB (National Continental Bank)</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-stone-500 text-xs uppercase font-bold tracking-widest">Account Number</p>
                           <p className="text-stone-100 font-mono text-amber-500">123-456-789</p>
                        </div>
                     </div>
                   </div>
                 </div>

                 <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl flex gap-4">
                   <AlertCircle className="text-amber-500 shrink-0" size={24} />
                   <div>
                     <p className="text-amber-500 font-bold mb-1">Important</p>
                     <p className="text-stone-300 text-sm">
                       Please include your email address in the transaction notes. Transfer the exact amount of
                       <span className="text-stone-100 font-bold"> ${song.price.toFixed(2)} USD</span>.
                     </p>
                   </div>
                 </div>
               </div>
            </section>

            <section className="bg-zinc-900 border border-stone-800 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
                <Upload className="text-amber-500" size={28} />
                Upload Proof of Payment
              </h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
                  proofUrl ? 'border-green-500/50 bg-green-500/5' : 'border-stone-800 hover:border-amber-500/50'
                }`}>
                  {uploading ? (
                    <div className="flex flex-col items-center py-4">
                      <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
                      <p className="text-stone-400">Uploading receipt...</p>
                    </div>
                  ) : proofUrl ? (
                    <div className="flex flex-col items-center py-4 text-green-500">
                      <CheckCircle2 size={48} className="mb-4" />
                      <p className="font-bold">Proof of payment attached</p>
                      <button
                        type="button"
                        onClick={() => setProofUrl(null)}
                        className="mt-4 text-stone-500 hover:text-red-400 text-sm font-bold underline underline-offset-4"
                      >
                        Remove and retry
                      </button>
                    </div>
                  ) : (
                    <>
                      <FileText className="mx-auto mb-4 text-stone-700" size={48} />
                      <p className="text-stone-400 mb-2">Screenshot of transfer or digital receipt</p>
                      {uploadError && <p className="text-red-500 text-xs mb-4 font-bold">{uploadError}</p>}
                      <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-stone-100 font-bold rounded-xl transition-all border border-stone-700">
                        <span>Choose File</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                    </>
                  )}
                </div>
                <div className="pt-4">
                   <button
                     type="submit"
                     disabled={!proofUrl || status === "submitting"}
                     className="w-full py-5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-zinc-950 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-amber-500/10"
                   >
                     {status === "submitting" ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
                     Confirm & Submit Request
                   </button>
                   <p className="text-center text-stone-500 text-xs mt-4">
                     By clicking confirm, you certify that the payment has been sent to the designated account.
                   </p>
                </div>
              </form>
            </section>
          </div>
          <div className="space-y-8">
            <section className="bg-zinc-900 border border-stone-800 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-lg font-serif font-bold mb-6">Order Summary</h3>
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                  <img src={song.coverUrl || undefined} alt={song.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-stone-100 truncate line-clamp-1">{song.title}</p>
                  <p className="text-xs text-stone-500">{song.artist}</p>
                </div>
              </div>
              <div className="space-y-4 pt-6 border-t border-stone-800">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="text-stone-300 font-mono">${song.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Transaction Fee</span>
                  <span className="text-stone-300 font-mono">$0.00</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-stone-800">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-mono font-bold text-amber-500 text-xl">${song.price.toFixed(2)}</span>
                </div>
              </div>
            </section>
            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl space-y-4">
               <div className="flex items-center gap-3 text-blue-400">
                 <ShieldCheck size={20} />
                 <span className="font-bold text-sm uppercase tracking-wider">Secure Payment</span>
               </div>
               <p className="text-stone-400 text-xs leading-relaxed">
                 Your purchase is manually verified. Once approved, the high-quality file will be available in your library permanently.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
