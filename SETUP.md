# 🚀 Setup Guide для разработчика

## Предварительные требования

- Node.js 18+ и npm
- Firebase проект с Realtime Database
- Stripe аккаунт (test mode для разработки)

## 1. Установка зависимостей

```bash
# Root dependencies (frontend)
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

## 2. Настройка Firebase

### 2.1 Firebase Console Setup

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект или создайте новый
3. Включите **Realtime Database**:
   - Database > Create Database
   - Выберите location и начните в test mode
4. Настройте **Authentication**:
   - Authentication > Sign-in method
   - Включите нужные провайдеры (Email/Password, Google, и т.д.)

### 2.2 Frontend конфигурация

1. В Firebase Console > Project Settings > General > Your apps
2. Скопируйте конфигурацию (firebaseConfig)
3. Создайте файл `.env` в корне проекта:

```bash
cp env.example .env
```

4. Заполните переменные из Firebase Console:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_DB_URL=https://project-id-default-rtdb.firebaseio.com
```

### 2.3 Backend конфигурация (Firebase Admin SDK)

1. В Firebase Console > Project Settings > Service Accounts
2. Нажмите **Generate new private key**
3. Сохраните JSON файл
4. Создайте файл `backend/.env`:

```bash
cp backend/env.example backend/.env
```

5. **ВАЖНО**: Скопируйте весь JSON контент и минифицируйте его в одну строку:

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",...}
```

> **Примечание**: `\n` в private_key должны остаться как есть (это часть строки)

6. Добавьте Database URL:

```env
FIREBASE_DB_URL=https://your-project-id-default-rtdb.firebaseio.com
```

## 3. Настройка Stripe

### 3.1 Получение API ключей

1. Перейдите в [Stripe Dashboard](https://dashboard.stripe.com/)
2. Developers > API keys
3. Скопируйте **Secret key** (sk_test_... для разработки)

### 3.2 Создание продукта и цены

1. Products > Add product
2. Создайте subscription продукт
3. Скопируйте **Price ID** (price_...)

### 3.3 Backend .env

Добавьте в `backend/.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
FRONTEND_URL=http://localhost:5173
```

### 3.4 Настройка Webhook (для production)

1. Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/stripe-webhook`
3. Выберите events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Скопируйте **Signing secret** (whsec_...)
5. Добавьте в `backend/.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=production
```

> **Для разработки**: webhook работает без STRIPE_WEBHOOK_SECRET в dev режиме

## 4. Запуск проекта

### Development mode

Откройте 2 терминала:

**Терминал 1 - Frontend:**
```bash
npm run dev
```

**Терминал 2 - Backend:**
```bash
cd backend
npm start
```

Frontend будет доступен на `http://localhost:5173`  
Backend будет доступен на `http://localhost:4000`

## 5. Проверка работоспособности

### Healthcheck endpoints

```bash
# Backend health
curl http://localhost:4000/healthz

# Stripe connection
curl http://localhost:4000/stripe-test

# Stripe account info
curl http://localhost:4000/stripe-whoami
```

### Frontend

1. Откройте `http://localhost:5173`
2. Попробуйте зарегистрироваться/войти
3. Проверьте работу форм

## 6. Структура проекта

```
estimate-AI/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/
│   ├── hooks/
│   ├── firebase.ts         # Firebase client config
│   └── ...
├── backend/                # Backend (Express + Node.js)
│   ├── index.js            # Main server file
│   ├── .env               # 🔒 НЕ коммитить!
│   └── package.json
├── .env                    # 🔒 НЕ коммитить!
├── env.example            # Шаблон для .env
└── backend/env.example    # Шаблон для backend/.env
```

## 🔒 Безопасность

**НИКОГДА НЕ КОММИТЬТЕ В GIT:**
- `.env` файлы
- `backend/keys/` папку
- Firebase service account JSON файлы
- Stripe API ключи
- Любые приватные ключи

Все sensitive данные должны быть только в `.env` файлах, которые добавлены в `.gitignore`.

## 📝 Передача credentials другому разработчику

1. **НЕ отправляйте** credentials через Git
2. **Используйте** безопасные каналы:
   - Encrypted messengers (Signal, WhatsApp)
   - Password managers (1Password shared vaults, LastPass)
   - Secure file sharing (Firefox Send, Bitwarden Send)
3. **Инструкции**: 
   - Отправьте содержимое `.env` файлов отдельно
   - Или дайте доступ к Firebase/Stripe консоли для генерации новых ключей

## ❓ Troubleshooting

### Firebase connection errors

- Проверьте правильность FIREBASE_DB_URL
- Убедитесь, что Database Rules позволяют доступ
- Проверьте, что service account JSON валидный

### Stripe errors

- Убедитесь, что используете правильный режим (test/live)
- Проверьте, что STRIPE_PRICE_ID существует
- Для webhooks в dev режиме используйте Stripe CLI

### CORS errors

- Frontend должен быть в allowList в `backend/index.js`
- Проверьте, что backend запущен на правильном порту

