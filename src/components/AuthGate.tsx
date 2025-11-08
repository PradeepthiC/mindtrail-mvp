"use client";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User|null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setReady(true); }), []);
  if (!ready) return <div className="p-6">loading…</div>;
  if (!user) return (
    <div className="min-h-screen grid place-items-center">
      <button onClick={() => signInWithPopup(auth, provider)} className="px-4 py-2 rounded bg-black text-white">
        Continue with Google
      </button>
    </div>
  );
  return (
    <div className="min-h-screen">
      <div className="p-4 flex justify-end">
        <button onClick={() => signOut(auth)} className="text-sm underline">Sign out</button>
      </div>
      {children}
    </div>
  );
}
