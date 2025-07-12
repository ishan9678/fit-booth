CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anonymous_id" uuid,
	"user_id" uuid,
	"media_url" text NOT NULL,
	"media_type" text NOT NULL,
	"theme" text,
	"caption" text,
	"duration_seconds" integer DEFAULT 180,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"is_public" boolean DEFAULT true,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"anonymous_id" uuid,
	"user_id" uuid,
	"emoji" text NOT NULL,
	"ip_address" "inet",
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "views" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"anonymous_id" uuid,
	"user_id" uuid,
	"ip_address" "inet",
	"user_agent" text,
	"viewed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "views" ADD CONSTRAINT "views_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "views" ADD CONSTRAINT "views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_anonymous_id_idx" ON "sessions" USING btree ("anonymous_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sessions_active_public_idx" ON "sessions" USING btree ("is_active","is_public");--> statement-breakpoint
CREATE INDEX "reactions_session_created_idx" ON "reactions" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "views_session_id_idx" ON "views" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "views_anonymous_id_idx" ON "views" USING btree ("anonymous_id");--> statement-breakpoint
CREATE INDEX "views_user_id_idx" ON "views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "views_viewed_at_idx" ON "views" USING btree ("viewed_at");