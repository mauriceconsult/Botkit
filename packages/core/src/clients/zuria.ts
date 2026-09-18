// import { platformRequest } from "../platformClient.js";

import { platformRequest } from "../platform-client.js";

export interface PostListingParams {
  title: string;
  description: string;
  price: number;
  category?: string;
}

export interface PostListingResult {
  id: string;
  status: string;
}

// PLACEHOLDER contract — confirm real route/body shape against Zuria/Vendly's server code
export async function postZuriaListing(
  params: PostListingParams
): Promise<PostListingResult> {
  return platformRequest<PostListingResult>("/v1/zuria/listings", {
    method: "POST",
    body: JSON.stringify(params),
  });
}