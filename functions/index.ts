import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Инициализируем Firebase Admin SDK
admin.initializeApp();

// Инициализируем Stripe с секретом из конфигурации
const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: '2022-11-15'
});

/**
 * Callable-функция для создания Stripe Checkout Session
 */
export const createCheckoutSession = functions.https.onCall(
  async (_data, context) => {
    // Проверяем, что пользователь аутентифицирован
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Пользователь должен быть залогинен'
      );
    }
    const uid = context.auth.uid;

    // Замените 'price_...' на ваш Price ID из Stripe Dashboard в Test Mode
    // Перейдите в Dashboard → Products → ваш продукт → Price → скопируйте ID вида price_XXXXXXXX
    const priceId = 'price_1RsinWRukKIxPa3SkEQPZzHH';

    // При локальной разработке используйте URL вашего фронтенда, например http://localhost:5173
    // Добавьте маршрут /paid и /cancel в ваше React-приложение
    const frontendDomain = 'http://localhost:5173';

    // Создаём Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendDomain}/paid?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendDomain}/cancel`,
      metadata: { uid }
    });

    // Возвращаем sessionId клиенту
    return { sessionId: session.id };
  }
);

/**
 * HTTP-функция для приёма Stripe Webhook событий
 */
export const stripeWebhook = functions.https.onRequest(
  async (req, res) => {
    const sig = req.headers['stripe-signature']!;
    let event: Stripe.Event;

    try {
      // Проверяем подпись Webhook; webhook_secret сконфигурирован через firebase functions:config:set
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody || req.body,
        sig,
        functions.config().stripe.webhook_secret
      );
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Обрабатываем только успешные сессии
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid = session.metadata?.uid;
      if (uid) {
        // Помечаем в RTDB, что пользователь оплатил
        await admin.database().ref(`usage/${uid}`).update({ paid: true });
        console.log(`✅ User ${uid} marked as paid`);
      }
    }

    res.json({ received: true });
  }
);
