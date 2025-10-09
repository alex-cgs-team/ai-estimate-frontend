# 🔐 Передача Credentials новому разработчику

## ⚠️ ВАЖНО: НЕ отправляйте credentials через Git!

Все sensitive данные должны передаваться по безопасным каналам.

## Что нужно передать

### 1. Frontend Environment Variables (`.env`)

```env
VITE_FIREBASE_API_KEY=<ваш API ключ>
VITE_FIREBASE_AUTH_DOMAIN=<ваш auth domain>
VITE_FIREBASE_PROJECT_ID=<ваш project ID>
VITE_FIREBASE_STORAGE_BUCKET=<ваш storage bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<ваш sender ID>
VITE_FIREBASE_APP_ID=<ваш app ID>
VITE_FIREBASE_DB_URL=<ваш database URL>
VITE_BACKEND_URL=http://localhost:4000
```

**Где взять**: Firebase Console > Project Settings > General > Your apps

### 2. Backend Environment Variables (`backend/.env`)

```env
FIREBASE_SERVICE_ACCOUNT_JSON=<весь JSON одной строкой>
FIREBASE_DB_URL=<database URL>
STRIPE_SECRET_KEY=<stripe secret key>
STRIPE_PRICE_ID=<stripe price ID>
STRIPE_WEBHOOK_SECRET=<webhook secret для production>
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=4000
```

**Где взять**:
- Firebase service account: Firebase Console > Project Settings > Service Accounts > Generate new private key
- Stripe keys: Stripe Dashboard > Developers > API keys
- Stripe Price ID: Stripe Dashboard > Products
- Webhook Secret: Stripe Dashboard > Developers > Webhooks

### 3. Firebase Service Account JSON (для backend)

Это **самый важный и чувствительный** файл. Содержит приватный ключ для доступа к Firebase.

**Формат**: Минифицированный JSON в одну строку для `FIREBASE_SERVICE_ACCOUNT_JSON`

```json
{"type":"service_account","project_id":"project-ai-estimate","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"...","universe_domain":"googleapis.com"}
```

## 📤 Безопасные способы передачи

### Вариант 1: Encrypted Messengers (Рекомендуется)
- **Signal** - end-to-end encryption
- **Telegram** (secret chat)
- **WhatsApp**

**Инструкция**:
1. Создайте текстовый файл с credentials
2. Отправьте через защищённый чат
3. Попросите удалить после копирования
4. Удалите со своей стороны

### Вариант 2: Password Managers
- **1Password** (Shared Vaults)
- **Bitwarden** (Organizations)
- **LastPass** (Shared Folders)

**Инструкция**:
1. Создайте secure note с credentials
2. Поделитесь через vault/organization
3. Отзовите доступ после копирования

### Вариант 3: Secure File Sharing
- **Bitwarden Send** (самоуничтожаемые ссылки)
- **Firefox Send** (если доступен)
- **Magic Wormhole** (command line tool)

**Пример с Bitwarden Send**:
```bash
# Установка
npm install -g @bitwarden/cli

# Отправка файла
bw send create file credentials.txt
```

### Вариант 4: Предоставить доступ к консолям (Лучший вариант!)

Вместо передачи ключей, дайте разработчику доступ к консолям:

**Firebase**:
1. Firebase Console > Project Settings > Users and permissions
2. Add member с email разработчика
3. Роль: Editor или Owner

**Stripe**:
1. Stripe Dashboard > Team & security
2. Invite team member
3. Роль: Developer или Administrator

Разработчик сам сгенерирует необходимые ключи.

## 🚫 НЕ ДЕЛАЙТЕ ТАК

❌ Отправка через email (незашифрованный)  
❌ Публикация в Slack/Discord  
❌ Отправка через SMS  
❌ Commit в git (даже в private репозиторий!)  
❌ Отправка через обычные файлообменники (Google Drive, Dropbox без шифрования)  
❌ Скриншоты credentials

## ✅ Checklist перед передачей

- [ ] Убедились, что `.gitignore` настроен правильно
- [ ] Проверили, что `backend/keys/` в .gitignore
- [ ] Убедились, что нет credentials в git истории
- [ ] Подготовили `env.example` файлы с описанием
- [ ] Выбрали безопасный канал передачи
- [ ] Договорились об удалении после копирования
- [ ] Обновили README.md с инструкциями
- [ ] (Опционально) Создали тестовые/development credentials

## 📝 Шаблон сообщения для разработчика

```
Привет! Передаю тебе credentials для проекта estimate-AI.

🔐 ВАЖНО: 
1. Сохрани эти данные в безопасном месте
2. НЕ коммить их в git
3. Удали это сообщение после копирования
4. Создай файлы .env по инструкции в SETUP.md

📄 Файлы в проекте:
- SETUP.md - подробная инструкция по настройке
- env.example - шаблоны .env файлов
- backend/env.example - шаблон для backend

Отправляю credentials отдельным сообщением ⬇️
```

## 🔄 Ротация credentials (после передачи проекта)

Если вы полностью передаёте проект и больше не будете с ним работать:

1. **Firebase**: Сгенерируйте новый service account key, удалите старый
2. **Stripe**: Сгенерируйте новые API keys, отзовите старые
3. **Обновите** production окружение с новыми ключами
4. **Удалите** все свои копии старых credentials

## 📚 Дополнительные ресурсы

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/security)
- [Stripe API Keys Best Practices](https://stripe.com/docs/keys)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

