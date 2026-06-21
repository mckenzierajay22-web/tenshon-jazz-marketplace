import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { Music, Mail, Key, ArrowLeft, Loader2 } from "lucide-react";
import { useConvexAuth } from "convex/react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | { email: string }>("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    
    try {
      await signIn("resend-otp", formData);
      setStep({ email });
    } catch (err: any) {
      setError(err.message || "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await signIn("resend-otp", formData);
      // Success will trigger the useEffect redirect
    } catch (err: any) {
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-zinc-950">
      <div className="max-w-md w-full bg-zinc-900 border border-stone-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 text-amber-500">
            <Music size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-100 mb-2">
            Welcome Back
          </h1>
          <p className="text-stone-400">
            Sign in to your account to manage your music collection.
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoFocus
                  className="w-full bg-zinc-800 border border-stone-700 rounded-xl py-3 pl-10 pr-4 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-zinc-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group transform active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send Login Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-sm text-stone-400 mb-1">We've sent a code to</p>
              <p className="text-stone-100 font-medium">{step.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Verification Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input name="email" type="hidden" value={step.email} />
                <input
                  name="code"
                  type="text"
                  placeholder="12345678"
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  className="w-full bg-zinc-800 border border-stone-700 rounded-xl py-3 pl-10 pr-4 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 tracking-[0.5em] font-mono transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-zinc-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full bg-transparent text-stone-400 hover:text-stone-100 py-2 text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} />
                Back to email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
