"use client";
import { auth } from "./firebase";

export async function authFetch(url: string, init: RequestInit = {}) {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : "";
  return fetch(url, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
  });
}
