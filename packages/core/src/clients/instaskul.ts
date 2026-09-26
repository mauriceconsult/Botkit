// packages/core/src/clients/instaskul.ts
import { getConnectionToken } from "../connections.js";

const INSTASKUL_API_URL =
  process.env.INSTASKUL_API_URL ?? "https://instaskul.com";

export interface InstaskulResource {
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

// ── Course ───────────────────────────────────────────────────────────────
export function createInstaskulCourse(
  userId: string,
  title: string,
): Promise<InstaskulResource> {
  return instaskulRequest(userId, `/courses`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}
export function listInstaskulCourses(
  userId: string,
): Promise<InstaskulResource[]> {
  return instaskulRequest(userId, `/courses`);
}

// ── Coursework ───────────────────────────────────────────────────────────
export function createInstaskulCoursework(
  userId: string,
  courseId: string,
  title: string,
): Promise<InstaskulResource> {
  return instaskulRequest(userId, `/courses/${courseId}/coursework`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}
export function listInstaskulCoursework(
  userId: string,
  courseId: string,
): Promise<InstaskulResource[]> {
  return instaskulRequest(userId, `/courses/${courseId}/coursework`);
}

// ── Course noticeboard ──────────────────────────────────────────────────
export function createInstaskulCourseNoticeboard(
  userId: string,
  courseId: string,
  title: string,
): Promise<InstaskulResource> {
  return instaskulRequest(userId, `/courses/${courseId}/coursenoticeboards`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}
export function listInstaskulCourseNoticeboards(
  userId: string,
  courseId: string,
): Promise<InstaskulResource[]> {
  return instaskulRequest(userId, `/courses/${courseId}/coursenoticeboards`);
}

// ── Tutorial ─────────────────────────────────────────────────────────────
export function createInstaskulTutorial(
  userId: string,
  courseId: string,
  title: string,
): Promise<InstaskulResource> {
  return instaskulRequest(userId, `/courses/${courseId}/tutorials`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}
export function listInstaskulTutorials(
  userId: string,
  courseId: string,
): Promise<InstaskulResource[]> {
  return instaskulRequest(userId, `/courses/${courseId}/tutorials`);
}

// ── Assignment (nested under tutorial) ──────────────────────────────────
export function createInstaskulAssignment(
  userId: string,
  courseId: string,
  tutorialId: string,
  title: string,
): Promise<InstaskulResource> {
  return instaskulRequest(
    userId,
    `/courses/${courseId}/tutorials/${tutorialId}/assignments`,
    { method: "POST", body: JSON.stringify({ title }) },
  );
}
export function listInstaskulAssignments(
  userId: string,
  courseId: string,
  tutorialId: string,
): Promise<InstaskulResource[]> {
  return instaskulRequest(
    userId,
    `/courses/${courseId}/tutorials/${tutorialId}/assignments`,
  );
}

// ── Noticeboard (top-level, admin-scoped) ───────────────────────────────
export function createInstaskulNoticeboard(
  userId: string,
  title: string,
): Promise<InstaskulResource> {
  return instaskulRequest(userId, `/noticeboards`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}
export function listInstaskulNoticeboards(
  userId: string,
): Promise<InstaskulResource[]> {
  return instaskulRequest(userId, `/noticeboards`);
}
