// EstimateForm.tsx
// Компонент формы отправки запроса на расчёт (estimate)

import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { ref as dbRef, set, onValue, push } from 'firebase/database';
import { rtdb } from './firebase.ts';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// --- ENV ---
const isDev = import.meta.env.MODE === 'development';

const API_BASE = isDev
  ? 'http://localhost:4000'
  : (import.meta.env.VITE_BACKEND_URL as string);

const STRIPE_PUBLISHABLE_KEY = import.meta.env
  .VITE_STRIPE_PUBLISHABLE_KEY as string;

const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID as string;

if (!STRIPE_PUBLISHABLE_KEY) throw new Error('Missing VITE_STRIPE_PUBLISHABLE_KEY');
if (!isDev && !API_BASE) throw new Error('Missing VITE_BACKEND_URL in Preview/Prod');
if (!STRIPE_PRICE_ID) throw new Error('Missing VITE_STRIPE_PRICE_ID');

// Stripe.js
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface EstimateFormProps {
  user: User;
  userName: string;
  userRole: string;
  onLightLogout: () => Promise<void>;
  onFullLogout: () => Promise<void>;
}

export default function EstimateForm({
  user,
  userName,
  userRole,
  onLightLogout,
  onFullLogout,
}: EstimateFormProps) {
  const [usage, setUsage] = useState<{ count: number; paid: boolean }>({
    count: 0,
    paid: false,
  });
  const [projectName, setProjectName] = useState('');
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState<
    { file: File; type: string; description: string }[]
  >([]);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const usageRef = dbRef(rtdb, `profiles/${user.uid}/usage`);
    return onValue(usageRef, (snap) => {
      setUsage(snap.exists() ? snap.val() : { count: 0, paid: false });
    });
  }, [user.uid]);

  useEffect(() => {
    console.log("ENV CHECK:", {
      MODE: import.meta.env.MODE,
      BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
      STRIPE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      PRICE_ID: import.meta.env.VITE_STRIPE_PRICE_ID,
    });
  }, []);

  // Stripe Checkout
  const goToCheckout = async () => {
    setProcessing(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${API_BASE}/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ priceId: STRIPE_PRICE_ID }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const { sessionId } = await res.json();

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not initialized');

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) console.error('Stripe Checkout error:', error.message);
    } catch (err: any) {
      console.error('Checkout error:', err.message);
      alert('Не удалось перейти к оплате: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Файлы
  const handleFileAdd = (type: 'file' | 'visual') => () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept =
      type === 'file'
        ? '.pdf,.doc,.docx,.txt,.csv'
        : 'image/png,image/jpeg';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) setEntries((prev) => [...prev, { file, type, description: '' }]);
    };
    input.click();
  };

  const handleDescriptionChange = (i: number, desc: string) => {
    setEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, description: desc } : e)),
    );
  };

  const handleRemove = (i: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const shouldCheckout = !usage.paid && usage.count < -3;
      if (shouldCheckout) {
        await goToCheckout();
        return;
      }

      await set(dbRef(rtdb, `profiles/${user.uid}/usage`), {
        count: usage.count + 1,
        paid: usage.paid,
      });

      const executionId = uuidv4();
      const operationsRef = dbRef(
        rtdb,
        `profiles/${user.uid}/estimates/${executionId}/operations`,
      );
      await push(operationsRef, {
        step: 'Initializing estimate...',
        status: 'pending',
        progress: 0,
      });

      const formData = new FormData();
      formData.append('executionId', executionId);
      formData.append('userId', user.uid);
      formData.append('project_name', projectName);
      formData.append('notes_to_ai', notes);
      formData.append('user_phone', user.phoneNumber || '');
      formData.append('user_name', userName);
      formData.append('user_role', userRole);

      entries.forEach((entry) => {
        formData.append('files', entry.file, entry.file.name);
        formData.append('types', entry.type);
        formData.append('descriptions', entry.description);
      });

      await push(operationsRef, {
        step: 'Sending data to n8n...',
        status: 'in_progress',
        progress: 20,
      });

      // n8n — оставлен как есть
      const resp = await fetch(
        'http://localhost:5678/webhook/79c1c326-1af6-4c73-9194-6737b093b58d',
        {
          method: 'POST',
          body: formData,
        },
      );
      if (!resp.ok) throw new Error(`Webhook error ${resp.status}`);
      const respJson = await resp.json();

      await push(operationsRef, {
        step: 'n8n processing finished',
        status: 'done',
        progress: 100,
      });

      const estimateRef = dbRef(
        rtdb,
        `profiles/${user.uid}/estimates/${executionId}`,
      );
      await set(estimateRef, {
        projectName,
        notes,
        sharedLink: respJson.sharedLink || null,
        createdAt: Date.now(),
      });

      navigate(`/waiting/${executionId}`);
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      alert('Ошибка при отправке: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="relative bg-white/90 backdrop-blur border border-neutral-200 p-8 rounded-2xl shadow-sm space-y-6 max-w-3xl mx-auto">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={onLightLogout}
          className="h-9 px-3 rounded-lg bg-neutral-200 text-neutral-800 hover:bg-neutral-300 transition"
        >
          Logout
        </button>
        <button
          onClick={onFullLogout}
          className="h-9 px-3 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
        >
          Full Logout
        </button>
      </div>

      <h2 className="text-lg">Hello, {userName || user.phoneNumber}</h2>
      <p className="text-sm">Role: {userRole}</p>
      <p className="text-sm">
        Submissions: {usage.count} {usage.paid ? '(unlimited)' : ''}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project / Client name"
          required
          className="w-full h-11 rounded-lg border border-neutral-300 px-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes to AI..."
          className="w-full min-h-28 rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleFileAdd('file')}
            className="h-10 px-3 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition"
          >
            Add File
          </button>
          <button
            type="button"
            onClick={handleFileAdd('visual')}
            className="h-10 px-3 rounded-lg bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition border border-neutral-300"
          >
            Add Visual
          </button>
        </div>

        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm text-neutral-700 truncate max-w-[40%]">
              {entry.file.name}
            </span>
            <input
              value={entry.description}
              onChange={(e) => handleDescriptionChange(i, e.target.value)}
              placeholder="Description"
              className="flex-1 h-10 rounded-lg border border-neutral-300 px-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="h-10 px-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="submit"
          disabled={processing}
          className="h-11 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60 transition"
        >
          {processing ? 'Processing...' : 'Submit'}
        </button>
      </form>

      <button
        onClick={async () => {
          const token = await user.getIdToken(true);
          console.log('Firebase token:', token);
        }}
      >
        Show Firebase token
      </button>
    </div>
  );
}