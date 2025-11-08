import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function ensureAdmin() {
  if (!getApps().length) {
    const cred = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
      : applicationDefault();
    initializeApp({ credential: cred, projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureAdmin();
    const idToken = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!idToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(idToken);
    const { text } = await req.json();
    if (!text || text.trim().length < 5) {
      return NextResponse.json({ error: "Add a bit more detail." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const prompt = `You are a concise learning coach. Summarize the user's note into a single actionable insight (<= 40 words) and 1-3 short topics.
Return strict JSON: { "insight": "...", "topics": ["t1","t2"] }.

User note:
${text}`;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 160,
      response_format: { type: "json_object" } as any,
    });

    const parsed = JSON.parse(resp.choices[0].message.content || "{}");
    const insight = parsed.insight || "";
    const topics = Array.isArray(parsed.topics) ? parsed.topics.slice(0,3) : [];

    const db = getFirestore();
    await db.collection("users").doc(decoded.uid).collection("reflections").add({
      text_raw: text, insight, topics, created_at: Date.now(),
    });

    return NextResponse.json({ ok: true, insight, topics });
  } catch (e:any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
