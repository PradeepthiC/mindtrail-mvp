"use client";
import { auth } from "./firebase";

export async function authFetch(url: string, init: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  return fetch(url, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${token || ""}` } });
}
