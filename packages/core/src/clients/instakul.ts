// import { platformRequest } from "../platformClient.js";

import { platformRequest } from "../platform-client.js";

export interface PostAnnouncementParams {
  classId: string;
  title: string;
  content: string;
}

export interface PostAnnouncementResult {
  id: string;
  status: string;
}

// PLACEHOLDER contract — confirm real route/body shape against Instaskul's server code
export async function postInstaskulAnnouncement(
  params: PostAnnouncementParams,
): Promise<PostAnnouncementResult> {
  return platformRequest<PostAnnouncementResult>(
    "/v1/instaskul/announcements",
    {
      method: "POST",
      body: JSON.stringify(params),
    },
  );
}
