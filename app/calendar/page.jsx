"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// 🧠 Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [session, setSession] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // ✅ Get session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ✅ Fetch slots
  useEffect(() => {
    if (!session?.user) return;
    fetchSlots();
  }, [session?.user?.email]);

  const fetchSlots = async () => {
    setLoading(true);
    let query = supabase.from("slots").select("*");

    if (session?.user?.email !== "lohit@eagerbirds.com") {
      query = query.eq("teacher_id", session.user.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error(error);
      alert("Error loading slots");
    } else {
      const formatted = data.map((slot) => ({
        id: slot.id,
        title:
          slot.slot_type === "demo"
            ? `🟢 Demo (${slot.status})`
            : `🟣 ${slot.slot_type || "Slot"}`,
        start: new Date(slot.start_utc),
        end: new Date(slot.end_utc),
        resource: slot.teacher_id,
      }));
      setSlots(formatted);
    }

    setLoading(false);
  };

  // ✅ Add new slot
  const addSlot = async () => {
    if (!selectedSlot) return;

    const { start, end } = selectedSlot;
    if (!start || !end) {
      alert("Invalid time range");
      return;
    }

    const { error } = await supabase.from("slots").insert([
      {
        teacher_id: session.user.id,
        start_utc: start.toISOString(),
        end_utc: end.toISOString(),
        slot_type: "available",
        status: "free",
        notes: "Added via calendar",
      },
    ]);

    if (error) {
      alert("Error adding slot: " + error.message);
    } else {
      setModalOpen(false);
      setSelectedSlot(null);
      fetchSlots();
    }
  };

  // ✅ Handle calendar click
  const handleSelectSlot = ({ start, end }) => {
    if (session?.user?.email === "lohit@eagerbirds.com") {
      alert("Admins cannot add slots here.");
      return;
    }
    setSelectedSlot({ start, end });
    setModalOpen(true);
  };

  if (!session) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px 20px",
          background: "linear-gradient(180deg,#f9fbff 0%,#e7f5ff 100%)",
          minHeight: "100vh",
        }}
      >
        <img
          src="https://res.cloudinary.com/da3twnvrl/image/upload/v1762696175/Video-Generation-Successful-unscreen_dx5ujt.gif"
          alt="Eager Birds Mascot"
          style={{ width: 150, marginBottom: 20 }}
        />
        <h2 style={{ color: "#0d203a" }}>Please sign in to view your calendar 🐦</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #EAF6FF 0%, #FFFFFF 100%)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          padding: "30px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#1E3A8A",
            fontSize: "26px",
            fontWeight: "700",
            marginBottom: "30px",
          }}
        >
          🐦 Eager Birds —{" "}
          {session.user.email === "lohit@eagerbirds.com" ? "Admin" : "Teacher"} Calendar
        </h1>

        {loading ? (
          <p style={{ textAlign: "center", color: "#6b7280" }}>Loading slots...</p>
        ) : (
          <Calendar
            localizer={localizer}
            events={slots}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelectSlot}
            style={{ height: 600 }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor:
                  session.user.email === "lohit@eagerbirds.com"
                    ? "#4EB2F4"
                    : "#16a34a",
                borderRadius: "10px",
                border: "none",
                color: "white",
              },
            })}
          />
        )}

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <a
            href="/"
            style={{
              background: "#2563EB",
              color: "white",
              padding: "10px 18px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            ← Back to Slots
          </a>
        </div>
      </div>

      {modalOpen && selectedSlot && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px 30px",
              width: "400px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                color: "#0d203a",
                fontWeight: "700",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              Add New Slot
            </h3>

            <p style={{ color: "#374151", fontSize: 15, textAlign: "center" }}>
              {moment(selectedSlot.start).format("MMMM D, h:mm A")} →{" "}
              {moment(selectedSlot.end).format("h:mm A")}
            </p>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                onClick={addSlot}
                style={{
                  background: "#16a34a",
                  color: "#fff",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginRight: 10,
                }}
              >
                Save
              </button>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "#e5e7eb",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
