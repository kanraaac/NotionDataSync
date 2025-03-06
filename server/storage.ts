import { type QueueItem, type InsertQueueItem } from "@shared/schema";
import NodeCache from "node-cache";

export interface IStorage {
  getQueueItems(): Promise<QueueItem[]>;
  cacheQueueItems(items: QueueItem[]): Promise<void>;
  clearCache(): Promise<void>;
}

export class MemStorage implements IStorage {
  private cache: NodeCache;
  
  constructor() {
    // Cache with 30 second TTL
    this.cache = new NodeCache({ stdTTL: 30 });
  }

  async getQueueItems(): Promise<QueueItem[]> {
    const items = this.cache.get<QueueItem[]>("queue_items");
    return items || [];
  }

  async cacheQueueItems(items: QueueItem[]): Promise<void> {
    this.cache.set("queue_items", items);
  }

  async clearCache(): Promise<void> {
    this.cache.flushAll();
  }
}

export const storage = new MemStorage();
