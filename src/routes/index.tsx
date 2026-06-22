import { createFileRoute, Link } from "@tanstack/react-router";
import { Music, Play, ShoppingCart, Headphones, Mic2, Pause, Volume2, Camera, MessageCircle, Search } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect, useDeferredValue } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [genre, setGenre] = useState<"Jazz" | "Blues" | undefined>(undefined);

  const { data: user } = useSuspenseQuery(convexQuery(api.users.currentUser, {}));
  const { data: featuredSongs } = useSuspenseQuery(convexQuery(api.songs.listFeatured, {}));
  const { data: latestSongs } = useSuspenseQuery(convexQuery(api.songs.listLatest, { 
    genre, 
    search: (deferredSearch || "").trim() || undefined 
  }));

  // Player State
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fixUrl = (url: string) => {
    if (!url) return url;
    if (url.includes("127.0.0.1:3210")) {
      return url.replace("http://127.0.0.1:3210", import.meta.env.VITE_CONVEX_URL);
    }
    return url;
  };

  const togglePlay = (song?: any) => {
    if (song && (!currentSong || currentSong._id !== song._id)) {
      const fixedSong = { 
        ...song, 
        audioUrl: fixUrl(song.audioUrl),
        coverUrl: fixUrl(song.coverUrl)
      };
      console.log("Toggling play for song:", fixedSong.title, "Fixed URL:", fixedSong.audioUrl);
      setCurrentSong(fixedSong);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          if (err.name !== "AbortError") {
            console.error("Playback failed", err);
            setIsPlaying(false);
          }
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (current > 0) {
        // console.log("Time update:", current, "/", duration);
      }
      setProgress((current / duration) * 100);

      // 30-second preview limit for non-admin/non-purchased (logic simplified for now)
      if (current >= 30 && !user?.isAdmin) {
        setIsPlaying(false);
        audioRef.current.currentTime = 0;
        alert("Preview finished. Log in or purchase to listen to the full composition.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-amber-500/30 overflow-x-hidden">
      {/* Audio Engine */}
      <audio 
        ref={audioRef}
        src={currentSong?.audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>

      {/* Atmospheric Header */}
      <nav className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-10">
          <div className="text-2xl font-serif font-bold tracking-widest bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 bg-clip-text text-transparent uppercase">
            Tenshon Jazz
          </div>
          <div className="hidden lg:flex gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-blue-200/50">
            <Link to="/" className="hover:text-amber-400 transition-colors">Compositions</Link>
            {user?.isAdmin && (
              <Link to="/admin" className="hover:text-amber-400 transition-colors text-amber-500/50">Studio Control</Link>
            )}
            <Link to="/about" className="hover:text-amber-400 transition-colors">The Studio</Link>
            <Link to="/contact" className="hover:text-amber-400 transition-colors">Contact</Link>
          </div>
        </div>
        <Link to="/auth" className="group flex items-center gap-3 px-6 py-2 border border-amber-500/20 rounded-full bg-amber-500/5 hover:bg-amber-500/10 transition-all">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Collector Portal</span>
        </Link>
      </nav>

      {/* Magical Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-6 lg:px-24 overflow-hidden">
        <div className="absolute right-0 top-0 w-full lg:w-2/3 h-full z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1525994886773-080587e161c3?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover grayscale opacity-40 mix-blend-screen scale-110"
            alt="Saxophone Background"
          />
          {/* Animated Particles/Smoke Effect Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2),transparent)] animate-pulse" />
        </div>

        <div className="relative z-20 max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-4 px-4 py-1 rounded-full border border-blue-400/20 bg-blue-500/5 text-blue-300">
            <Music size={14} className="animate-bounce" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">The Golden Standard of Jazz</span>
          </div>
          
          <h1 className="text-7xl md:text-[120px] font-serif font-bold leading-none tracking-tighter">
            <span className="block text-white opacity-90">ELEGANCE</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              IN MOTION.
            </span>
          </h1>

          <p className="max-w-xl text-lg md:text-xl text-blue-100/60 font-light leading-relaxed font-serif italic">
            "A mystical journey through the smoky depths of blue-note melodies and golden harmonic resonances."
          </p>

          <div className="flex flex-wrap gap-6 pt-6">
            <button className="px-12 py-5 bg-amber-500 text-black font-bold uppercase tracking-widest text-xs hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              Begin Exploration
            </button>
            <button className="px-12 py-5 border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
              Artist Registry
            </button>
          </div>
        </div>

        {/* Floating Notes Decorative */}
        <div className="absolute bottom-20 right-20 hidden xl:block opacity-20">
          <div className="relative w-64 h-64">
            <Music className="absolute top-0 left-0 text-amber-500 animate-[bounce_4s_infinite]" size={48} />
            <Music className="absolute bottom-10 right-0 text-amber-300 animate-[bounce_5s_infinite]" size={32} />
            <Music className="absolute top-1/2 left-1/2 text-blue-400 animate-[bounce_6s_infinite]" size={24} />
          </div>
        </div>
      </section>

      {/* Featured Compositions Grid */}
      <section className="relative z-10 py-32 px-6 lg:px-24">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-20 gap-8">
          <div className="space-y-4">
            <h2 className="text-amber-400 font-serif italic text-2xl">The Collector's Vault</h2>
            <h3 className="text-5xl font-serif font-bold text-white uppercase tracking-tight">Gilded Records</h3>
          </div>
          <div className="w-full md:w-64 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {featuredSongs?.map((song: any) => (
            <div key={song._id} className="group relative">
              <Link to="/songs/$songId" params={{ songId: song._id }} className="block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-blue-950/40 border border-white/5 group-hover:border-amber-500/30 transition-all duration-500 shadow-2xl">
                  {/* Glowing Backlight */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent z-10" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-blue-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <img 
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-all duration-700 group-hover:scale-105"
                  />

                  {/* Top Badge */}
                  <div className="absolute top-6 left-6 z-20">
                    <span className="px-4 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200">
                      {song.genre}
                    </span>
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-500">
                    <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      togglePlay(song);
                    }}
                    className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-black shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-110 transition-transform"
                  >
                      {isPlaying && currentSong?._id === song._id ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                    </button>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 z-20">
                    <h4 className="text-3xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors">{song.title}</h4>
                    <p className="text-blue-200/50 uppercase tracking-[0.3em] text-[10px] font-bold mt-2">{song.artist}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Atmospheric Mid-Section */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,58,138,0.15),transparent)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-10">
          <div className="w-20 h-20 mx-auto rounded-full border border-amber-500/20 flex items-center justify-center bg-amber-500/5 animate-pulse">
            <Mic2 className="text-amber-400" size={32} />
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter text-white">
            WHERE SMOKE MEETS <br />
            <span className="text-amber-500">THE GOLDEN NOTE</span>
          </h2>
          <p className="text-blue-100/40 font-serif italic text-xl max-w-2xl mx-auto leading-relaxed">
            Every recording in our vault is captured in high-fidelity, preserving the raw emotional resonance of the original performance.
          </p>
        </div>
      </section>

      {/* The Blue List - Latest Releases */}
      <section className="py-32 px-6 lg:px-24 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-20">
          <h2 className="text-4xl font-serif font-bold text-white uppercase tracking-widest whitespace-nowrap">Latest Echoes</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/40" size={16} />
              <input 
                type="text"
                placeholder="Search melodies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs font-bold uppercase tracking-widest focus:border-amber-500/50 outline-none transition-all placeholder:text-blue-300/20"
              />
            </div>

            {/* Genre Filters */}
            <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-full">
              {(["All", "Jazz", "Blues"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGenre(g === "All" ? undefined : g)}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
                    (g === "All" && genre === undefined) || genre === g
                      ? "bg-amber-500 text-black shadow-lg"
                      : "text-blue-200/40 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {latestSongs?.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
              <div className="text-blue-300/20 mb-4"><Search size={48} className="mx-auto" /></div>
              <p className="text-blue-100/40 font-serif italic text-xl">No melodies found in this frequency.</p>
              <button 
                onClick={() => { setSearch(""); setGenre(undefined); }}
                className="mt-6 text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : latestSongs?.map((song: any, i: number) => (
            <div key={song._id} className="group flex flex-col md:flex-row items-center gap-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-all hover:bg-white/[0.04]">
              <span className="text-blue-900 font-serif font-bold text-3xl w-12">{String(i + 1).padStart(2, '0')}</span>
              
              <button
              onClick={() => togglePlay(song)}
              className="w-20 h-20 rounded-xl overflow-hidden bg-blue-950/50 flex-shrink-0 relative group-hover:scale-110 transition-transform duration-500"
              >
                <img src={song.coverUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPlaying && currentSong?._id === song._id ? <Pause size={20} className="fill-amber-400 text-amber-400" /> : <Play size={20} className="fill-amber-400 text-amber-400" />}
                </div>
              </button>

              <div className="flex-1 text-center md:text-left">
                <Link to="/songs/$songId" params={{ songId: song._id }}>
                  <h3 className="text-2xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors">{song.title}</h3>
                </Link>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300/40">
                   <span>{song.artist}</span>
                   <div className="w-1 h-1 rounded-full bg-amber-500/30" />
                   <span className="text-amber-400/60">{song.genre}</span>
                </div>
              </div>

              <div className="flex items-center gap-8">
                 <div className="text-2xl font-serif font-bold text-amber-400">${song.price}</div>
                 <Link 
                    to="/purchase/$songId" 
                    params={{ songId: song._id }}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-200 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all"
                 >
                    <ShoppingCart size={14} />
                    Collect
                 </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Atmospheric Footer */}
      <footer className="relative py-32 px-6 lg:px-24 bg-black/40 border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20 relative z-10">
          <div className="space-y-8">
            <div className="text-3xl font-serif font-bold text-amber-500 tracking-tighter uppercase italic">Tenshon.Jazz</div>
            <p className="text-blue-100/30 font-serif italic text-lg leading-relaxed">
              "Preserving the soul of the blues and the precision of jazz for the modern collector."
            </p>
          </div>
          
          <div className="flex justify-around md:justify-between col-span-1 md:col-span-2">
            <div className="space-y-6">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.5em] text-amber-500/60">Library</h5>
              <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-blue-200/40">
                <Link to="/" className="hover:text-amber-400">The Catalog</Link>
                <Link to="/about" className="hover:text-amber-400">History</Link>
                <Link to="/legal" className="hover:text-amber-400">Licensing</Link>
              </div>
            </div>

            <div className="space-y-6 text-right">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.5em] text-amber-500/60">Contact</h5>
              <div className="flex flex-col gap-4 items-end">
                <div className="flex gap-6 pt-4">
                  <a href="https://wa.me/18762030972" target="_blank" rel="noopener noreferrer" className="text-blue-200/40 hover:text-amber-400 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                  <a href="https://www.instagram.com/tenshon_official/" target="_blank" rel="noopener noreferrer" className="text-blue-200/40 hover:text-amber-400 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <Camera size={16} />
                    Instagram
                  </a>
                  <a href="https://www.tiktok.com/@tenshontenshon" target="_blank" rel="noopener noreferrer" className="text-blue-200/40 hover:text-amber-400 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <Music size={16} />
                    TikTok
                  </a>
                </div>
              </div>
              <p className="text-[10px] text-blue-900 uppercase tracking-widest pt-10">© 2025 TENSHON • All Rights Reserved</p>
            </div>
          </div>
        </div>
      </footer>

      {/* The Velvet Player */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-none transition-all duration-500 transform ${currentSong ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <div className="max-w-6xl mx-auto bg-blue-950/40 backdrop-blur-3xl border border-white/5 rounded-3xl p-4 md:p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center gap-8 pointer-events-auto">
          <div className="flex items-center gap-4 w-1/4">
            <div className="w-14 h-14 bg-blue-900 rounded-xl overflow-hidden shadow-2xl relative group">
              <img src={currentSong?.coverUrl || "https://images.unsplash.com/photo-1514525253361-b83f859b73c0?auto=format&fit=crop&q=80&w=100"} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-amber-500/20 mix-blend-overlay" />
            </div>
            <div className="hidden lg:block min-w-0">
              <h6 className="text-sm font-serif font-bold text-white truncate">{currentSong?.title || "Midnight Lounge"}</h6>
              <p className="text-[10px] font-bold text-amber-500/50 uppercase tracking-widest truncate">{currentSong?.artist || "Select a composition"}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="flex items-center gap-10">
              <button className="text-blue-400/40 hover:text-amber-400 transition-colors"><Volume2 size={18}/></button>
              <button
              onClick={() => togglePlay()}
              className="w-14 h-14 bg-amber-500 text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
                {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
              </button>
              <button className="text-blue-400/40 hover:text-amber-400 transition-colors"><Headphones size={18}/></button>
            </div>
            <div className="w-full max-w-md h-1 bg-white/5 rounded-full overflow-hidden">
               <div
               className="h-full bg-gradient-to-r from-blue-600 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-300"
               style={{ width: `${progress}%` }}
             />
            </div>
          </div>

          <div className="w-1/4 flex justify-end items-center gap-4">
            <div className="hidden xl:block text-[9px] font-bold uppercase tracking-[0.3em] text-blue-300/30">Hi-Res Stream</div>
          {!user ? (
              <Link to="/auth" className="px-5 py-2 rounded-full border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:bg-amber-500 hover:text-black transition-all">
                Login
              </Link>
          ) : (
            <Link to="/purchase/$songId" params={{ songId: currentSong?._id }} className="px-5 py-2 rounded-full bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-all">
                Collect
              </Link>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
