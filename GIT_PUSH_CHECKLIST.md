# ✅ Чеклист перед push в Git

## Шаг 1: Проверка что credentials защищены

```bash
# Проверьте, что backend/keys/ игнорируется
git check-ignore -v backend/keys/sa.json backend/keys/sa.one.json

# Должно вывести:
# .gitignore:31:backend/keys/     backend/keys/sa.json
# .gitignore:31:backend/keys/     backend/keys/sa.one.json
```

✅ Если видите вывод выше - всё ОК!  
❌ Если не видите - что-то пошло не так, НЕ пушьте!

## Шаг 2: Проверка статуса Git

```bash
git status
```

**Должны быть только эти файлы:**
- ✅ `.gitignore` (modified)
- ✅ `README.md` (new/modified)
- ✅ `SETUP.md` (new)
- ✅ `CREDENTIALS_TRANSFER.md` (new)
- ✅ `GIT_PUSH_CHECKLIST.md` (new)
- ✅ `env.example` (new)
- ✅ `backend/env.example` (new)

**НЕ должно быть:**
- ❌ `.env` файлов
- ❌ `backend/.env`
- ❌ `backend/keys/` или файлов из неё
- ❌ любых JSON файлов с credentials

## Шаг 3: Добавить файлы в Git

```bash
git add .gitignore
git add README.md
git add SETUP.md
git add CREDENTIALS_TRANSFER.md
git add GIT_PUSH_CHECKLIST.md
git add env.example
git add backend/env.example
```

## Шаг 4: Commit

```bash
git commit -m "docs: добавлены инструкции по настройке и безопасной передаче credentials

- Обновлен .gitignore для защиты backend/keys/
- Добавлен SETUP.md с подробной инструкцией
- Добавлен CREDENTIALS_TRANSFER.md с гайдом по безопасной передаче
- Добавлены env.example файлы для frontend и backend
- Обновлен README.md с описанием проекта"
```

## Шаг 5: Push

```bash
git push origin staging
```

или

```bash
git push origin main
```

## Шаг 6: Передача credentials новому разработчику

### Вариант A: Дать доступ к консолям (рекомендуется!)

**Firebase:**
1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `project-ai-estimate`
3. Project Settings > Users and permissions
4. Add member (email разработчика)
5. Роль: **Editor** или **Owner**

**Stripe:**
1. Перейдите в [Stripe Dashboard](https://dashboard.stripe.com/)
2. Team & security
3. Invite team member
4. Роль: **Developer** или **Administrator**

✅ Разработчик сам создаст нужные ключи по инструкции в SETUP.md

### Вариант B: Передать credentials напрямую

⚠️ Используйте **только безопасные каналы**:

1. **Signal** / **Telegram Secret Chat** / **WhatsApp**
   - Отправьте содержимое `.env` файлов
   - Попросите удалить после копирования

2. **1Password** / **Bitwarden**
   - Создайте Shared Vault
   - Добавьте credentials как Secure Note

3. **НЕ отправляйте через**:
   - ❌ Email
   - ❌ Slack/Discord
   - ❌ SMS
   - ❌ Незашифрованные файлообменники

📖 Подробности в [CREDENTIALS_TRANSFER.md](./CREDENTIALS_TRANSFER.md)

### Что отправить разработчику

```
Привет! Проект estimate-AI готов к работе.

📦 Репозиторий: <your-git-url>
📖 Инструкция: см. SETUP.md в корне проекта

🔐 Credentials:
Опция 1: Я дал тебе доступ к Firebase и Stripe консолям. 
         Следуй инструкциям в SETUP.md для генерации ключей.

Опция 2: Отправляю credentials отдельным сообщением.
         НЕ сохраняй их в незащищённых местах!

📋 Чек-лист для старта:
1. git clone <repo-url>
2. npm install (в корне и в backend/)
3. Создай .env файлы по env.example
4. Запусти npm run dev (frontend) и npm start (backend)
5. Открой http://localhost:5173

Вопросы? Пиши!
```

## 🔍 Финальная проверка

```bash
# Убедитесь, что в истории Git нет credentials
git log --all --full-history --source --pretty=format:"%h %s" -- "**/keys/*" "**/.env"

# Не должно быть вывода!
```

## ✅ Готово!

Теперь можно безопасно передавать проект другому разработчику.

---

## 🆘 Что делать если случайно закоммитили credentials?

**СРОЧНО:**

1. **НЕ ПУШЬТЕ** если ещё не запушили!
   ```bash
   git reset HEAD~1
   ```

2. **Если уже запушили:**
   ```bash
   # Удалите файл из истории
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/keys/sa.json" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (если это ваш личный репозиторий!)
   git push origin --force --all
   ```

3. **НЕМЕДЛЕННО ротируйте credentials:**
   - Firebase: Project Settings > Service Accounts > Delete key, Generate new
   - Stripe: API keys > Delete, Create new

4. **Используйте специализированные инструменты:**
   ```bash
   # BFG Repo-Cleaner (проще чем git filter-branch)
   brew install bfg
   bfg --delete-files sa.json
   ```

**Для публичных репозиториев:**
- Считайте credentials скомпрометированными
- Ротация обязательна!
- Проверьте логи на подозрительную активность

