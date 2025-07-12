import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    anonymousId: uuid("anonymous_id"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

    mediaUrl: text("media_url").notNull(),
    mediaType: text("media_type").notNull(),

    theme: text("theme"),
    caption: text("caption"),

    durationSeconds: integer("duration_seconds").default(180),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),

    isPublic: boolean("is_public").default(true),
    isActive: boolean("is_active").default(true),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    anonymousIdIdx: index("sessions_anonymous_id_idx").on(table.anonymousId),
    expiresAtIdx: index("sessions_expires_at_idx").on(table.expiresAt),
    createdAtIdx: index("sessions_created_at_idx").on(table.createdAt),
    activePublicIdx: index("sessions_active_public_idx").on(table.isActive, table.isPublic),
  })
);
