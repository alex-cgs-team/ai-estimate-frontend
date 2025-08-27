// src/components/AuthContainer.tsx
import React, { useState, useEffect } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  type ConfirmationResult,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth, rtdb } from '../firebase';
import { ref as dbRef, get, set, remove } from 'firebase/database';
import EstimateForm from '../EstimateForm';

type Step = 'phone' | 'code' | 'profile' | 'main';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | null;
    recaptchaWidgetId?: number | null;
    grecaptcha?: any;
  }
}

export default function AuthContainer() {
  const [step, setStep] = useState<Step>('phone');

  // SMS login
  const [phone, setPhone] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);

  // Profile
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

// ---- helpers ----
const hardResetCaptcha = () => {
  try { window.recaptchaVerifier?.clear(); } catch {}
  const id = window.recaptchaWidgetId;
  const g = window.grecaptcha;
  if (id != null && g) {
    if (g.enterprise?.reset) g.enterprise.reset(id);
    else if (g.reset) g.reset(id);
  }
  const el = document.getElementById('recaptcha-container');
  if (el) el.innerHTML = '';
  window.recaptchaVerifier = null;
  window.recaptchaWidgetId = null;
};

const ensureCaptcha = async () => {
  if (window.recaptchaVerifier) return window.recaptchaVerifier;
  const el = document.getElementById('recaptcha-container');
  if (el) el.innerHTML = '';
  const v = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
  const id = await v.render();
  window.recaptchaVerifier = v;
  window.recaptchaWidgetId = typeof id === 'number' ? id : Number(id);
  return v;
};

const safeResetIfHasResponse = () => {
  const id = window.recaptchaWidgetId;
  const g = window.grecaptcha;
  if (id == null || !g) return;
  const resp = g.enterprise?.getResponse ? g.enterprise.getResponse(id)
             : g.getResponse ? g.getResponse(id)
             : '';
  if (resp) {
    if (g.enterprise?.reset) g.enterprise.reset(id);
    else if (g.reset) g.reset(id);
  }
};

// ---- effects ----
// auth state → маршрутизация и загрузка профиля
useEffect(() => {
  return onAuthStateChanged(auth, async u => {
    if (!u) {
      setUser(null);
      setStep('phone');
      return;
    }
    setUser(u);
    try {
      const snap = await get(dbRef(rtdb, `profiles/${u.uid}`));
      if (snap.exists()) {
        const v = snap.val() as { name?: string; role?: string };
        setName(v?.name ?? '');
        setRole(v?.role ?? '');
        setStep('main');
      } else {
        setStep('profile');
      }
    } catch {
      setStep('profile');
    }
  });
}, []);

// lifecycle капчи на шаге phone
useEffect(() => {
  if (step !== 'phone') return;
  let mounted = true;
  (async () => { if (mounted) await ensureCaptcha(); })();
  return () => { mounted = false; hardResetCaptcha(); };
}, [step]);

// ---- actions ----
const sendCode = async () => {
  if (pending) return;
  if (!/^\+\d{6,}$/.test(phone)) { alert('Номер в формате +71234567890'); return; }

  setPending(true);
  try {
    const verifier = await ensureCaptcha();
    safeResetIfHasResponse();                    // не трогаем свежий виджет
    const res = await signInWithPhoneNumber(auth, phone, verifier);
    setConfirmation(res);
    setStep('code');
  } catch (e: any) {
    // две проблемные ошибки → полный сброс и чистый инстанс
    if (e?.code === 'auth/captcha-check-failed' || e?.code === 'auth/too-many-requests') {
      hardResetCaptcha();
      alert(
        e?.code === 'auth/too-many-requests'
          ? 'Слишком много попыток. Подождите или используйте Test Phone Number.'
          : 'Капча сброшена. Повторите отправку.'
      );
      try { await ensureCaptcha(); } catch {}
    } else {
      alert('Ошибка: ' + (e?.message || e?.code || 'unknown'));
    }
  } finally {
    setPending(false);
  }
};

const verifyCode = async () => {
  if (!confirmation) return;
  try {
    const cred = await confirmation.confirm(code);
    setUser(cred.user);
    setStep('profile');
  } catch {
    alert('Неверный код');
  }
};

const saveProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;
  try {
    await set(dbRef(rtdb, `profiles/${user.uid}`), { name, role, createdAt: Date.now() });
    setStep('main');
  } catch (e: any) {
    alert('Не удалось сохранить профиль: ' + (e?.message || e?.code || 'unknown'));
  }
};

const clearCaptchaAndSignOut = async (removeProfile: boolean) => {
  if (removeProfile && user) {
    try { await remove(dbRef(rtdb, `profiles/${user.uid}`)); } catch {}
  }
  hardResetCaptcha();
  await auth.signOut();
};

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      {step === 'phone' && (
        <div className="w-full max-w-sm bg-white/90 backdrop-blur border border-neutral-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div id="recaptcha-container" />
          <input
            type="tel"
            placeholder="+71234567890"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full h-11 rounded-lg border border-neutral-300 px-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={sendCode}
            disabled={pending}
            className="w-full h-11 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 transition disabled:opacity-60"
          >
            {pending ? 'Отправка...' : 'Отправить код'}
          </button>
        </div>
      )}

      {step === 'code' && (
        <div className="w-full max-w-sm bg-white/90 backdrop-blur border border-neutral-200 rounded-2xl shadow-sm p-6 space-y-4">
          <input
            type="text"
            placeholder="Введите код"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full h-11 rounded-lg border border-neutral-300 px-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={verifyCode}
            className="w-full h-11 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 transition"
          >
            Подтвердить код
          </button>
        </div>
      )}

      {step === 'profile' && (
        <form onSubmit={saveProfile} className="w-full max-w-sm bg-white/90 backdrop-blur border border-neutral-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-medium text-neutral-900">Заполните профиль</h2>
          <input
            type="text"
            placeholder="Ваше имя"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full h-11 rounded-lg border border-neutral-300 px-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Ваша роль"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full h-11 rounded-lg border border-neutral-300 px-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 transition"
          >
            Сохранить профиль
          </button>
        </form>
      )}

      {step === 'main' && user && (
        <div className="w-full max-w-3xl relative">
          <EstimateForm
            user={user}
            userName={name}
            userRole={role}
            onLightLogout={() => clearCaptchaAndSignOut(false)}
            onFullLogout={() => clearCaptchaAndSignOut(true)}
          />
        </div>
      )}
    </div>
  );
}