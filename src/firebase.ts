// src/firebase.ts
// Единая инициализация Firebase для фронтенда (App + RTDB).
// ВАЖНО: в проекте также есть файл src/firebase/index.tsx с плейсхолдером.
// Используйте ИМЕННО этот файл для импортов: `import { auth, rtdb } from './firebase'`.
// Дубли и плейсхолдеры могут приводить к ошибкам подключения или неправильным ссылкам.
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getDatabase } from 'firebase/database';

// const firebaseConfig = {
//   apiKey: "AIzaSyBX-ieCj2aAd6JmOhiXC73yKZi5-19Shd0",
//   authDomain: "project-ai-estimate.firebaseapp.com",
//   databaseURL: "https://project-ai-estimate-default-rtdb.firebaseio.com",  // строго без лишних суффиксов!
//   projectId: "project-ai-estimate",
//   storageBucket: "project-ai-estimate.appspot.com",
//   messagingSenderId: "883080880961",
//   appId: "1:883080880961:web:229e20a283eb7c0",
// };

// const app = initializeApp(firebaseConfig);

// // Экспортируем только Auth и RTDB
// export const auth = getAuth(app);
// export const rtdb = getDatabase(app);

// // Для локальных тестов (отключаем рекапчу на тестовых номерах)
// auth.settings.appVerificationDisabledForTesting = true;

// // Для удобства отладки в dev-режиме пробрасываем ссылку на auth в window
// if (process.env.NODE_ENV === 'development') {
//     // @ts-ignore
//     window.auth = auth;
//   }
  
// src/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const DB_URL = import.meta.env.VITE_FIREBASE_DB_URL || 'https://project-ai-estimate-default-rtdb.firebaseio.com'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DB_URL,
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const rtdb = getDatabase(app, DB_URL) // ← и вот тут


// пробросим auth в window только в dev
if (import.meta.env.DEV) {
  // @ts-ignore
  (window as any).auth = auth
}
// остальное оставь как есть
