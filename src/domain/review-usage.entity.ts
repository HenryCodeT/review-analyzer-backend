// Domain: ReviewUsage Entity

export interface ReviewUsage {
  id: string;
  reviewId: string;
  agentId: string | null;
  editedResponse: string | null;
  responseSent: boolean;
  sentAt: Date | null;
  createdAt: Date;
}
