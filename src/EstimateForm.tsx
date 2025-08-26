// Компонент формы отправки запроса на расчёт (estimate)
// Задачи компонента:
// 1) Подписаться на счётчик использования (usage) пользователя в RTDB
// 2) Показать форму загрузки файлов и заметок
// 3) При отправке:
//    - Обновить usage
//    - Создать executionId (ID процесса)
//    - Создать ветку operations в RTDB: profiles/{uid}/estimates/{executionId}/operations
//    - Отправить данные в n8n (включая executionId и данные пользователя)
//    - Сохранить метаданные эстимейта в RTDB
//    - Перенаправить на страницу ожидания прогресса
import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { ref as dbRef, set, onValue, push } from 'firebase/database';
import { rtdb } from './firebase.ts';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Инициализируем Stripe.js из ENV, чтобы ключ не был захардкожен в коде
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

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
  onFullLogout
}: EstimateFormProps) {
  // usage — сколько раз пользователь отправлял форму и есть ли подписка
  const [usage, setUsage] = useState<{ count: number; paid: boolean }>({ count: 0, paid: false });
  // Поля формы
  const [projectName, setProjectName] = useState('');
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState<{ file: File; type: string; description: string }[]>([]);
  // Флаг состояния, чтобы не допустить повторной отправки
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  // Подписка на usage пользователя в RTDB
  useEffect(() => {
    const usageRef = dbRef(rtdb, `profiles/${user.uid}/usage`);
    return onValue(usageRef, snap => {
      setUsage(snap.exists() ? snap.val() : { count: 0, paid: false });
    });
  }, [user.uid]);

  // Переход на Stripe Checkout — если лимит исчерпан и нет подписки
  const goToCheckout = async () => {
    console.log('PK', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
stripePromise.then(s => console.log('stripe ok?', !!s))
    setProcessing(true);
    try {
      // 1) Получаем Firebase idToken для авторизации на сервере
      const idToken = await user.getIdToken();
      console.log('my tooooken', idToken)
      // 2) Запрос на сервер для создания Stripe session
      const res = await fetch('http://localhost:4000/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ priceId: 'price_1RsinWRukKIxPa3SkEQPZzHH' }) // твой priceId
      });
    

  
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

  
      const { sessionId } = await res.json();
  
      // 3) Получаем объект Stripe
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not initialized');
  
      // 4) Редиректим на Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) console.error('Stripe Checkout error:', error.message);
  
    } catch (err: any) {
      console.error('Checkout error:', err.message);
      alert('Не удалось перейти к оплате: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };
  

  // Работа с файлами: добавление файла в локальный список entries
  const handleFileAdd = (type: 'file' | 'visual') => () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'file'
      ? '.pdf,.doc,.docx,.txt,.csv'
      : 'image/png,image/jpeg';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) setEntries(prev => [...prev, { file, type, description: '' }]);
    };
    input.click();
  };

  const handleDescriptionChange = (i: number, desc: string) => {
    setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, description: desc } : e));
  };

  const handleRemove = (i: number) => {
    setEntries(prev => prev.filter((_, idx) => idx !== i));
  };

  // -------------------------
  // Отправка формы: главный сценарий
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Блокируем форму, пока идёт обработка
    setProcessing(true);
  
    try {
      // Условие перехода на Stripe Checkout:
      // только если подписка не активна (paid === false) И
      // счётчик меньше -3
      const shouldCheckout = !usage.paid && usage.count < -3;
      if (shouldCheckout) {
        return goToCheckout();
      }
  
      // 1) Обновляем usage
      await set(dbRef(rtdb, `profiles/${user.uid}/usage`), {
        count: usage.count + 1,
        paid: usage.paid,
      });
  
      // 2) Генерируем executionId
      const executionId = uuidv4();
  
      // 3) Пушим прогресс
      const operationsRef = dbRef(rtdb, `profiles/${user.uid}/estimates/${executionId}/operations`);
      await push(operationsRef, { step: 'Initializing estimate...', status: 'pending', progress: 0 });
  
      // 4) Формируем FormData
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
  
      // 5) Пушим прогресс
      await push(operationsRef, { step: 'Sending data to n8n...', status: 'in_progress', progress: 20 });
  
      // 6) Отправка в n8n
      const resp = await fetch('http://localhost:5678/webhook/79c1c326-1af6-4c73-9194-6737b093b58d', {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) throw new Error(`Webhook error ${resp.status}`);
      const respJson = await resp.json();
  
      // 7) Пушим финальный шаг
      await push(operationsRef, { step: 'n8n processing finished', status: 'done', progress: 100 });
  
      // 8) Сохраняем эстимейт
      const estimateRef = dbRef(rtdb, `profiles/${user.uid}/estimates/${executionId}`);
      await set(estimateRef, {
        projectName,
        notes,
        sharedLink: respJson.sharedLink || null,
        createdAt: Date.now(),
      });
  
      // 9) Навигация на страницу ожидания
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
        <button onClick={onLightLogout} className="h-9 px-3 rounded-lg bg-neutral-200 text-neutral-800 hover:bg-neutral-300 transition">
          Logout
        </button>
        <button onClick={onFullLogout} className="h-9 px-3 rounded-lg bg-red-600 text-white hover:bg-red-500 transition">
          Full Logout
        </button>
      </div>

      <h2 className="text-lg">Hello, {userName || user.phoneNumber}</h2>
      <p className="text-sm">Role: {userRole}</p>
      <p className="text-sm">Submissions: {usage.count} {usage.paid ? '(unlimited)' : ''}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          placeholder="Project / Client name"
          required
          className="w-full h-11 rounded-lg border border-neutral-300 px-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes to AI..."
          className="w-full min-h-28 rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />

        <div className="flex gap-3">
          <button type="button" onClick={handleFileAdd('file')} className="h-10 px-3 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition">
            Add File
          </button>
          <button type="button" onClick={handleFileAdd('visual')} className="h-10 px-3 rounded-lg bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition border border-neutral-300">
            Add Visual
          </button>
        </div>

        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm text-neutral-700 truncate max-w-[40%]">{entry.file.name}</span>
            <input
              value={entry.description}
              onChange={e => handleDescriptionChange(i, e.target.value)}
              placeholder="Description"
              className="flex-1 h-10 rounded-lg border border-neutral-300 px-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button type="button" onClick={() => handleRemove(i)} className="h-10 px-3 rounded-lg text-red-600 hover:bg-red-50">
              Remove
            </button>
          </div>
        ))}

        <button type="submit" disabled={processing} className="h-11 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60 transition">
          {processing ? 'Processing...' : 'Submit'}
        </button>
 
      </form>
      <button onClick={async () => {
  const token = await user.getIdToken(true); // true → всегда свежий токен
  console.log('Firebase token:', token);
}}>
  Show Firebase token
</button>
    </div>
  );
}
