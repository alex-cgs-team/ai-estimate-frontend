# estimate-AI 🤖

AI-powered estimation tool with React frontend and Node.js backend.

## 📋 Быстрый старт для разработчика

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd estimate-AI
   ```

2. **Установите зависимости**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Настройте environment variables**
   
   📖 **ВАЖНО**: Следуйте подробной инструкции в [SETUP.md](./SETUP.md)
   
   ```bash
   # Frontend
   cp env.example .env
   # Заполните переменные из Firebase Console
   
   # Backend
   cp backend/env.example backend/.env
   # Заполните переменные из Firebase и Stripe
   ```

4. **Запустите проект**
   
   Откройте 2 терминала:
   
   **Терминал 1 (Frontend):**
   ```bash
   npm run dev
   ```
   
   **Терминал 2 (Backend):**
   ```bash
   cd backend
   npm start
   ```

5. **Откройте в браузере**
   ```
   http://localhost:5173
   ```

## 🏗️ Архитектура

```
estimate-AI/
├── src/                    # React + TypeScript frontend
│   ├── components/         # React компоненты
│   ├── hooks/             # Custom hooks
│   ├── firebase.ts        # Firebase client config
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
│
├── backend/               # Express + Node.js backend
│   ├── index.js           # Main server (Stripe, Firebase Admin)
│   ├── env.example        # Template для .env
│   └── package.json
│
├── SETUP.md               # 📖 Подробная инструкция по настройке
├── CREDENTIALS_TRANSFER.md # 🔐 Как безопасно передавать credentials
├── env.example            # Template для frontend .env
└── README.md              # Этот файл
```

## 🔧 Технологии

**Frontend:**
- React 18 + TypeScript
- Vite
- Firebase Authentication
- Firebase Realtime Database

**Backend:**
- Node.js + Express
- Firebase Admin SDK
- Stripe API
- CORS configured

## 📚 Документация

- **[SETUP.md](./SETUP.md)** - Полная инструкция по настройке проекта для нового разработчика
- **[CREDENTIALS_TRANSFER.md](./CREDENTIALS_TRANSFER.md)** - Как безопасно передать credentials

## 🔒 Безопасность

**⚠️ НИКОГДА НЕ КОММИТЬТЕ:**
- `.env` файлы
- `backend/keys/` папку
- Firebase service account JSON файлы
- Stripe API ключи

Все sensitive данные находятся в `.env` файлах, которые игнорируются git.

## 🚀 Deployment

**Frontend (Vercel):**
- Подключите GitHub репозиторий
- Настройте environment variables в Vercel dashboard
- Auto-deploy при push в main/staging

**Backend:**
- Можно деплоить на Render, Railway, Fly.io
- Не забудьте настроить env variables
- Настройте Stripe webhooks на production URL

## 🧪 Endpoints

### Backend API

```bash
# Health check
GET /healthz

# Stripe test
GET /stripe-test
GET /stripe-whoami

# Protected endpoints (требуют Firebase auth token)
POST /create-subscription
POST /progress

# Webhooks
POST /stripe-webhook

# Debug (только для dev)
POST /debug-write
```

## 🛠️ Полезные команды

```bash
# Frontend dev server
npm run dev

# Frontend build
npm run build

# Frontend preview production build
npm run preview

# Backend dev server
cd backend && npm start

# Lint frontend
npm run lint

# Type check
npx tsc --noEmit
```

## 🐛 Troubleshooting

Если возникли проблемы, проверьте:

1. ✅ Установлены ли все зависимости (`npm install`)
2. ✅ Правильно ли настроены `.env` файлы
3. ✅ Запущен ли backend сервер
4. ✅ Корректные ли Firebase credentials
5. ✅ Stripe ключи из правильного режима (test/live)

Подробнее в [SETUP.md](./SETUP.md) в разделе Troubleshooting.

## 📝 License

MIT

## 👥 Contributing

При добавлении новых секретов:
1. Добавьте их в `env.example` с описанием
2. Обновите `SETUP.md`
3. НЕ коммитьте реальные значения!
