"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "react-modal";
import "react-datepicker/dist/react-datepicker.css";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CalendarPage() {
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (typeof document !== "undefined") Modal.setAppElement(document.body);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) loadSlots();
  }, [session?.user?.id]);

  const loadSlots = async () => {
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("teacher_id", session.user.id);

    if (error) {
      console.error(error);
      return;
    }

    // Convert Supabase slots into FullCalendar events
    const formatted = data.map((slot) => ({
      id: slot.id,
      title: `${slot.slot_type.toUpperCase()} (${slot.status})`,
      start: slot.start_utc,
      end: slot.end_utc,
      color: slot.status === "free" ? "#4EB2F4" : "#16a34a",
    }));

    setEvents(formatted);
  };

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setIsModalOpen(true);
  };

  const addSlot = async () => {
    const start = new Date(selectedDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

    const { error } = await supabase.from("slots").insert([
      {
        teacher_id: session.user.id,
        start_utc: start.toISOString(),
        end_utc: end.toISOString(),
        slot_type: "demo",
        status: "free",
        notes: "Added via calendar",
      },
    ]);

    if (error) alert(error.message);
    else {
      setIsModalOpen(false);
      await loadSlots();
    }
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
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg,#f9fbff 0%,#e7f5ff 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 style={{ fontSize: 26, marginBottom: 10 }}>Eager Birds Calendar 🗓️</h1>
        <button
          onClick={signIn}
          style={{
            background: "#4EB2F4",
            color: "#fff",
            padding: "12px 22px",
            borderRadius: 10,
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sign In with Magic Link
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#f9fbff 0%,#e7f5ff 100%)",
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>
          Welcome, <span style={{ color: "#4EB2F4" }}>{session.user.email}</span>
        </h2>
        <button
          onClick={signOut}
          style={{
            border: "1px solid #ccc",
            background: "none",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          padding: 20,
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable={true}
          dateClick={handleDateClick}
          events={events}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="80vh"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.6)" },
          content: {
            maxWidth: 400,
            margin: "auto",
            inset: 0,
            padding: 24,
            borderRadius: 12,
          },
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          Add slot on {selectedDate}
        </h3>
        <p style={{ color: "#6b7280", marginBottom: 20 }}>
          This will create a 1-hour free demo slot.
        </p>
        <button
          onClick={addSlot}
          style={{
            background: "#4EB2F4",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
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
