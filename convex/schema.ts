import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom fields
    isAdmin: v.optional(v.boolean()),
  }).index("email", ["email"]),
  
  songs: defineTable({
    title: v.string(),
    artist: v.string(),
    description: v.string(),
    genre: v.union(v.literal("Jazz"), v.literal("Blues")),
    price: v.number(),
    audioUrl: v.string(), // Preview URL
    coverUrl: v.string(),
    fileStorageId: v.optional(v.id("_storage")), // Full audio file - optional for seeded data
    isFeatured: v.boolean(),
  })
    .index("by_featured", ["isFeatured"])
    .index("by_genre", ["genre"])
    .searchIndex("search_title_artist", {
      searchField: "title",
      filterFields: ["artist", "genre"],
    }),
  
  purchases: defineTable({
    songId: v.id("songs"),
    userId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    proofOfPaymentUrl: v.optional(v.string()),
    amount: v.number(),
  }).index("by_user", ["userId"]),
});
