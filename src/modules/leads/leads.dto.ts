export interface LeadResponse {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  budget?: number;
  preferredLocation?: string;
  propertyType?: string;
  bedsDesired?: number;
  bathsDesired?: number;
  notes?: string;
  status: string;
  source?: string;
  assignedAgentId: string;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
}
