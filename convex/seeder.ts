import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if songs already exist
    const existing = await ctx.db.query("songs").first();
    if (existing) return null;

    const songs = [
      {
        title: "Midnight Sessions Vol. 1",
        artist: "TENSHON",
        description: "A soulful exploration of midnight jazz, featuring smooth saxophone improvisations and a deep bass groove.",
        genre: "Jazz" as const,
        price: 19.99,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        coverUrl: "https://images.unsplash.com/photo-1514525253361-b83f859b73c0?auto=format&fit=crop&q=80&w=600",
        isFeatured: true,
      },
      {
        title: "Blue Note Blues",
        artist: "TENSHON",
        description: "Gritty, authentic blues recorded live at the historic Blue Note. The harmonica wails through the smokey atmosphere.",
        genre: "Blues" as const,
        price: 14.99,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        coverUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=600",
        isFeatured: true,
      },
      {
        title: "Sunset over St. Ann",
        artist: "TENSHON",
        description: "Inspired by the beautiful sunsets in St. Ann's Bay, this piece blends island rhythms with classic jazz harmonies.",
        genre: "Jazz" as const,
        price: 9.99,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600",
        isFeatured: false,
      },
      {
        title: "Rhythm of the Rain",
        artist: "TENSHON",
        description: "A contemplative piano piece that captures the rhythmic patterns of a tropical rainstorm.",
        genre: "Jazz" as const,
        price: 12.99,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        coverUrl: "https://images.unsplash.com/photo-1514320291944-8391b9ad4474?auto=format&fit=crop&q=80&w=600",
        isFeatured: false,
      },
    ];

    for (const song of songs) {
      await ctx.db.insert("songs", {
        ...song,
      });
    }

    return null;
  },
});
