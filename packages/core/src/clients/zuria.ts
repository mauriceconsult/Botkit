import { getConnectionToken } from "../connections.js";

const ZURIA_API_URL = process.env.ZURIA_API_URL ?? "https://zuria.maxnovate.com";

export interface ZuriaResource {
  id: string;
  [key: string]: unknown;
}

async function zuriaRequest<T>(userId: string, path: string, init: RequestInit = {}): Promise<T> {
  const token = await getConnectionToken(userId, "zuria");
  const res = await fetch(`${ZURIA_API_URL}/api/platform${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Zuria API error (${path}): ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ── Shop (top-level) ─────────────────────────────────────────────────────
export function createZuriaShop(userId: string, name: string): Promise<ZuriaResource> {
  return zuriaRequest(userId, `/shops`, { method: "POST", body: JSON.stringify({ name }) });
}
export function listZuriaShops(userId: string): Promise<ZuriaResource[]> {
  return zuriaRequest(userId, `/shops`);
}

// ── Billboard ────────────────────────────────────────────────────────────
export function createZuriaBillboard(userId: string, shopId: string, label: string, imageUrl: string): Promise<ZuriaResource> {
  return zuriaRequest(userId, `/shops/${shopId}/billboards`, { method: "POST", body: JSON.stringify({ label, imageUrl }) });
}
export function listZuriaBillboards(userId: string, shopId: string): Promise<ZuriaResource[]> {
  return zuriaRequest(userId, `/shops/${shopId}/billboards`);
}

// ── Category (needs billboardId) ────────────────────────────────────────
export function createZuriaCategory(userId: string, shopId: string, name: string, billboardId: string): Promise<ZuriaResource> {
  return zuriaRequest(userId, `/shops/${shopId}/categories`, { method: "POST", body: JSON.stringify({ name, billboardId }) });
}
export function listZuriaCategories(userId: string, shopId: string): Promise<ZuriaResource[]> {
  return zuriaRequest(userId, `/shops/${shopId}/categories`);
}

// ── Color ────────────────────────────────────────────────────────────────
export function createZuriaColor(userId: string, shopId: string, name: string, value: string): Promise<ZuriaResource> {
  return zuriaRequest(userId, `/shops/${shopId}/colors`, { method: "POST", body: JSON.stringify({ name, value }) });
}
export function listZuriaColors(userId: string, shopId: string): Promise<ZuriaResource[]> {
  return zuriaRequest(userId, `/shops/${shopId}/colors`);
}

// ── Size ─────────────────────────────────────────────────────────────────
export function createZuriaSize(userId: string, shopId: string, name: string, value: string): Promise<ZuriaResource> {
  return zuriaRequest(userId, `/shops/${shopId}/sizes`, { method: "POST", body: JSON.stringify({ name, value }) });
}
export function listZuriaSizes(userId: string, shopId: string): Promise<ZuriaResource[]> {
  return zuriaRequest(userId, `/shops/${shopId}/sizes`);
}

// ── Product (needs categoryId, colorId, sizeId, images) ─────────────────
export interface CreateProductParams {
  name: string;
  price: number;
  categoryId: string;
  colorId: string;
  sizeId: string;
  images: { url: string }[];
  isFeatured?: boolean;
  isArchived?: boolean;
}
export function createZuriaProduct(userId: string, shopId: string, params: CreateProductParams): Promise<ZuriaResource> {
  return zuriaRequest(userId, `/shops/${shopId}/products`, { method: "POST", body: JSON.stringify(params) });
}
export function listZuriaProducts(userId: string, shopId: string): Promise<ZuriaResource[]> {
  return zuriaRequest(userId, `/shops/${shopId}/products`);
}