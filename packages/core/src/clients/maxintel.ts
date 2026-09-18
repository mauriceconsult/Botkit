import { platformRequest } from "../platform-client.js";

export interface GenerateParams {
  prompt: string;
  model?: string;
  system?: string;
  maxTokens?: number;
  type?: string;
}

export interface GenerateResult {
  output: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  creditsUsed: number;
  creditsRemaining: number;
  warning?: {
    code: string;
    balance: number;
    message: string;
    topUpUrl: string;
  };
}

export async function generateMaxintelText(
  params: GenerateParams,
): Promise<GenerateResult> {
  return platformRequest<GenerateResult>("/v1/maxintel/generate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
