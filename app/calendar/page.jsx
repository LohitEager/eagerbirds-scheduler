"use client";
import React from "react";

export default function CalendarPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#EAF6FF 0%,#FFFFFF 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <img
        src="https://i.ibb.co/9ktrqMLc/Video-Generation-Successful-unscreen.gif"
        alt="Eager Birds mascot"
        style={{ width: "150px", marginBottom: "20px" }}
      />
      <h1 style={{ fontSize: "26px", color: "#1E3A8A", marginBottom: "10px" }}>
        🐦 Eager Birds — Schedule View
      </h1>
      <p style={{ fontSize: "16px", color: "#334155", maxWidth: "400px" }}>
        Our smart scheduling interface is taking flight soon.  
        Meanwhile, your class and demo slots will appear here once setup is complete.
      </p>
      <a
        href="/"
        style={{
          marginTop: "30px",
          background: "#2563EB",
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "500",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        ← Back to Dashboard
      </a>
    </div>
  );
}
