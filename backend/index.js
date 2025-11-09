require("dotenv").config();
const express = require("express");
const admin = require("firebase-admin");
const Stripe = require("stripe");
const cors = require("cors");

// Инициализация Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert(
//     require(process.env.FIREBASE_SERVICE_ACCOUNT)
//   ),
//   databaseURL: process.env.FIREBASE_DB_URL,
// });

// было где-то так:
// const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL: process.env.FIREBASE_DB_URL });

/* стало: */
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  ),
  databaseURL: process.env.FIREBASE_DB_URL,
});

// Инициализация Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const app = express();
const isDev = process.env.NODE_ENV !== "production";

const allowList = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://ai-estimate-frontend.vercel.app",
];
const previewRe = /\.vercel\.app$/;

const corsCfg = cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    const ok = allowList.includes(origin) || previewRe.test(origin);
    cb(ok ? null : new Error("CORS blocked"), ok);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature"],
  credentials: true,
});

app.use(corsCfg);
app.options("(.*)", corsCfg); // <= ключевой фикс
// 1) Healthcheck
app.get("/healthz", async (req, res) => {
  try {
    await admin.database().ref("/").once("value");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    console.error("❌ Healthcheck DB error:", err);
    res.status(500).json({ status: "error", db: "unreachable" });
  }
});

app.post("/account/disable", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).send("Missing token");

    const decoded = await admin.auth().verifyIdToken(token, true);
    const uid = decoded.uid;

    const now = Math.floor(Date.now() / 1000);
    if (decoded.auth_time && now - decoded.auth_time > 5 * 60) {
      return res.status(403).send("Re-auth required");
    }

    await admin.auth().updateUser(uid, { disabled: true });
    await admin.auth().revokeRefreshTokens(uid);
    res.send({ success: true });
  } catch (err) {
    res.status(400).send(e?.message || "Failed");
  }
});

// 9) Эндпоинт для записи операции в estimates
app.post("/progress", express.json(), async (req, res) => {
  const { uid, executionId, operation } = req.body;
  if (!uid || !executionId || !operation) {
    return res
      .status(400)
      .json({ error: "uid, executionId и operation обязательны" });
  }

  try {
    // Пушим новую операцию в массив operations
    const ref = admin
      .database()
      .ref(`profiles/${uid}/estimates/${executionId}/operations`);
    const newOpRef = ref.push(); // создаёт уникальный ключ для операции
    await newOpRef.set(operation);

    if (operation.step === "step_failed" || operation.status === "failed") {
      const usageCountRef = admin.database().ref(`profiles/${uid}/usage/count`);
      await usageCountRef.transaction(
        (c) => {
          const current = c ?? 0;
          return current > 0 ? current - 1 : 0;
        },
        undefined,
        false
      );
    }

    res.json({ status: "ok", key: newOpRef.key });
  } catch (err) {
    console.error("❌ update-operations error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2) Debug write (optional)
app.post("/debug-write", express.json(), async (req, res) => {
  try {
    await admin.database().ref("debug/testKey").set({ val: 42 });
    const snap = await admin.database().ref("debug/testKey").once("value");
    res.json({ wrote: snap.val() });
  } catch (err) {
    console.error("❌ debug-write error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3) Stripe API test (optional)
app.get("/stripe-test", async (req, res) => {
  try {
    const prices = await stripe.prices.list({ limit: 1 });
    res.json({ stripe: "connected", samplePrice: prices.data[0] });
  } catch (err) {
    console.error("❌ Stripe test error:", err);
    res.status(500).json({ stripe: "error", message: err.message });
  }
});

// 4) Webhook handler
if (isDev) {
  // В режиме разработки принимаем JSON без проверки подписи
  app.post("/stripe-webhook", express.json(), async (req, res) => {
    const event = req.body;
    console.log("🔧 [DEV] Webhook event:", event.type);
    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const uid = session.metadata?.uid;
        const subscriptionId = session.subscription;
        if (uid) {
          let status = "active";
          let currentPeriodEnd = null;
          if (subscriptionId) {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            status = sub.status;
            currentPeriodEnd = sub.current_period_end
              ? sub.current_period_end * 1000
              : null;
          }
          const paid = status === "active" || status === "trialing";
          await admin
            .database()
            .ref(`profiles/${uid}/usage`)
            .update({
              paid,
              subscriptionId: subscriptionId || null,
              status,
              currentPeriodEnd,
              updatedAt: Date.now(),
            });
          console.log(`✅ [DEV] User ${uid} subscription set:`, {
            status,
            currentPeriodEnd,
          });
        }
      }

      if (
        event.type === "customer.subscription.updated" ||
        event.type === "customer.subscription.deleted"
      ) {
        const sub = event.data.object;
        const uid = sub.metadata?.uid;
        if (uid) {
          const status = sub.status;
          const currentPeriodEnd = sub.current_period_end
            ? sub.current_period_end * 1000
            : null;
          const paid = status === "active" || status === "trialing";
          await admin.database().ref(`profiles/${uid}/usage`).update({
            paid,
            subscriptionId: sub.id,
            status,
            currentPeriodEnd,
            updatedAt: Date.now(),
          });
          console.log(`ℹ️ [DEV] Subscription update for ${uid}:`, {
            status,
            currentPeriodEnd,
          });
        }
      }

      if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const uid = sub.metadata?.uid;
          if (uid) {
            const status = sub.status;
            const currentPeriodEnd = sub.current_period_end
              ? sub.current_period_end * 1000
              : null;
            const paid = status === "active" || status === "trialing";
            await admin.database().ref(`profiles/${uid}/usage`).update({
              paid,
              subscriptionId: sub.id,
              status,
              currentPeriodEnd,
              updatedAt: Date.now(),
            });
            console.log(`💸 [DEV] Invoice succeeded for ${uid}:`, {
              status,
              currentPeriodEnd,
            });
          }
        }
      }

      if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const uid = sub.metadata?.uid;
          if (uid) {
            const status = sub.status; // обычно past_due или unpaid
            const currentPeriodEnd = sub.current_period_end
              ? sub.current_period_end * 1000
              : null;
            const paid = ["active", "trialing"].includes(status);
            await admin.database().ref(`profiles/${uid}/usage`).update({
              paid,
              subscriptionId: sub.id,
              status,
              currentPeriodEnd,
              updatedAt: Date.now(),
            });
            console.log(`⚠️ [DEV] Invoice failed for ${uid}:`, {
              status,
              currentPeriodEnd,
            });
          }
        }
      }
    } catch (err) {
      console.error("❌ [DEV] Webhook handler error:", err);
    }
    res.json({ received: true });
  });
} else {
  // В продакшене — raw тело и проверка подписи
  app.post(
    "/stripe-webhook",
    express.raw({ type: "*/*" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (e) {
        console.error("❌ Webhook signature failed:", e.message);
        return res.status(400).send(`Webhook Error: ${e.message}`);
      }
      try {
        console.log("🌐 [WEBHOOK]", event.type); // <--- вот тут
        if (event.type === "checkout.session.completed") {
          const session = event.data.object;
          const uid = session.metadata?.uid;
          const subscriptionId = session.subscription;
          if (uid) {
            let status = "active";
            let currentPeriodEnd = null;
            if (subscriptionId) {
              const sub = await stripe.subscriptions.retrieve(subscriptionId);
              status = sub.status;
              currentPeriodEnd = sub.current_period_end
                ? sub.current_period_end * 1000
                : null;
            }
            const paid = status === "active" || status === "trialing";
            await admin
              .database()
              .ref(`profiles/${uid}/usage`)
              .update({
                paid,
                subscriptionId: subscriptionId || null,
                status,
                currentPeriodEnd,
                updatedAt: Date.now(),
              });
            console.log(`✅ User ${uid} subscription set:`, {
              status,
              currentPeriodEnd,
            });
          }
        }

        if (
          event.type === "customer.subscription.updated" ||
          event.type === "customer.subscription.deleted"
        ) {
          const sub = event.data.object;
          const uid = sub.metadata?.uid;
          if (uid) {
            const status = sub.status;
            const currentPeriodEnd = sub.current_period_end
              ? sub.current_period_end * 1000
              : null;
            const paid = status === "active" || status === "trialing";
            await admin.database().ref(`profiles/${uid}/usage`).update({
              paid,
              subscriptionId: sub.id,
              status,
              currentPeriodEnd,
              updatedAt: Date.now(),
            });
            console.log(`ℹ️ Subscription update for ${uid}:`, {
              status,
              currentPeriodEnd,
            });
          }
        }

        if (event.type === "invoice.payment_succeeded") {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription;
          if (subscriptionId) {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            const uid = sub.metadata?.uid;
            if (uid) {
              const status = sub.status;
              const currentPeriodEnd = sub.current_period_end
                ? sub.current_period_end * 1000
                : null;
              const paid = status === "active" || status === "trialing";
              await admin.database().ref(`profiles/${uid}/usage`).update({
                paid,
                subscriptionId: sub.id,
                status,
                currentPeriodEnd,
                updatedAt: Date.now(),
              });
              console.log(`💸 Invoice succeeded for ${uid}:`, {
                status,
                currentPeriodEnd,
              });
            }
          }
        }

        if (event.type === "invoice.payment_failed") {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription;
          if (subscriptionId) {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            const uid = sub.metadata?.uid;
            if (uid) {
              const status = sub.status;
              const currentPeriodEnd = sub.current_period_end
                ? sub.current_period_end * 1000
                : null;
              const paid = ["active", "trialing"].includes(status);
              await admin.database().ref(`profiles/${uid}/usage`).update({
                paid,
                subscriptionId: sub.id,
                status,
                currentPeriodEnd,
                updatedAt: Date.now(),
              });
              console.log(`⚠️ Invoice failed for ${uid}:`, {
                status,
                currentPeriodEnd,
              });
            }
          }
        }
      } catch (err) {
        console.error("❌ Webhook handler error:", err);
      }
      res.json({ received: true });
    }
  );
}

// 5) Парсинг JSON для остальных роутов
app.use(express.json());

// 6) Middleware проверки Firebase ID Token
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer "))
    return res.status(401).send("No token");
  const idToken = authHeader.split("Bearer ")[1];
  try {
    req.user = await admin.auth().verifyIdToken(idToken);
    next();
  } catch (e) {
    console.error("❌ Invalid token:", e.message);
    res.status(401).send(`Invalid token: ${e.code}`);
  }
}

app.get("/stripe-whoami", async (_req, res) => {
  const acc = await stripe.accounts.retrieve();
  res.json({ account: acc.id });
});

// 7) Создание Stripe Checkout Session
app.post("/create-subscription", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    // 1) ищем существующего customer по uid
    const found = await stripe.customers.search({
      query: `metadata['uid']:'${uid}'`,
    });
    let customerId = found.data[0]?.id;

    // 2) если нет — создаём; clock только при создании
    if (!customerId) {
      const createParams = { metadata: { uid, env: "stg" } };
      if (process.env.STRIPE_TEST_CLOCK_ID) {
        createParams.test_clock = process.env.STRIPE_TEST_CLOCK_ID;
      }
      const customer = await stripe.customers.create(createParams);
      customerId = customer.id;
    }

    // 3) Checkout Session на найденного/созданного customer
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      subscription_data: { metadata: { uid } },
      success_url: `${process.env.FRONTEND_URL}/?subscribed=true`,
      cancel_url: `${process.env.FRONTEND_URL}/?subscribed=false`,
    });

    res.json({ sessionId: session.id });
  } catch (e) {
    console.error("❌ create-subscription error:", e);
    res.status(500).json({ error: e.message, type: e.type || null });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Backend listening on ${PORT} (dev=${isDev})`)
);
