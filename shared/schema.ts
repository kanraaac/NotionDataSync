import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const queueItems = pgTable("queue_items", {
  id: serial("id").primaryKey(),
  pageId: text("page_id").notNull(),
  chair: text("chair").notNull(),
  status: text("status").notNull().default("-"),
  priority: boolean("priority").notNull().default(false),
  progress: boolean("progress").notNull().default(false),
  waiting: text("waiting").notNull().default("-"),
  lastEditedTime: timestamp("last_edited_time").notNull(),
});

export const statusValues = [
  "긴급",
  "우선1",
  "우선2", 
  "예약신환",
  "예약",
  "신환",
  "응급",
  "대기",
  "-"
] as const;

export const queueItemSchema = createInsertSchema(queueItems);

export type QueueItem = typeof queueItems.$inferSelect;
export type InsertQueueItem = typeof queueItems.$inferInsert;
export type StatusType = typeof statusValues[number];

export const statusOrder: Record<StatusType, number> = {
  "긴급": 1,
  "우선1": 2,
  "우선2": 3,
  "예약신환": 4,
  "예약": 5,
  "신환": 6,
  "응급": 7,
  "대기": 8,
  "-": 9
};
