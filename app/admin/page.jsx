"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get admin session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  // Fetch all slots (only if admin)
  useEffect(() => {
    if (session?.user?.email === "lohit@eagerbirds.com") {
      loadSlots();
    }
  }, [session]);

  const loadSlots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .order("start_utc", { ascending: true });

    if (error) {
      console.error(error.message);
      alert("Error fetching slots: " + error.message);
    } else {
      setSlots(data || []);
    }
    setLoading(false);
  };

  // Render
  if (!session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(180deg,#f0f8ff 0%,#e6f0ff 100%)",
        }}
      >
        <h2 style={{ color: "#0d203a" }}>Admin Login Required</h2>
        <p style={{ color: "#555" }}>Please sign in with your admin email.</p>
      </div>
    );
  }

  if (session.user.email !== "lohit@eagerbirds.com") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#b91c1c",
        }}
      >
        <h2>Access Denied</h2>
        <p>This page is restricted to administrators only.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#f9fbff 0%,#e7f5ff 100%)",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          padding: "30px",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#0d203a" }}>
          🐦 Eager Birds Admin Dashboard
        </h1>

        {loading ? (
          <p>Loading slots...</p>
        ) : slots.length === 0 ? (
          <p>No slots found.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr style={{ background: "#f0f8ff" }}>
                <th style={th}>Teacher ID</th>
                <th style={th}>Start Time</th>
                <th style={th}>End Time</th>
                <th style={th}>Type</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td style={td}>{slot.teacher_id}</td>
                  <td style={td}>{new Date(slot.start_utc).toLocaleString()}</td>
                  <td style={td}>{new Date(slot.end_utc).toLocaleString()}</td>
                  <td style={td}>{slot.slot_type}</td>
                  <td style={{ ...td, color: slot.status === "free" ? "green" : "red" }}>
                    {slot.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "1px solid #ddd",
  color: "#0d203a",
};

const td = {
  padding: "8px 10px",
  borderBottom: "1px solid #f0f0f0",
};
