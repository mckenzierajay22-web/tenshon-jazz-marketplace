import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";
import { 
  ArrowLeft, 
  Play, 
  ShieldCheck, 
  ShoppingCart, 
  Music, 
  Disc, 
  Waves
} from "lucide-react";

export const Route = createFileRoute("/songs/$songId")({
  component: SongDetailsPage,
});

function SongDetailsPage() {
  const { songId } = Route.useParams();
  const { data: song } = useSuspenseQuery(convexQuery(api.songs.get, { id: songId as any }));

  if (!song) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-stone-100 font-serif">
        <h1 className="text-4xl font-bold mb-4">Composition Not Found</h1>
        <Link to="/" className="text-amber-500 hover:underline">Return to Gallery</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-stone-100 pb-24 overflow-hidden relative">
      {/* Background Decorative */}
      <div className="absolute top-0 right-0 w-1/2 h-screen bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-screen bg-amber-900/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-12 group uppercase tracking-widest text-[10px] font-bold">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Artwork */}
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-stone-900 group">
            <img 
              src={song.coverUrl || undefined} 
              alt={song.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute bottom-8 left-8 right-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black shadow-xl shadow-amber-500/20">
                   <Play fill="currentColor" size={20} className="ml-1" />
                 </div>
                 <span className="text-xs font-bold uppercase tracking-widest">Listen to Preview</span>
               </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                <Disc size={12} className="animate-spin-slow" />
                Original Composition
              </div>
              <h1 className="text-6xl md:text-8xl font-serif font-bold leading-none tracking-tighter mb-4">
                {song.title}
              </h1>
              <p className="text-2xl font-serif italic text-blue-200/40">By {song.artist}</p>
            </div>

            <div className="space-y-6 text-stone-400 leading-relaxed text-lg font-light max-w-xl">
              <p>{song.description}</p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                   <Music size={16} className="text-amber-500" />
                   <span className="text-xs font-bold uppercase tracking-widest text-stone-200">{song.genre}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                   <Waves size={16} className="text-blue-400" />
                   <span className="text-xs font-bold uppercase tracking-widest text-stone-200">Hi-Res Audio</span>
                </div>
              </div>
            </div>

            <div className="pt-10 flex flex-col sm:flex-row items-center gap-8 border-t border-white/5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 mb-1">Acquisition Price</p>
                <p className="text-5xl font-mono font-bold text-amber-500">${song.price.toFixed(2)}</p>
              </div>

              <Link 
                to="/purchase/$songId" 
                params={{ songId: song._id }}
                className="w-full sm:w-auto px-12 py-5 bg-amber-500 text-black font-bold rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-amber-500/20 group"
              >
                <ShoppingCart size={24} />
                Acquire License
              </Link>
            </div>

            <div className="flex items-center gap-4 text-stone-600 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={18} className="text-blue-500/40" />
              <span>Full commercial rights included upon approval</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
