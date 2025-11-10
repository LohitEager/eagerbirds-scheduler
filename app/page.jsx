"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import DatePicker from "react-datepicker";
import Modal from "react-modal";
import "react-datepicker/dist/react-datepicker.css";

// Supabase setup
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

  useEffect(() => {
    if (typeof document !== "undefined") {
      Modal.setAppElement(document.body);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) loadSlots();
  }, [session?.user?.id]);

  const loadSlots = async () => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("teacher_id", session.user.id)
      .order("start_utc", { ascending: true });
    if (error) {
      alert(error.message);
      return;
    }
    setSlots(data || []);
  };

  const addSlot = async () => {
    if (!startTime || !endTime) return alert("Select both start and end times.");
    if (endTime <= startTime) return alert("End must be after start.");
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
    if (error) return alert(error.message);
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
      else alert("Check your email for the magic link!");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // UI ---------------------------------------------------------
  if (!session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #000428 0%, #004e92 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <img
          src="https://res.cloudinary.com/da3twnvrl/image/upload/v1762696175/Video-Generation-Successful-unscreen_dx5ujt.gif"
          alt="Eager Birds Mascot"
          style={{
            width: 200,
            animation: "float 3s ease-in-out infinite",
            marginBottom: 20,
          }}
        />
        <h1 style={{ fontSize: 34, marginBottom: 10, fontWeight: "700" }}>
          Eager Birds Scheduler 🐦
        </h1>
        <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 24 }}>
          Log in to manage your available teaching slots
        </p>
        <button
          onClick={signIn}
          style={{
            background: "#4EB2F4",
            color: "#fff",
            border: "none",
            padding: "14px 28px",
            borderRadius: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 16,
            boxShadow: "0 6px 20px rgba(78,178,244,0.4)",
            transition: "transform 0.2s ease, background 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1.0)")}
        >
          Sign In with Magic Link
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #000428 0%, #004e92 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "50px 20px",
        color: "#fff",
      }}
    >
      {/* Hero Section */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <img
          src="https://res.cloudinary.com/da3twnvrl/image/upload/v1762696175/Video-Generation-Successful-unscreen_dx5ujt.gif"
          alt="Eager Birds Mascot"
          style={{
            width: 160,
            animation: "float 3s ease-in-out infinite",
          }}
        />
        <h1 style={{ fontSize: 32, fontWeight: 700, marginTop: 10 }}>
          Teacher Dashboard
        </h1>
        <p style={{ fontSize: 16, opacity: 0.85 }}>
          Manage your slots and availability below
        </p>
      </div>

      {/* Dashboard Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          padding: 30,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          maxWidth: 700,
          width: "100%",
          textAlign: "center",
          color: "#0d203a",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>
            Welcome,{" "}
            <span style={{ color: "#4EB2F4" }}>{session.user.email}</span>
          </h2>
          <button
            onClick={signOut}
            style={{
              background: "none",
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            Sign Out
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            background: "#4EB2F4",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            marginBottom: 18,
            boxShadow: "0 4px 14px rgba(78,178,244,0.3)",
            transition: "transform 0.2s ease",
          }}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1.0)")}
        >
          + Add New Slot
        </button>

        <ul style={{ color: "#374151", textAlign: "left", lineHeight: 1.8 }}>
          {slots.length === 0 && (
            <li style={{ color: "#6b7280" }}>
              No slots yet. Click “+ Add New Slot”.
            </li>
          )}
          {slots.map((slot) => (
            <li
              key={slot.id}
              style={{
                background: "#f3f8ff",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 8,
                fontSize: 15,
              }}
            >
              <strong style={{ color: "#0d203a" }}>
                {new Date(slot.start_utc).toLocaleString()}
              </strong>{" "}
              → {new Date(slot.end_utc).toLocaleString()}{" "}
              <span style={{ color: "#4EB2F4", fontWeight: 600 }}>
                {slot.status.toUpperCase()}
              </span>{" "}
              <span style={{ color: "#6b7280" }}>({slot.slot_type})</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.6)" },
          content: {
            maxWidth: 420,
            margin: "auto",
            inset: 0,
            height: 420,
            padding: 30,
            borderRadius: 16,
            border: "none",
            backdropFilter: "blur(12px)",
            background: "rgba(255,255,255,0.9)",
          },
        }}
      >
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0d203a", marginBottom: 16 }}>
          Add a New Slot
        </h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#374151" }}>
            Start Time
          </label>
          <DatePicker
            selected={startTime}
            onChange={(date) => setStartTime(date)}
            showTimeSelect
            timeIntervals={30}
            dateFormat="Pp"
            className="datepicker-input"
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#374151" }}>
            End Time
          </label>
          <DatePicker
            selected={endTime}
            onChange={(date) => setEndTime(date)}
            showTimeSelect
            timeIntervals={30}
            dateFormat="Pp"
          />
        </div>

        <button
          onClick={addSlot}
          style={{
            background: "#16a34a",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 10,
            border: "none",
            width: "100%",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Save Slot
        </button>
      </Modal>
    </div>
  );
}
