"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import DatePicker from "react-datepicker";
import Modal from "react-modal";
import "react-datepicker/dist/react-datepicker.css";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Page() {
  const [session, setSession] = useState(null);
  const [slots, setSlots] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // Ensure react-modal attaches to DOM
  useEffect(() => {
    if (typeof document !== "undefined") {
      Modal.setAppElement(document.body);
    }
  }, []);

  // Manage session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  // Load slots when user logs in
  useEffect(() => {
    if (session?.user) {
      loadSlots();
    } else {
      setSlots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Fetch all slots for the logged-in teacher
  const loadSlots = async () => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("teacher_id", session.user.id)
      .order("start_utc", { ascending: true });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }
    setSlots(data || []);
  };

  // Insert new slot
  const addSlot = async () => {
    if (!startTime || !endTime) return alert("Please select both start and end times.");
    if (endTime <= startTime) return alert("End time must be after start time.");

    const { error } = await supabase.from("slots").insert([
      {
        teacher_id: session.user.id,
        start_utc: startTime.toISOString(),
        end_utc: endTime.toISOString(),
        slot_type: "demo",
        status: "free",
        notes: "Created manually",
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    await loadSlots();
    setIsModalOpen(false);
    setStartTime(null);
    setEndTime(null);
  };

  const signIn = async () => {
    const email = prompt("Enter your email:");
    if (email) {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) alert(error.message);
      else alert("Check your email for the magic link.");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // --- UI ---
  if (!session) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, marginBottom: 16 }}>Eager Birds Scheduler 🐦</h1>
        <button
          onClick={signIn}
          style={{
            background: "#2563eb",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 6,
          }}
        >
          Sign In with Magic Link
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Welcome, {session.user.email}</h2>
        <button onClick={signOut} style={{ color: "#6b7280" }}>
          Sign out
        </button>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: 6,
          marginBottom: 18,
        }}
      >
        + Add New Slot
      </button>

      <ul style={{ color: "#374151", lineHeight: 1.8 }}>
        {slots.length === 0 && <li>No slots yet. Click “+ Add New Slot”.</li>}
        {slots.map((slot) => (
          <li key={slot.id}>
            {new Date(slot.start_utc).toLocaleString()} →{" "}
            {new Date(slot.end_utc).toLocaleString()} —{" "}
            <strong>{slot.status}</strong> ({slot.slot_type})
          </li>
        ))}
      </ul>

      {/* Add slot modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.5)" },
          content: {
            maxWidth: 420,
            margin: "auto",
            inset: 0,
            height: 380,
            padding: 24,
            borderRadius: 12,
          },
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Add a New Slot</h3>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Start Time</label>
          <DatePicker
            selected={startTime}
            onChange={(date) => setStartTime(date)}
            showTimeSelect
            dateFormat="Pp"
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 6 }}>End Time</label>
          <DatePicker
            selected={endTime}
            onChange={(date) => setEndTime(date)}
            showTimeSelect
            dateFormat="Pp"
          />
        </div>

        <button
          onClick={addSlot}
          style={{
            background: "#16a34a",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 6,
          }}
        >
          Save Slot
        </button>
      </Modal>
    </div>
  );
}
