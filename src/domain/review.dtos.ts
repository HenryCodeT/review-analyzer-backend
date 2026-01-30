// Data Transfer Objects (DTOs)

export interface CreateReviewRequest {
  text: string;
  language?: string;
}

export interface ReviewResponse {
  reviewId: string;
  summary: string;
  sentiment: string;
  suggestedActions: string[];
  suggestedResponse: string;
  modelProvider: string;
  modelVersion: string;
  language?: string;
  createdAt: string;
}

export interface ReviewHistoryResponse {
  items: ReviewHistoryItem[];
  total: number;
}

export interface ReviewHistoryItem {
  reviewId: string;
  rawText: string;
  sentiment: string;
  createdAt: string;
}

export interface ReviewDetailResponse extends ReviewResponse {
  rawText: string;
}
