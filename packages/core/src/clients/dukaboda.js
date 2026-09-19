// import { platformRequest } from "../platformClient.js";
import { platformRequest } from "../platform-client.js";
// PLACEHOLDER contract — confirm real route/body shape against Dukaboda's server code
export async function postDukabodaDelivery(params) {
    return platformRequest("/v1/dukaboda/deliveries", {
        method: "POST",
        body: JSON.stringify(params),
    });
}
