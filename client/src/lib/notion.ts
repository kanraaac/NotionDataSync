import { apiRequest } from "./queryClient";
import { type QueueItem, type StatusType } from "@shared/schema";

export async function updateStatus(pageId: string, status: StatusType) {
  return apiRequest("PATCH", `/api/queue/${pageId}/status`, { status });
}

export async function updatePriority(pageId: string, priority: boolean) {
  return apiRequest("PATCH", `/api/queue/${pageId}/priority`, { priority });
}

export async function updateProgress(pageId: string, progress: boolean) {
  return apiRequest("PATCH", `/api/queue/${pageId}/progress`, { progress });
}

export async function updateWaiting(pageId: string) {
  return apiRequest("PATCH", `/api/queue/${pageId}/waiting`);
}
