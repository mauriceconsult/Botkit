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

export interface SendMessageParams {
  chatId: string;
  message: string;
}

export interface SendMessageResult {
  chatId: string;
  status: string;
}

export async function generateMaxintelText(
  params: GenerateParams,
): Promise<GenerateResult> {
  return platformRequest<GenerateResult>("/v1/maxintel/generate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function sendMaxintelMessage(
  params: SendMessageParams,
): Promise<SendMessageResult> {
  return platformRequest<SendMessageResult>(
    `/v1/maxintel/chats/${encodeURIComponent(params.chatId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ message: params.message }),
    },
  );
}
