// EstimateForm.tsx
// Компонент формы отправки запроса на расчёт (estimate)

import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { ref as dbRef, set, onValue, push, runTransaction } from 'firebase/database';
import { rtdb } from './firebase.ts';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FREE_LIMIT, TEXT_FILES_LIMIT, VISUAL_FILES_LIMIT } from './shared/config/config.ts';


// --- ENV ---
const isDev = import.meta.env.MODE === 'development';

const API_BASE = isDev
  ? 'http://localhost:4000'
  : (import.meta.env.VITE_BACKEND_URL as string);

const STRIPE_PUBLISHABLE_KEY = import.meta.env
  .VITE_STRIPE_PUBLISHABLE_KEY as string;

const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID as string;

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string;

if (!STRIPE_PUBLISHABLE_KEY) throw new Error('Missing VITE_STRIPE_PUBLISHABLE_KEY');
if (!isDev && !API_BASE) throw new Error('Missing VITE_BACKEND_URL in Preview/Prod');
if (!STRIPE_PRICE_ID) throw new Error('Missing VITE_STRIPE_PRICE_ID');
if (!N8N_WEBHOOK_URL) throw new Error('Missing N8N_WEBHOOK_URL');

// Stripe.js
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface EstimateFormProps {
  user: User;
  userName: string;
  userRole: string;
  onLightLogout: () => Promise<void>;
  onFullLogout: () => Promise<void>;
}

type FileType = 'file' | 'visual'

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
    { file: File; type: FileType; description: string }[]
  >([]);
  const [numberOfTextFiles, setNumberOfTextFiles] = useState(0);
  const [numberOfVisualFiles, setNumberOfVisualFiles] = useState(0);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  // Подписка на usage
  useEffect(() => {
    const usageRef = dbRef(rtdb, `profiles/${user.uid}/usage`);
    return onValue(usageRef, (snap) => {
      setUsage(snap.exists() ? snap.val() : { count: 0, paid: false });
    });
  }, [user.uid]);

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

  const checkFilesLimit = (type: FileType) => {
    if (type === 'file') {
      return numberOfTextFiles === TEXT_FILES_LIMIT
    } else if(type === 'visual') {
      return numberOfVisualFiles === VISUAL_FILES_LIMIT   
    }
  }

  // Файлы
  const handleFileAdd = (type: FileType) => () => {
    if (checkFilesLimit(type)) {
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept =
      type === 'file'
        ? '.pdf,.doc,.docx,.txt,.csv'
        : 'image/png,image/jpeg';

    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        setEntries(prev => [...prev, { file, type, description: '' }]);
        if (type === 'file') {
          setNumberOfTextFiles(prev => prev + 1);
        } else if (type === 'visual') {
          setNumberOfVisualFiles(prev => prev + 1);
        }
      }
    };

    input.click();
  };


  const handleDescriptionChange = (i: number, desc: string) => {
    setEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, description: desc } : e)),
    );
  };

  const handleRemove = (i: number, type: FileType) => {
    if (type === 'file') {
      setNumberOfTextFiles(prev => prev - 1);
    } else if (type === 'visual') {
      setNumberOfVisualFiles(prev => prev - 1);
    }
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
  };

  // Submit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
  
    try {
      // 1) Гейт бесплатного лимита
      const shouldCheckout = !usage.paid && usage.count >= FREE_LIMIT;
      if (shouldCheckout) { await goToCheckout(); return; }
  
      // 2) Основной процесс
      const executionId = uuidv4();
  
      const operationsRef = dbRef(
        rtdb,
        `profiles/${user.uid}/estimates/${executionId}/operations`
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
  
      // n8n как есть
      const resp = await fetch(
        N8N_WEBHOOK_URL,
        { method: 'POST', body: formData }
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
        `profiles/${user.uid}/estimates/${executionId}`
      );
      await set(estimateRef, {
        projectName,
        notes,
        sharedLink: respJson.sharedLink || null,
        createdAt: Date.now(),
      });
  
      // 3) Атомарный инкремент ПОСЛЕ успешной записи эстимейта
      await runTransaction(
        dbRef(rtdb, `profiles/${user.uid}/usage/count`),
        (c) => (c ?? 0) + 1
      );
  
      navigate(`/waiting/${executionId}`);
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      alert('Ошибка при отправке: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const is_txt_files_limit = numberOfTextFiles >= TEXT_FILES_LIMIT;
  const is_visual_files_limit = numberOfVisualFiles >= VISUAL_FILES_LIMIT

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
          {!is_txt_files_limit && <button
            type="button"
            onClick={handleFileAdd('file')}
            className="h-10 px-3 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition"
          >
            Add File
          </button>
          }
          {!is_visual_files_limit && <button
            type="button"
            onClick={handleFileAdd('visual')}
            className="h-10 px-3 rounded-lg bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition border border-neutral-300"
          >
            Add Visual
          </button>
          }
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
              onClick={() => handleRemove(i, entry.type)}
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
      {is_txt_files_limit && <div><p>You have reached the text files limit</p></div>}
      {is_visual_files_limit && <div><p>You have reached the visual files limit</p></div>}
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