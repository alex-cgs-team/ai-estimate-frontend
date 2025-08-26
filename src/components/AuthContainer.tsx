// Контейнер авторизации через SMS (Firebase Phone Auth) + профиль пользователя.
// Этапы:
// 1) Ввод телефона и отправка SMS-кода
// 2) Ввод кода
// 3) Сохранение профиля (имя, роль) в RTDB
// 4) Основной экран с формой эстимейта
// src/AuthContainer.tsx
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

export default function AuthContainer() {
  const [step, setStep] = useState<Step>('phone');

  // SMS login
  const [phone, setPhone] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [code, setCode] = useState('');

  // Profile
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  // Подписка на изменение состояния аутентификации
  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      if (!u) {
        setUser(null);
        setStep('phone');
      } else {
        setUser(u);
        // Пытаемся загрузить профиль из RTDB
        get(dbRef(rtdb, `profiles/${u.uid}`))
          .then(snap => {
            if (snap.exists()) {
              const { name, role } = snap.val() as { name: string; role: string };
              setName(name);
              setRole(role);
              setStep('main');
            } else {
              setStep('profile');
            }
          })
          .catch(() => setStep('profile'));
      }
    });
  }, []);

  // Настройка invisible reCAPTCHA для Phone Auth
  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) (window as any).recaptchaVerifier.clear();
    ;(window as any).recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      { size: 'invisible' }
    );
  };

  // Шаг 1: отправка SMS-кода на введённый номер
  const sendCode = async () => {
    if (!/^\+\d+$/.test(phone)) {
      return alert('Номер должен быть в формате +71234567890');
    }
    try {
      setupRecaptcha();
      const res = await signInWithPhoneNumber(
        auth,
        phone,
        (window as any).recaptchaVerifier
      );
      setConfirmation(res);
      setStep('code');
    } catch (e: any) {
      console.error(e);
      alert('Ошибка отправки: ' + (e.message || e.code));
    }
  };

  // Шаг 2: подтверждение кода из SMS
  const verifyCode = async () => {
    if (!confirmation) return;
    try {
      const cred = await confirmation.confirm(code);
      setUser(cred.user);
      setStep('profile');
    } catch (e: any) {
      console.error(e);
      alert('Неверный код');
    }
  };

  // Шаг 3: сохранение профиля пользователя в RTDB
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await set(dbRef(rtdb, `profiles/${user.uid}`), { name, role, createdAt: Date.now() });
      setStep('main');
    } catch (e: any) {
      console.error(e);
      alert('Не удалось сохранить профиль: ' + (e.message || e.code));
    }
  };

  // Полный выход: удаляем профиль и выходим из аккаунта
  const doFullLogout = async () => {
    if (user) {
      try { await remove(dbRef(rtdb, `profiles/${user.uid}`)); } catch {}
    }
    await auth.signOut();
  };

  // Лёгкий выход: просто выйти (профиль сохраняется)
  const doLightLogout = async () => {
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
            className="w-full h-11 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 transition"
          >
            Отправить код
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
