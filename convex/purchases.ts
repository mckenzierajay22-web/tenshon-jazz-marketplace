import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listAll = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("purchases"),
      _creationTime: v.number(),
      songId: v.id("songs"),
      userId: v.id("users"),
      status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
      proofOfPaymentUrl: v.optional(v.string()),
      amount: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (user?.email !== "mckenzierajay22@gmail.com" && !user?.isAdmin) {
      throw new Error("Only admins can list all purchases");
    }

    return await ctx.db.query("purchases").order("desc").collect();
  },
});

export const listForUser = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("purchases"),
      _creationTime: v.number(),
      songId: v.id("songs"),
      userId: v.id("users"),
      status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
      proofOfPaymentUrl: v.optional(v.string()),
      amount: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("purchases")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    songId: v.id("songs"),
    amount: v.number(),
    proofOfPaymentUrl: v.optional(v.string()),
  },
  returns: v.id("purchases"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db.insert("purchases", {
      ...args,
      userId,
      status: "pending",
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("purchases"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (user?.email !== "mckenzierajay22@gmail.com" && !user?.isAdmin) {
      throw new Error("Only admins can update purchase status");
    }

    await ctx.db.patch(args.id, { status: args.status });
    return null;
  },
});
