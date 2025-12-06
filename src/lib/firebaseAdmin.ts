// src/lib/firebaseAdmin.ts
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !rawPrivateKey) {
  throw new Error(
    "[firebaseAdmin] Missing env vars: NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
  );
}

// Handle both cases:
// - rawPrivateKey contains literal '\n'
// - or it already has real newlines
let privateKey = rawPrivateKey;

// Remove wrapping quotes if they got included by mistake
if (
  privateKey.startsWith('"') &&
  privateKey.endsWith('"')
) {
  privateKey = privateKey.slice(1, -1);
}

// Convert \n → real newlines if needed
if (privateKey.includes("\\n")) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    : getApps()[0];

export const adminDb = getFirestore(app);
