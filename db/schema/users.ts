import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  usernameIdx: index("users_username_idx").on(table.username),
  createdAtIdx: index("users_created_at_idx").on(table.createdAt),
}));
