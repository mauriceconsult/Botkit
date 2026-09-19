// import { platformRequest } from "../platformClient.js";
import { platformRequest } from "../platform-client.js";
// PLACEHOLDER contract — confirm real route/body shape against Zuria/Vendly's server code
export async function postZuriaListing(params) {
    return platformRequest("/v1/zuria/listings", {
        method: "POST",
        body: JSON.stringify(params),
    });
}
