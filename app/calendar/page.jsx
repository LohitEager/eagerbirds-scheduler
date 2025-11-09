"use client";

import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());

  const handleDateChange = (value) => {
    setDate(value);
    alert(`Selected: ${value.toDateString()}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #EAF6FF 0%, #FFFFFF 100%)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          padding: "30px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            color: "#1E3A8A",
            marginBottom: "20px",
          }}
        >
          🐦 Eager Birds — Teacher Calendar
        </h1>

        <Calendar
          onChange={handleDateChange}
          value={date}
          calendarType="US"
        />

        <p style={{ marginTop: "20px", color: "#333" }}>
          Selected: <b>{date.toDateString()}</b>
        </p>

        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "30px",
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
  );
}
