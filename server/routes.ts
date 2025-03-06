import type { Express } from "express";
import { createServer, type Server } from "http";
import { Client } from "@notionhq/client";
import { storage } from "./storage";
import { z } from "zod";
import { statusValues } from "@shared/schema";

const notion = new Client({
  auth: "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"
});

const DATABASE_ID = "90c9f695b9d34c32bed816a02dc81a4d";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all queue items
  app.get("/api/queue", async (_req, res) => {
    try {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
      });

      const items = response.results.map(result => {
        const properties = (result as any).properties;
        return {
          pageId: result.id,
          chair: properties.체어.title?.[0]?.plain_text || "",
          status: properties.상태.select?.name || "-",
          priority: properties.우선.checkbox || false,
          progress: properties.진행.checkbox || false,
          waiting: properties.지난.formula.string || "-",
          lastEditedTime: result.last_edited_time
        };
      });

      res.json(items);
    } catch (error) {
      console.error('Error fetching from Notion:', error);
      res.status(500).json({ error: "Failed to fetch queue data" });
    }
  });

  // Update status
  app.patch("/api/queue/:pageId/status", async (req, res) => {
    const { pageId } = req.params;
    const schema = z.object({ status: z.enum(statusValues) });
    const { status } = schema.parse(req.body);

    try {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          상태: { select: { name: status } }
        }
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // Update priority
  app.patch("/api/queue/:pageId/priority", async (req, res) => {
    const { pageId } = req.params;
    const schema = z.object({ priority: z.boolean() });
    const { priority } = schema.parse(req.body);

    try {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          우선: { checkbox: priority }
        }
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update priority" });
    }
  });

  // Update progress
  app.patch("/api/queue/:pageId/progress", async (req, res) => {
    const { pageId } = req.params;
    const schema = z.object({ progress: z.boolean() });
    const { progress } = schema.parse(req.body);

    try {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          진행: { checkbox: progress }
        }
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Update waiting status
  app.patch("/api/queue/:pageId/waiting", async (req, res) => {
    const { pageId } = req.params;

    try {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          상태: { select: { name: "-" } },
          우선: { checkbox: false },
          진행: { checkbox: false }
        }
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update waiting status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}