// import { platformRequest } from "../platformClient.js";

import { platformRequest } from "../platform-client.js";

export interface PostDeliveryParams {
  pickupAddress: string;
  dropoffAddress: string;
  description?: string;
}

export interface PostDeliveryResult {
  id: string;
  status: string;
}

// PLACEHOLDER contract — confirm real route/body shape against Dukaboda's server code
export async function postDukabodaDelivery(
  params: PostDeliveryParams,
): Promise<PostDeliveryResult> {
  return platformRequest<PostDeliveryResult>("/v1/dukaboda/deliveries", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
