export interface AIProviderResult {
  data: unknown;
  tokensUsed: number;
}

export interface AIProvider {
  readonly name: string;
  generateJSON(params: {
    system: string;
    user: string;
    schema: Record<string, unknown>;
    temperature?: number;
  }): Promise<AIProviderResult>;
  isHealthy(): Promise<boolean>;
}
