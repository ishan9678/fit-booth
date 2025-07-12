import { pgTable, bigserial, uuid, text, timestamp, inet, index } from "drizzle-orm/pg-core";
import { sessions } from "./sessions";
import { users } from "./users";

export const reactions = pgTable("reactions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  anonymousId: uuid("anonymous_id"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  emoji: text("emoji").notNull(),
  ipAddress: inet("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
},
  (table) => ({
    sessionCreatedIdx: index("reactions_session_created_idx").on(table.sessionId, table.createdAt),
  })
);
