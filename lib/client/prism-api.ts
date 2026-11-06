/**
 * PRISM API Client SDK
 * Ready to be imported or copied directly into your frontend repository (github.com/Aarav7162/prism-papers)
 */

import { ApiResponse } from "../api-response";
import { PaperFilterInput, BatchDownloadInput } from "../validations/papers";
import { ProgressSyncItem, ProgressPatchInput } from "../validations/user-progress";

export interface PrismClientConfig {
  baseUrl?: string;
  getAccessToken?: () => Promise<string | null> | string | null;
}

export class PrismApiClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null> | string | null;

  constructor(config: PrismClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_APP_URL || "";
    this.getAccessToken = config.getAccessToken;
  }

  private async fetchJson<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options.headers || {});

    if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
      headers.set("Content-Type", "application/json");
    }

    if (this.getAccessToken) {
      const token = await this.getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response.json();
  }

  // --- Boards & Catalog ---
  async getBoards(includeInactive = false) {
    const query = includeInactive ? "?includeInactive=true" : "";
    return this.fetchJson<any[]>(`/api/boards${query}`);
  }

  async getPapers(filters: Partial<PaperFilterInput> = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        params.append(key, String(val));
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return this.fetchJson<{ items: any[]; pagination: any }>(`/api/papers${queryString}`);
  }

  async getPaper(id: string) {
    return this.fetchJson<any>(`/api/papers/${id}`);
  }

  // --- Cloudflare R2 Presigned Zero-Egress Access ---
  async getPaperViewUrl(id: string) {
    return this.fetchJson<{
      paperId: string;
      url: string;
      expiresIn: number;
      filename: string;
      paperType: string;
    }>(`/api/papers/${id}/view`);
  }

  async getPaperDownloadUrl(id: string) {
    return this.fetchJson<{
      paperId: string;
      url: string;
      expiresIn: number;
      filename: string;
    }>(`/api/papers/${id}/download`);
  }

  async batchDownload(payload: BatchDownloadInput) {
    return this.fetchJson<{ count: number; papers: any[] }>(
      "/api/papers/batch-download",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  // --- User Progress & Offline Sync ---
  async getUserProgress() {
    return this.fetchJson<{ summary: any; items: any[] }>("/api/user/progress");
  }

  async syncLocalProgress(items: ProgressSyncItem[]) {
    return this.fetchJson<{ syncedCount: number; records: any[] }>(
      "/api/user/progress/sync",
      {
        method: "POST",
        body: JSON.stringify({ items }),
      }
    );
  }

  async autoSaveProgress(paperId: string, patch: ProgressPatchInput) {
    return this.fetchJson<{ record: any; totalMarks: number; percentage: number }>(
      `/api/user/progress/${paperId}`,
      {
        method: "PATCH",
        body: JSON.stringify(patch),
      }
    );
  }

  // --- Analytics & Weakness Heatmap ---
  async getUserAnalytics() {
    return this.fetchJson<{
      overview: any;
      topicHeatmap: { weakest: any[]; all: any[]; weakCount: number; strongCount: number };
      subjectBreakdown: any[];
    }>("/api/user/analytics");
  }

  // --- Bookmarks ---
  async getBookmarks() {
    return this.fetchJson<any[]>("/api/user/bookmarks");
  }

  async addBookmark(paperId: string) {
    return this.fetchJson<{ bookmarked: boolean; bookmark: any }>(
      "/api/user/bookmarks",
      {
        method: "POST",
        body: JSON.stringify({ paperId }),
      }
    );
  }

  async removeBookmark(paperId: string) {
    return this.fetchJson<{ bookmarked: boolean; paperId: string }>(
      `/api/user/bookmarks/${paperId}`,
      {
        method: "DELETE",
      }
    );
  }
}

// Export default singleton instance
export const prismApi = new PrismApiClient();
