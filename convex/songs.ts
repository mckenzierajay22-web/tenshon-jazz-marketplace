import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const fixStorageUrl = (url: string | null) => {
  if (!url) return null;
  const convexUrl = process.env.VITE_CONVEX_URL || "https://3210-i6sttuet3rffw72v97uqd.app.cto.new";
  if (url.includes("127.0.0.1:3210")) {
    return url.replace("http://127.0.0.1:3210", convexUrl);
  }
  return url;
};

export const listFeatured = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const songs = await ctx.db
      .query("songs")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .order("desc")
      .take(10);

    return Promise.all(songs.map(async (s) => ({
      ...s,
      coverUrl: s.coverUrl.startsWith("http") ? s.coverUrl : fixStorageUrl(await ctx.storage.getUrl(s.coverUrl as any)),
      audioUrl: s.audioUrl.startsWith("http") ? s.audioUrl : fixStorageUrl(await ctx.storage.getUrl(s.audioUrl as any)),
    })));
  },
});

export const listLatest = query({
  args: { 
    genre: v.optional(v.union(v.literal("Jazz"), v.literal("Blues"))),
    search: v.optional(v.string())
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    let songs;
    if (args.search) {
      let q = ctx.db
        .query("songs")
        .withSearchIndex("search_title_artist", (q) => {
          let search = q.search("title", args.search!);
          if (args.genre) {
            search = search.eq("genre", args.genre);
          }
          return search;
        });
      songs = await q.take(20);
    } else if (args.genre) {
      songs = await ctx.db
        .query("songs")
        .withIndex("by_genre", (q) => q.eq("genre", args.genre!))
        .order("desc")
        .take(20);
    } else {
      songs = await ctx.db.query("songs").order("desc").take(20);
    }

    return Promise.all(songs.map(async (s) => ({
      ...s,
      coverUrl: s.coverUrl.startsWith("http") ? s.coverUrl : fixStorageUrl(await ctx.storage.getUrl(s.coverUrl as any)),
      audioUrl: s.audioUrl.startsWith("http") ? s.audioUrl : fixStorageUrl(await ctx.storage.getUrl(s.audioUrl as any)),
    })));
  },
});

export const get = query({
  args: { id: v.id("songs") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const song = await ctx.db.get(args.id);
    if (!song) return null;

    return {
      ...song,
      coverUrl: song.coverUrl.startsWith("http") ? song.coverUrl : fixStorageUrl(await ctx.storage.getUrl(song.coverUrl as any)),
      audioUrl: song.audioUrl.startsWith("http") ? song.audioUrl : fixStorageUrl(await ctx.storage.getUrl(song.audioUrl as any)),
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    artist: v.string(),
    description: v.string(),
    genre: v.union(v.literal("Jazz"), v.literal("Blues")),
    price: v.number(),
    audioUrl: v.string(),
    coverUrl: v.string(),
    fileStorageId: v.optional(v.id("_storage")),
    isFeatured: v.boolean(),
  },
  returns: v.id("songs"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (user?.email !== "mckenzieraniel@gmail.com" && !user?.isAdmin) {
      throw new Error("Only admins can create songs");
    }

    return await ctx.db.insert("songs", args);
  },
});

export const remove = mutation({
  args: { id: v.id("songs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (user?.email !== "mckenzieraniel@gmail.com" && !user?.isAdmin) {
      throw new Error("Only admins can delete songs");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});
