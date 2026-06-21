import { Link } from "@tanstack/react-router";
import { Music, User, LayoutDashboard, LogOut } from "lucide-react";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

export function Navbar() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-stone-900">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Music className="text-zinc-950" size={24} />
          </div>
          <span className="text-2xl font-serif font-bold tracking-tight text-stone-100">
            TENSHON
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-stone-400 hover:text-amber-500 transition-colors">Home</Link>
          <button className="text-stone-400 hover:text-amber-500 transition-colors">Jazz</button>
          <button className="text-stone-400 hover:text-amber-500 transition-colors">Blues</button>
          <Link to="/about" className="text-stone-400 hover:text-amber-500 transition-colors">About</Link>
          <Link to="/contact" className="text-stone-400 hover:text-amber-500 transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  {user?.isAdmin && (
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-stone-800 text-stone-100 hover:border-amber-500/50 transition-all"
                    >
                      <LayoutDashboard size={18} />
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                  )}
                  <button 
                    onClick={() => void signOut()}
                    className="p-2 text-stone-400 hover:text-red-400 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/auth" 
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 text-zinc-950 font-bold hover:bg-amber-600 transition-all transform hover:scale-105"
                >
                  <User size={18} />
                  Login
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
