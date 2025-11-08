"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { authFetch } from "@/lib/authFetch";

type Reflection = { id?: string; text_raw: string; insight: string; topics: string[]; created_at: number; };

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Reflection[]>([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const col = collection(db, "users", uid, "reflections");
    const q = query(col, orderBy("created_at", "desc"));
    return onSnapshot(q, snap => setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))));
  }, [auth.currentUser]);

  async function handleReflect() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setText("");
    } catch (e:any) {
      alert(e.message);
    } finally { setLoading(false); }
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-3">What did you learn today?</h1>
      <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full border rounded p-3 min-h-[120px]" placeholder="1–2 sentences…"/>
      <button onClick={handleReflect} disabled={loading} className="mt-3 px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">
        {loading ? "Reflecting…" : "Reflect"}
      </button>

      <div className="mt-8 space-y-3">
        {items.map(r => (
          <div key={r.id} className="border rounded p-3">
            <div className="text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
            <div className="mt-1 font-medium">Insight: {r.insight}</div>
            {!!r.topics?.length && <div className="mt-1 text-sm">Topics: {r.topics.join(", ")}</div>}
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer">Your note</summary>
              <p className="mt-1 text-gray-700">{r.text_raw}</p>
            </details>
          </div>
        ))}
      </div>
    </main>
  );
}
