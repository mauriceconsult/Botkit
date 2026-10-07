import { getConnectionToken } from "../connections.js";

const ZURIA_API_URL = process.env.ZURIA_API_URL ?? "https://zuria.maxnovate.com";

async function dukabodaRequest<T>(userId: string, path: string, init: RequestInit = {}): Promise<T> {
  // Dukaboda's backend lives in Zuria — reuses the "zuria" connection, not a separate one
  const token = await getConnectionToken(userId, "zuria");
  const res = await fetch(`${ZURIA_API_URL}/api/platform${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Dukaboda API error (${path}): ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export interface Rider {
  id: string; clerkId: string; name: string; phone: string; email?: string; vehicleType: string; isActive: boolean;
}
export interface DeliveryJob {
  id: string; orderId: string; status: string;
  pickupAddress: string; pickupLat: number; pickupLng: number; pickupName: string; pickupPhone: string;
  dropoffAddress: string; dropoffLat: number; dropoffLng: number; dropoffName: string; dropoffPhone: string;
  deliveryCost: number; currency: string; createdAt: string; acceptedAt?: string; deliveredAt?: string;
}

export function registerDukabodaRider(userId: string, name: string, phone: string, vehicleType: string, email?: string): Promise<Rider> {
  return dukabodaRequest(userId, `/riders`, { method: "POST", body: JSON.stringify({ name, phone, vehicleType, email }) });
}
export function getDukabodaRiderProfile(userId: string): Promise<Rider> {
  return dukabodaRequest(userId, `/riders/me`);
}
export function setDukabodaRiderActive(userId: string, isActive: boolean): Promise<Rider> {
  return dukabodaRequest(userId, `/riders/me`, { method: "PATCH", body: JSON.stringify({ isActive }) });
}

export function listDukabodaAvailableJobs(userId: string, status = "pending"): Promise<DeliveryJob[]> {
  return dukabodaRequest(userId, `/delivery/jobs?status=${encodeURIComponent(status)}`);
}
export function listDukabodaMyJobs(userId: string, status?: string): Promise<DeliveryJob[]> {
  return dukabodaRequest(userId, `/delivery/jobs/mine${status ? `?status=${encodeURIComponent(status)}` : ""}`);
}
export function acceptDukabodaJob(userId: string, jobId: string): Promise<DeliveryJob> {
  return dukabodaRequest(userId, `/delivery/jobs/${jobId}/accept`, { method: "PATCH" });
}
export function updateDukabodaJobStatus(userId: string, jobId: string, status: string, lat?: number, lng?: number): Promise<DeliveryJob> {
  return dukabodaRequest(userId, `/delivery/jobs/${jobId}/status`, { method: "PATCH", body: JSON.stringify({ status, lat, lng }) });
}