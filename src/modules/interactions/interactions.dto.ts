export interface InteractionResponse {
  _id: string;
  leadId: string;
  type: string;
  notes?: string;
  outcome?: string;
  performedById: string;
  createdAt: string;
  updatedAt: string;
}
