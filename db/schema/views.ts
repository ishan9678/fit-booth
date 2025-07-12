import { pgTable, bigserial, uuid, inet, text, timestamp, index } from "drizzle-orm/pg-core";
import { sessions } from "./sessions";
import { users } from "./users";

export const views = pgTable("views", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  anonymousId: uuid("anonymous_id"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  sessionIdIdx: index("views_session_id_idx").on(table.sessionId),
  anonymousIdIdx: index("views_anonymous_id_idx").on(table.anonymousId),
  userIdIdx: index("views_user_id_idx").on(table.userId),
  viewedAtIdx: index("views_viewed_at_idx").on(table.viewedAt),
}));
