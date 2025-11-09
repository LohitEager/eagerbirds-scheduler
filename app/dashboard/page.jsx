'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ start: '', end: '' });

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      if (data.session) await loadSlots(data.session.user.id);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadSlots(teacherId) {
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('start_utc', { ascending: true });
    if (!error) setSlots(data || []);
  }

  async function addSlot() {
    if (!session || !newSlot.start || !newSlot.end) return;

    const startISO = new Date(newSlot.start).toISOString();
    const endISO = new Date(newSlot.end).toISOString();

    const { error } = await supabase.from('slots').insert({
      teacher_id: session.user.id,
      start_utc: startISO,
      end_utc: endISO,
      slot_type: 'demo',
      status: 'free',
    });

    if (!error) {
      setNewSlot({ start: '', end: '' });
      loadSlots(session.user.id);
    }
  }

  async function deleteSlot(id) {
    const { error } = await supabase.from('slots').delete().eq('id', id);
    if (!error) loadSlots(session.user.id);
  }

  if (!session) {
    return (
      <main style={{ textAlign: 'center', marginTop: 80 }}>
        <h2>You’re not logged in</h2>
        <a href="/" style={{ color: '#4EB2F4' }}>Go to Login</a>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: 'Inter, sans-serif', maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1>🐦 Eager Birds — Teacher Dashboard</h1>
      <p>Signed in as <b>{session.user.email}</b></p>

      <section style={{ marginTop: 24 }}>
        <h3>Add a new slot</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="datetime-local"
            value={newSlot.start}
            onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
          />
          <span>→</span>
          <input
            type="datetime-local"
            value={newSlot.end}
            onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
          />
          <button
            onClick={addSlot}
            style={{ background: '#4EB2F4', color: '#052447', fontWeight: 700, border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
          >
            Add Slot
          </button>
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h3>Your slots</h3>
        {slots.length === 0 ? (
          <p>No slots yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {slots.map((s) => (
              <li key={s.id} style={{ background: '#f5faff', margin: '8px 0', padding: 12, borderRadius: 8 }}>
                <b>{new Date(s.start_utc).toLocaleString()}</b> → {new Date(s.end_utc).toLocaleString()} — <i>{s.status}</i>
                <button
                  onClick={() => deleteSlot(s.id)}
                  style={{ marginLeft: 12, background: 'red', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
