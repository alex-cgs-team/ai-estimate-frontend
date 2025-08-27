// src/AuthContainer.tsx
// Контейнер авторизации через SMS (Firebase Phone Auth) + профиль пользователя.
import React, { useState, useEffect } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  type ConfirmationResult,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth, rtdb } from '../firebase.ts';
import { ref as dbRef, get, set, remove } from 'firebase/database';
import EstimateForm from '../EstimateForm';

type Step = 'phone' | 'code' | 'profile' | 'main';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier & { widgetId?: number; rendered?: boolean };
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

  // Подписка на изменение состояния аутентификации
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
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
    return () => unsub();
  }, []);

  // Инициализация reCAPTCHA: один инстанс на шаг 'phone'
  useEffect(() => {
    if (step !== 'phone') return;

    const el = document.getElementById('recaptcha-container');
    if (!el) return;

    if (!window.recaptchaVerifier) {
      const v = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      v.render().then((id: number) => {
        (v as any).widgetId = id;
        (v as any).rendered = true;
      });
      window.recaptchaVerifier = v as any;
    }

    return () => {
      try { window.recaptchaVerifier?.clear(); } catch {}
      window.recaptchaVerifier = undefined;
    };
  }, [step]);

  const resetCaptchaIfRendered = () => {
    const v = window.recaptchaVerifier as any;
    if (v?.rendered && v?.widgetId !== undefined) {
      const g = window.grecaptcha;
      if (g?.enterprise?.reset) g.enterprise.reset(v.widgetId);
      else if (g?.reset) g.reset(v.widgetId);
    }
  };

  const ensureCaptcha = async () => {
    if (window.recaptchaVerifier) return window.recaptchaVerifier!;
    const v = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    await v.render().then((id: number) => {
      (v as any).widgetId = id;
      (v as any).rendered = true;
    });
    window.recaptchaVerifier = v as any;
    return window.recaptchaVerifier!;
  };

  const sendCode = async () => {
    if (pending) return;
    if (!/^\+\d{6,}$/.test(phone)) {
      alert('Номер в формате +71234567890');
      return;
    }
    setPending(true);
    try {
      const verifier = await ensureCaptcha();
      resetCaptchaIfRendered();
      const res = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(res);
      setStep('code');
    } catch (e: any) {
      if (e?.code === 'auth/captcha-check-failed') {
        try { window.recaptchaVerifier?.clear(); } catch {}
        window.recaptchaVerifier = undefined;
        alert('Капча сброшена. Повторите отправку.');
      } else if (e?.code === 'auth/too-many-requests') {
        alert('Слишком много попыток. Подождите или используйте Test Phone Number.');
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

  const clearCaptcha = () => {
    try { window.recaptchaVerifier?.clear(); } catch {}
    window.recaptchaVerifier = undefined;
  };

  const doFullLogout = async () => {
    if (user) {
      try { await remove(dbRef(rtdb, `profiles/${user.uid}`)); } catch {}
    }
    clearCaptcha();
    await auth.signOut();
  };

  const doLightLogout = async () => {
    clearCaptcha();
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
            onLightLogout={doLightLogout}
            onFullLogout={doFullLogout}
          />
        </div>
      )}
    </div>
  );
}