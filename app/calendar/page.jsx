"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// Correct FullCalendar CSS imports
import "@fullcalendar/daygrid/index.css";
import "@fullcalendar/timegrid/index.css";

export default function CalendarPage() {
  // Handle clicks on calendar dates
  const handleDateClick = (info) => {
    alert(`Clicked on: ${info.dateStr}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #EAF6FF 0%, #FFFFFF 100%)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          padding: "30px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "24px",
            color: "#1E3A8A",
            marginBottom: "30px",
          }}
        >
          🐦 Eager Birds — Teacher Calendar
        </h1>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          editable={true}
          selectable={true}
          dateClick={handleDateClick}
          height="auto"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
        />

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
    </div>
  );
}
