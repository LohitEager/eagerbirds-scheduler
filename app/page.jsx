"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client using your environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Handle login with magic link
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Check your email for the login link!");
    setLoading(false);
  }

  // Fetch existing slots
  useEffect(() => {
    if (!user) return;
    fetchSlots();
  }, [user]);

  async function fetchSlots() {
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("teacher_id", user?.id)
      .order("start_utc", { ascending: true });

    if (error) console.error(error);
    else setSlots(data || []);
  }

  async function addSlot() {
    const start = prompt("Enter start time (YYYY-MM-DD HH:mm):");
    const end = prompt("Enter end time (YYYY-MM-DD HH:mm):");
    if (!start || !end) return;

    const { error } = await supabase.from("slots").insert({
      teacher_id: user.id,
      start_utc: new Date(start).toISOString(),
      end_utc: new Date(end).toISOString(),
      slot_type: "demo",
      status: "free"
    });

    if (error) alert(error.message);
    else {
      alert("Slot added successfully!");
      fetchSlots();
    }
  }

  // Logout
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  // UI
  if (!user)
    return (
      <main style={{ padding: 50, textAlign: "center" }}>
        <h1>🐦 Eager Birds Scheduler</h1>
        <p>Login with your email to manage your demo & class slots.</p>
        <form onSubmit={handleLogin} style={{ marginTop: 20 }}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: 10, width: 250 }}
          />
          <br />
          <button type="submit" style={{ marginTop: 10, padding: "8px 20px" }}>
            {loading ? "Sending link..." : "Send Magic Link"}
          </button>
        </form>
      </main>
    );

  return (
    <main style={{ padding: 50 }}>
      <h1>Welcome, {user.email}</h1>
      <button onClick={logout} style={{ marginBottom: 20 }}>
        Logout
      </button>

      <h2>Your Slots</h2>
      <button onClick={addSlot} style={{ margin: "10px 0" }}>
        + Add New Slot
      </button>

      <ul>
        {slots.map((s) => (
          <li key={s.id}>
            {new Date(s.start_utc).toLocaleString()} →{" "}
            {new Date(s.end_utc).toLocaleString()} ({s.status})
          </li>
        ))}
      </ul>

      {slots.length === 0 && <p>No slots yet. Add one above.</p>}
    </main>
  );
}
