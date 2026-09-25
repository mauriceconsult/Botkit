// import { platformRequest } from "../platformClient.js";
import { platformRequest } from "../platform-client.js";
// PLACEHOLDER contract — confirm real route/body shape against Instaskul's server code
export async function postInstaskulAnnouncement(params) {
    return platformRequest("/v1/instaskul/announcements", {
        method: "POST",
        body: JSON.stringify(params),
    });
}
