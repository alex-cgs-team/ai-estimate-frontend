// src/App.tsx
// Корневой компонент приложения.
// Содержит настройку роутинга и подписку на статус авторизации Firebase.
// Маршруты:
//   "/" — контейнер авторизации и форма эстимейта
//   "/waiting/:executionId" — страница ожидания прогресса конкретного расчёта
// Любой другой путь перенаправляется на корень.
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase.ts';
import { onAuthStateChanged, type User } from 'firebase/auth';
import AuthContainer from './components/AuthContainer';
import WaitingPage from './WaitingPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  // Пока идёт определение авторизации, можно показывать заглушку
  if (user === undefined) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Доступ к EstimateForm и AuthContainer */}
        <Route
          path="/"
          element={<AuthContainer />}
        />
        {/* Страница ожидания прогресса */}
        <Route
          path="/waiting/:executionId"
          element={<WaitingPage user={user} />}
        />
        {/* Любой другой путь — редирект на корень */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
