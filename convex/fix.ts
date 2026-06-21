import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const makeAllFeatured = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const songs = await ctx.db.query("songs").collect();
    for (const song of songs) {
      await ctx.db.patch(song._id, { isFeatured: true });
    }
    return null;
  },
});
