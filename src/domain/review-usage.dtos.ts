// Domain: ReviewUsage DTOs

export interface CreateReviewUsageRequest {
  reviewId: string;
  agentId?: string;
  editedResponse?: string;
  responseSent?: boolean;
}

export interface UsageItemResponse {
  id: string;
  reviewId: string;
  agentId: string | null;
  editedResponse: string | null;
  responseSent: boolean;
  sentAt: string | null;
  createdAt: string;
}

export interface UsageListResponse {
  items: UsageItemResponse[];
  total: number;
}
