export interface MatchResult {
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  score: number;
  reasons: string[];
}

export interface AiMatchResponse {
  matches: MatchResult[];
  provider: string;
  tokensUsed: number;
  cached: boolean;
}

export interface AiDescriptionResponse {
  title: string;
  description: string;
  highlights: string[];
  provider: string;
  tokensUsed: number;
  cached: boolean;
}

export interface AiEmailResponse {
  subject: string;
  body: string;
  provider: string;
  tokensUsed: number;
  cached: boolean;
}
