"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client (uses NEXT_PUBLIC_* env vars)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [slots, setSlots] = useState([]);
  const [sending, setSending] = useState(false);

  // Keep session in state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user || null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function sendMagicLink(e) {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setSending(false);
    if (error) return alert(error.message);
    alert("Magic link sent. Check your email to finish login.");
  }

  // Load teacher's slots
  useEffect(() => {
    if (!user) return;
    loadSlots();
  }, [user]);

  async function loadSlots() {
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("teacher_id", user.id)
      .order("start_utc", { ascending: true });
    if (error) return alert(error.message);
    setSlots(data || []);
  }

  async function addSlot() {
    const start = prompt("Start (YYYY-MM-DD HH:mm in your local time):");
    const end = prompt("End (YYYY-MM-DD HH:mm in your local time):");
    if (!start || !end) return;

    const startISO = new Date(start.replace(" ", "T") + ":00").toISOString();
    const endISO = new Date(end.replace(" ", "T") + ":00").toISOString();

    const { error } = await supabase.from("slots").insert({
      teacher_id: user.id,
      start_utc: startISO,
      end_utc: endISO,
      slot_type: "demo",
      status: "free"
    });
    if (error) return alert(error.message);
    alert("Slot added");
    loadSlots();
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSlots([]);
  }

  if (!user) {
    return (
      <main style={{ padding: 32, width: 420 }}>
        <h1 style={{ marginBottom: 8 }}>🐦 Eager Birds Scheduler</h1>
        <p style={{ marginTop: 0 }}>
          Login with your email. We’ll send a one-click magic link.
        </p>
        <form onSubmit={sendMagicLink} style={{ marginTop: 16 }}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cfe0ff" }}
          />
          <button
            type="submit"
            disabled={sending}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: "#4EB2F4",
              color: "#052447",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {sending ? "Sending…" : "Send Magic Link"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ padding: 32, maxWidth: 720, width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Welcome, {user.email}</h2>
        <button onClick={signOut} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cfe0ff", background: "white", cursor: "pointer" }}>
          Sign out
        </button>
      </div>

      <hr style={{ margin: "16px 0", borderColor: "#e6eefc" }} />

      <h3 style={{ marginTop: 0 }}>Your Slots</h3>
      <button onClick={addSlot} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#4EB2F4", color: "#052447", fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>
        + Add New Slot
      </button>

      {slots.length === 0 ? (
        <p>No slots yet. Click “+ Add New Slot”.</p>
      ) : (
        <ul style={{ paddingLeft: 16 }}>
          {slots.map((s) => (
            <li key={s.id} style={{ marginBottom: 8 }}>
              {new Date(s.start_utc).toLocaleString()} → {new Date(s.end_utc).toLocaleString()} — <b>{s.status}</b> ({s.slot_type})
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
