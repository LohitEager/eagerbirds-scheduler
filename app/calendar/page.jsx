"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) =>
      setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) loadSlots();
  }, [session?.user?.id]);

  const loadSlots = async () => {
    setLoading(true);
    let query = supabase.from("slots").select("*").order("start_utc", { ascending: true });
    if (session.user.email !== "lohit@eagerbirds.com") {
      query = query.eq("teacher_id", session.user.id);
    }

    const { data, error } = await query;
    if (error) {
      alert(error.message);
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

  const handleSelectSlot = async ({ start, end }) => {
    if (session.user.email === "lohit@eagerbirds.com") {
      alert("Admins cannot add slots.");
      return;
    }
    if (!window.confirm(`Add a new slot from ${start.toLocaleString()} to ${end.toLocaleString()}?`))
      return;

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

  const eventStyleGetter = (event) => {
    let bg = "#4EB2F4";
    if (event.status === "free") bg = "#16a34a";
    if (event.status === "booked") bg = "#9ca3af";
    if (session.user.email === "lohit@eagerbirds.com") bg = "#f59e0b";
    return {
      style: {
        backgroundColor: bg,
        borderRadius: "10px",
        opacity: 0.9,
        color: "#fff",
        border: "none",
        boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
      },
    };
  };

  if (!session) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg,#e3f3ff 0%,#f7fbff 100%)",
          textAlign: "center",
          color: "#0d203a",
        }}
      >
        <img
          src="https://res.cloudinary.com/da3twnvrl/image/upload/v1762696175/Video-Generation-Successful-unscreen_dx5ujt.gif"
          alt="Eager Birds mascot"
          style={{ width: 140, marginBottom: 18 }}
        />
        <h1>Eager Birds Scheduler 🐦</h1>
        <p style={{ color: "#6b7280" }}>Please sign in to view your calendar.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#dff3ff 0%,#f7fbff 100%)",
        padding: "20px 10px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          background: "linear-gradient(90deg,#4EB2F4 0%,#5fc8f8 100%)",
          color: "#fff",
          borderRadius: "16px",
          padding: "14px 20px",
          margin: "0 auto 20px",
          maxWidth: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src="https://res.cloudinary.com/da3twnvrl/image/upload/v1762696175/Video-Generation-Successful-unscreen_dx5ujt.gif"
          alt="Eager Birds mascot"
          style={{ width: 60, height: 60 }}
        />
        <h2 style={{ margin: 0, fontWeight: 700 }}>
          {session.user.email === "lohit@eagerbirds.com"
            ? "Admin Calendar View"
            : "My Teaching Calendar"}
        </h2>
      </div>

      {/* Calendar Container */}
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          background: "#fff",
          borderRadius: "18px",
          padding: 20,
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        }}
      >
        {loading ? (
          <p style={{ textAlign: "center", color: "#6b7280" }}>Loading slots...</p>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            step={30}
            timeslots={2}
            selectable
            onSelectSlot={handleSelectSlot}
            defaultView="week"
            style={{ height: "80vh" }}
            eventPropGetter={eventStyleGetter}
            views={["month", "week", "day", "agenda"]}
            popup
          />
        )}
      </div>
    </div>
  );
}
