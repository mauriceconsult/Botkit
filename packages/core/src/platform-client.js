import { config } from "./config.js";
export async function platformRequest(path, init = {}) {
    const res = await fetch(`${config.PLATFORM_API_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            PLATFORM_API_KEY: config.PLATFORM_API_KEY,
            ...(init.headers ?? {}),
        },
    });
    if (!res.ok) {
        throw new Error(`Platform API error (${path}): ${res.status} ${await res.text()}`);
    }
    return res.json();
}
