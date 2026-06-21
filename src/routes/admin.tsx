import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Plus, 
  Music, 
  ShoppingBag, 
  Settings, 
  Edit, 
  Trash2, 
  Check, 
  X,
  FileText,
  Loader2,
  Upload
} from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { data: user } = useSuspenseQuery(convexQuery(api.users.currentUser, {}));
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate({ to: "/" });
    }
    if (!user) {
      navigate({ to: "/auth" });
    }
  }, [user, navigate]);

  if (!user || !user.isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  return <AdminDashboard user={user} />;
}

function AdminDashboard({ user }: { user: any }) {
  const { data: songs } = useSuspenseQuery(convexQuery(api.songs.listLatest, {}));
  const { data: purchases } = useSuspenseQuery(convexQuery(api.purchases.listAll, {}));
  const removeSong = useMutation(api.songs.remove);
  const createSong = useMutation(api.songs.create);
  
  const [activeTab, setActiveTab] = useState<"songs" | "purchases" | "settings">("songs");
  const [isAddingSong, setIsAddingSong] = useState(false);

  // Form state
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "TENSHON",
    description: "",
    genre: "Jazz" as "Jazz" | "Blues",
    price: 9.99,
    isFeatured: false
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !imageFile) {
      alert("Please select both an audio file and a cover image.");
      return;
    }

    setIsUploading(true);
    try {
      const convexUrl = import.meta.env.VITE_CONVEX_URL;

      // 1. Upload audio file
      const audioUploadUrl = await generateUploadUrl();
      // Fix for local dev: if URL starts with 127.0.0.1, replace with public URL
      const finalAudioUrl = audioUploadUrl.replace("http://127.0.0.1:3210", convexUrl);
      
      const audioResult = await fetch(finalAudioUrl, {
        method: "POST",
        headers: { "Content-Type": audioFile.type },
        body: audioFile,
      });
      
      if (!audioResult.ok) {
        throw new Error(`Audio upload failed: ${audioResult.statusText}`);
      }
      
      const { storageId: audioStorageId } = await audioResult.json();

      // 2. Upload image file
      const imageUploadUrl = await generateUploadUrl();
      const finalImageUrl = imageUploadUrl.replace("http://127.0.0.1:3210", convexUrl);
      
      const imageResult = await fetch(finalImageUrl, {
        method: "POST",
        headers: { "Content-Type": imageFile.type },
        body: imageFile,
      });
      
      if (!imageResult.ok) {
        throw new Error(`Image upload failed: ${imageResult.statusText}`);
      }
      
      const { storageId: imageStorageId } = await imageResult.json();

      // 3. Create song record
      await createSong({
        ...newSong,
        audioUrl: audioStorageId,
        coverUrl: imageStorageId,
        fileStorageId: audioStorageId,
      });

      setIsAddingSong(false);
      setNewSong({
        title: "",
        artist: "TENSHON",
        description: "",
        genre: "Jazz",
        price: 9.99,
        isFeatured: false
      });
      setAudioFile(null);
      setImageFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to create song: " + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-stone-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-stone-900 flex flex-col pt-8">
        <div className="px-8 mb-12">
          <h2 className="text-stone-500 font-bold uppercase tracking-widest text-xs">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 space-y-2 px-4">
          <button 
            onClick={() => setActiveTab("songs")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "songs" ? "bg-amber-500 text-zinc-950 font-bold" : "text-stone-400 hover:bg-zinc-900"}`}
          >
            <Music size={20} />
            Manage Songs
          </button>
          <button 
            onClick={() => setActiveTab("purchases")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "purchases" ? "bg-amber-500 text-zinc-950 font-bold" : "text-stone-400 hover:bg-zinc-900"}`}
          >
            <ShoppingBag size={20} />
            Purchases
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "settings" ? "bg-amber-500 text-zinc-950 font-bold" : "text-stone-400 hover:bg-zinc-900"}`}
          >
            <Settings size={20} />
            Settings
          </button>
        </nav>
        
        <div className="p-8 border-t border-stone-900">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center font-bold text-zinc-950">
               {user.email?.[0].toUpperCase()}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold truncate">{user.email}</p>
               <p className="text-xs text-stone-500">Administrator</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-auto">
        {activeTab === "songs" && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h1 className="text-4xl font-serif font-bold mb-2">Music Library</h1>
                <p className="text-stone-500">Upload and manage your jazz & blues collection.</p>
              </div>
              <button 
                onClick={() => setIsAddingSong(true)}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-zinc-950 font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
              >
                <Plus size={20} />
                Upload New Song
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {songs?.map((song: any) => (
                <div key={song._id} className="bg-zinc-900/50 border border-stone-800 rounded-2xl p-6 flex items-center gap-6 group hover:border-amber-500/30 transition-all">
                  <div className="w-20 h-20 bg-zinc-800 rounded-xl overflow-hidden shadow-xl">
                    <img src={song.coverUrl || undefined} alt={song.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold">{song.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${song.genre === 'Jazz' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                        {song.genre}
                      </span>
                      {song.isFeatured && (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold uppercase tracking-wider">Featured</span>
                      )}
                    </div>
                    <p className="text-stone-500">{song.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-mono font-bold text-amber-500 mb-1">${song.price.toFixed(2)}</p>
                    <p className="text-xs text-stone-500">Last updated recently</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-3 bg-zinc-800 text-stone-300 rounded-xl hover:text-amber-500 transition-colors">
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this composition?")) {
                          removeSong({ id: song._id });
                        }
                      }}
                      className="p-3 bg-zinc-800 text-stone-300 rounded-xl hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "purchases" && (
          <div className="max-w-6xl mx-auto">
             <div className="mb-12">
               <h1 className="text-4xl font-serif font-bold mb-2">Purchase Orders</h1>
               <p className="text-stone-500">Review and approve bank transfer confirmations.</p>
             </div>

             <div className="bg-zinc-900/50 border border-stone-800 rounded-3xl overflow-hidden">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-stone-800 bg-zinc-900/80">
                     <th className="px-8 py-5 text-stone-500 text-sm font-bold uppercase tracking-wider">User</th>
                     <th className="px-8 py-5 text-stone-500 text-sm font-bold uppercase tracking-wider">Song</th>
                     <th className="px-8 py-5 text-stone-500 text-sm font-bold uppercase tracking-wider">Amount</th>
                     <th className="px-8 py-5 text-stone-500 text-sm font-bold uppercase tracking-wider">Status</th>
                     <th className="px-8 py-5 text-stone-500 text-sm font-bold uppercase tracking-wider text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {purchases?.map((purchase: any) => (
                     <tr key={purchase._id} className="border-b border-stone-800/50 hover:bg-white/5 transition-colors group">
                       <td className="px-8 py-6 font-medium">Unknown User</td>
                       <td className="px-8 py-6 text-stone-400">Song ID: {purchase.songId.substring(0, 8)}...</td>
                       <td className="px-8 py-6 font-mono font-bold text-amber-500">${purchase.amount.toFixed(2)}</td>
                       <td className="px-8 py-6">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                           purchase.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                           purchase.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                           'bg-red-500/10 text-red-500'
                         }`}>
                           {purchase.status}
                         </span>
                       </td>
                       <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-2">
                           {purchase.proofOfPaymentUrl && (
                             <a 
                               href={purchase.proofOfPaymentUrl} 
                               target="_blank" 
                               rel="noreferrer"
                               className="p-2 text-stone-400 hover:text-amber-500 transition-colors"
                               title="View Proof"
                             >
                               <FileText size={20} />
                             </a>
                           )}
                           {purchase.status === 'pending' && (
                             <>
                               <button className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-all">
                                 <Check size={20} />
                               </button>
                               <button className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                 <X size={20} />
                               </button>
                             </>
                           )}
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </main>

      {/* Upload Song Modal */}
      {isAddingSong && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddingSong(false)} />
          <div className="relative bg-zinc-900 border border-stone-800 w-full max-w-2xl rounded-3xl p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-3xl font-serif font-bold mb-8">Upload Original Composition</h2>
            
            <form className="space-y-6" onSubmit={handleAddSong}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-2">Song Title</label>
                  <input 
                    type="text" 
                    required
                    value={newSong.title}
                    onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                    className="w-full bg-zinc-800 border border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" 
                    placeholder="e.g. Midnight Train" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-2">Genre</label>
                  <select 
                    value={newSong.genre}
                    onChange={(e) => setNewSong({...newSong, genre: e.target.value as "Jazz" | "Blues"})}
                    className="w-full bg-zinc-800 border border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Jazz">Jazz</option>
                    <option value="Blues">Blues</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-400 mb-2">Description</label>
                <textarea 
                  required
                  value={newSong.description}
                  onChange={(e) => setNewSong({...newSong, description: e.target.value})}
                  className="w-full bg-zinc-800 border border-stone-700 rounded-xl px-4 py-3 h-32 focus:outline-none focus:border-amber-500" 
                  placeholder="Tell the story behind this piece..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-2">Cover Artwork</label>
                  <input 
                    type="file" 
                    id="image-upload"
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  <label 
                    htmlFor="image-upload"
                    className={`block border-2 border-dashed rounded-xl p-4 text-center group transition-all cursor-pointer ${
                      imageFile ? 'border-amber-500 bg-amber-500/5' : 'border-stone-800 hover:border-amber-500/50'
                    }`}
                  >
                    <p className={`text-xs ${imageFile ? 'text-stone-200' : 'text-stone-400'}`}>
                      {imageFile ? imageFile.name : 'Click to upload cover image'}
                    </p>
                  </label>
                </div>
                <div className="flex items-center gap-4 h-full pt-6">
                  <input 
                    type="checkbox" 
                    id="featured" 
                    checked={newSong.isFeatured}
                    onChange={(e) => setNewSong({...newSong, isFeatured: e.target.checked})}
                    className="w-5 h-5 bg-zinc-800 border-stone-700 rounded text-amber-500 focus:ring-amber-500/20" 
                  />
                  <label htmlFor="featured" className="text-stone-300 font-medium">Mark as Featured</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-400 mb-2">Price (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={newSong.price}
                    onChange={(e) => setNewSong({...newSong, price: parseFloat(e.target.value)})}
                    className="w-full bg-zinc-800 border border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" 
                    placeholder="9.99" 
                  />
                </div>
              </div>

              <div className="relative">
                <input 
                  type="file" 
                  id="audio-upload"
                  className="hidden" 
                  accept="audio/*" 
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                />
                <label 
                  htmlFor="audio-upload"
                  className={`block border-2 border-dashed rounded-2xl p-12 text-center group transition-all cursor-pointer ${
                    audioFile ? 'border-amber-500 bg-amber-500/5' : 'border-stone-800 hover:border-amber-500/50'
                  }`}
                >
                  <Upload className={`mx-auto mb-4 ${audioFile ? 'text-amber-500' : 'text-stone-600 group-hover:text-amber-500'} transition-colors`} size={48} />
                  <p className={audioFile ? 'text-stone-200 font-bold' : 'text-stone-400'}>
                    {audioFile ? audioFile.name : 'Click to upload full HQ audio file'}
                  </p>
                  <p className="text-xs text-stone-600 mt-2">WAV, FLAC or high-bitrate MP3</p>
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button type="button" onClick={() => setIsAddingSong(false)} className="px-8 py-3 text-stone-400 hover:text-stone-100 transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="px-10 py-3 bg-amber-500 text-zinc-950 font-bold rounded-xl hover:bg-amber-600 disabled:bg-amber-500/50 transition-all flex items-center gap-2"
                >
                  {isUploading && <Loader2 className="animate-spin" size={20} />}
                  {isUploading ? 'Uploading...' : 'Save Composition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
