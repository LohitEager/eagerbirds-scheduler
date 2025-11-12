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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotType, setSlotType] = useState("demo");

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

  const addSlot = async () => {
    if (!startTime || !endTime) return alert("Please select start and end times.");
    if (new Date(endTime) <= new Date(startTime))
      return alert("End time must be after start time.");
    const { error } = await supabase.from("slots").insert([
      {
        teacher_id: session.user.id,
        start_utc: new Date(startTime).toISOString(),
        end_utc: new Date(endTime).toISOString(),
        slot_type: slotType,
        status: "free",
        notes: "Created via Add Slot button",
      },
    ]);
    if (error) return alert(error.message);
    await loadSlots();
    setIsModalOpen(false);
    setStartTime("");
    setEndTime("");
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
        position: "relative",
      }}
    >
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
            selectable={false}
            defaultView="week"
            style={{ height: "80vh" }}
            eventPropGetter={eventStyleGetter}
            views={["month", "week", "day", "agenda"]}
            popup
          />
        )}
      </div>

      {/* Floating Add Slot Button */}
      {session.user.email !== "lohit@eagerbirds.com" && (
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            position: "fixed",
            bottom: "40px",
            right: "40px",
            background: "#4EB2F4",
            border: "none",
            borderRadius: "50%",
            width: "65px",
            height: "65px",
            color: "#fff",
            fontSize: "32px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 8px 16px rgba(78,178,244,0.4)",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.background = "#3490dc")}
          onMouseOut={(e) => (e.target.style.background = "#4EB2F4")}
        >
          +
        </button>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 16,
              width: "90%",
              maxWidth: 420,
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
            <h3 style={{ marginBottom: 16, color: "#0d203a", textAlign: "center" }}>
              Add a New Slot
            </h3>

            <label style={{ fontWeight: 500 }}>Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{
                width: "100%",
                margin: "8px 0 14px",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />

            <label style={{ fontWeight: 500 }}>End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{
                width: "100%",
                margin: "8px 0 14px",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />

            <label style={{ fontWeight: 500 }}>Slot Type</label>
            <select
              value={slotType}
              onChange={(e) => setSlotType(e.target.value)}
              style={{
                width: "100%",
                margin: "8px 0 18px",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            >
              <option value="demo">Demo</option>
              <option value="class">Class</option>
              <option value="break">Break</option>
              <option value="meeting">Meeting</option>
            </select>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "#e5e7eb",
                  color: "#111827",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 18px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={addSlot}
                style={{
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 18px",
                  cursor: "pointer",
                }}
              >
                Save Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
