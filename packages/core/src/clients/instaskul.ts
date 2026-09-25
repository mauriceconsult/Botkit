// packages/core/src/clients/instaskul.ts
import { getConnectionToken } from "../connections.js";

const INSTASKUL_API_URL =
  process.env.INSTASKUL_API_URL ?? "https://instaskul.com";

export interface PostAnnouncementParams {
  classId: string;
  title: string;
  content: string;
}

export interface PostAnnouncementResult {
  id: string;
  status: string;
}

export interface CourseworkItem {
  id: string;
  title: string;
}

async function instaskulRequest<T>(
  userId: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getConnectionToken(userId, "instaskul");
  const res = await fetch(`${INSTASKUL_API_URL}/api/platform${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok)
    throw new Error(
      `Instaskul API error (${path}): ${res.status} ${await res.text()}`,
    );
  return res.json() as Promise<T>;
}

export function postInstaskulAnnouncement(
  params: PostAnnouncementParams,
): Promise<PostAnnouncementResult> {
  return instaskulRequest<PostAnnouncementResult>(
    "system",
    `/classes/${params.classId}/announcements`,
    {
      method: "POST",
      body: JSON.stringify({ title: params.title, content: params.content }),
    },
  );
}

export function createInstaskulCoursework(
  userId: string,
  courseId: string,
  title: string,
): Promise<CourseworkItem> {
  return instaskulRequest<CourseworkItem>(
    userId,
    `/courses/${courseId}/coursework`,
    {
      method: "POST",
      body: JSON.stringify({ title }),
    },
  );
}

export function listInstaskulCoursework(
  userId: string,
  courseId: string,
): Promise<CourseworkItem[]> {
  return instaskulRequest<CourseworkItem[]>(
    userId,
    `/courses/${courseId}/coursework`,
  );
}
// ...same two-function shape for course, coursenoticeboard, tutorials, assignments, noticeboards
