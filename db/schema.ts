import {
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  type: text("type").notNull().default("content_issue"),
  message: text("message").notNull(),
  pageUrl: text("page_url"),
  contactEmail: text("contact_email"),
  status: text("status").notNull().default("new"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
