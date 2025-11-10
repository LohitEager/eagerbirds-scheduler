"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  // 🔹 Fetch slots
  useEffect(() => {
    if (session?.user) loadSlots();
  }, [session?.user?.id]);

  const loadSlots = async () => {
    setLoading(true);
    let query = supabase.from("slots").select("*").order("start_utc", { ascending: true });

    // Admin check
    if (session.user.email !== "lohit@eagerbirds.com") {
      query = query.eq("teacher_id", session.user.id);
    }

    const { data, error } = await query;
    if (error) {
      alert("Error fetching slots: " + error.message);
      setLoading(false);
      return;
    }

    const formatted = (data || []).map((slot) => ({
      id: slot.id,
      title: `${slot.slot_type} (${slot.status})`,
      start: new Date(slot.start_utc),
      end: new Date(slot.end_utc),
      teacher_id: slot.teacher_id,
      status: slot.status,
    }));

    setEvents(formatted);
    setLoading(false);
  };

  // 🔹 Add new slot on calendar click
  const handleSelectSlot = async ({ start, end }) => {
    if (session.user.email === "lohit@eagerbirds.com") {
      alert("Admins cannot add slots.");
      return;
    }

    if (!window.confirm(`Add a new slot from ${start.toLocaleString()} to ${end.toLocaleString()}?`)) return;

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
    else loadSlots();
  };

  // 🔹 Color coding
  const eventStyleGetter = (event) => {
    let bg = "#4EB2F4"; // default blue
    if (event.status === "free") bg = "#16a34a";
    if (event.status === "booked") bg = "#9ca3af";
    if (session.user.email === "lohit@eagerbirds.com") bg = "#f59e0b"; // yellow for admin view
    return {
      style: {
        backgroundColor: bg,
        borderRadius: "8px",
        opacity: 0.9,
        color: "#fff",
        border: "none",
        display: "block",
      },
    };
  };

  // 🔹 If not logged in
  if (!session) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: "#0d203a",
          background: "linear-gradient(180deg,#f9fbff 0%,#e7f5ff 100%)",
          textAlign: "center",
        }}
      >
        <img
          src="https://res.cloudinary.com/da3twnvrl/image/upload/v1762696175/Video-Generation-Successful-unscreen_dx5ujt.gif"
          alt="Eager Birds mascot"
          style={{ width: 120, marginBottom: 20 }}
        />
        <h2>Eager Birds Scheduler</h2>
        <p>Please sign in to view your calendar.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        padding: 20,
        background: "linear-gradient(180deg, #f9fbff 0%, #e7f5ff 100%)",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#0d203a", marginBottom: 20 }}>
        {session.user.email === "lohit@eagerbirds.com"
          ? "Admin Calendar View"
          : "My Teaching Calendar"}
      </h2>

      {loading ? (
        <p style={{ textAlign: "center", color: "#6b7280" }}>Loading slots...</p>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          defaultView="week"
          style={{
            height: "80vh",
            background: "#fff",
            borderRadius: "16px",
            padding: "10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
          eventPropGetter={eventStyleGetter}
        />
      )}
    </div>
  );
}
