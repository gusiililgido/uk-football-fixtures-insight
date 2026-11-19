const BOT_TOKEN = '9235004140:AAFQnk7qv6ABm9aIRXiHbrtOcUcnGnYcDiY';
const CHANNEL_INVITE = 'https://' + 't.me/+_yIGcgKWAxZkMzg8';
const APP_URL = 'https://' + 'uk-football-fixtures-insight.vercel.app';
const WHATSAPP_SUPPORT = 'https://' + 'wa.me/254704956915';

// Stores the private channel's numeric -100... ID once a channel post is seen
let cachedChannelId: string | number = process.env.TELEGRAM_CHANNEL_ID || '';

async function callTelegram(method: string, payload: Record<string, unknown>) {
  const url = 'https://' + `api.telegram.org/bot${BOT_TOKEN}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function checkUserMembership(userId: string | number) {
  if (!cachedChannelId) {
    // If channel ID hasn't been captured from a channel post yet, allow verified status once user interacts
    return { checked: false, isMember: true };
  }
  const data = await callTelegram('getChatMember', {
    chat_id: cachedChannelId,
    user_id: Number(userId),
  });
  const valid = ['member', 'administrator', 'creator'];
  return {
    checked: true,
    isMember: Boolean(data.ok && valid.includes(data.result?.status)),
  };
}

export default async function handler(req: any, res: any) {
  // GET request from the Web App to verify a user's numeric ID
  if (req.method === 'GET') {
    const verifyUserId = req.query?.verifyUserId;
    if (!verifyUserId) {
      return res.status(200).json({ ok: true, bot: 'UK Football Insight Verifier v2' });
    }
    const status = await checkUserMembership(verifyUserId);
    if (status.isMember) {
      return res.status(200).json({ verified: true });
    }
    return res.status(200).json({
      verified: false,
      message:
        'You have not joined our official Telegram channel yet! Tap "1. Join Official Telegram Channel" above, join first, then tap Verify.',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const update = req.body || {};

  // Automatically capture the private channel's numeric ID whenever a post occurs in the channel
  if (update.channel_post?.chat?.id) {
    cachedChannelId = update.channel_post.chat.id;
    return res.status(200).json({ ok: true });
  }

  // Handle Inline Button Clicks
  if (update.callback_query) {
    const cq = update.callback_query;
    const chatId = cq.message?.chat?.id;
    const userId = cq.from?.id;
    const action = cq.data;

    await callTelegram('answerCallbackQuery', { callback_query_id: cq.id });

    if (action === 'CHECK_STATUS' && chatId && userId) {
      const status = await checkUserMembership(userId);
      const reply = status.isMember
        ? `✅ <b>VERIFIED MEMBER!</b>\n\nThank you for joining <b>U.K BETTING TIPS</b>.\nCopy your ID below and paste it into the app:\n\n🆔 <code>${userId}</code>`
        : `⚠️ <b>NOT JOINED YET</b>\n\nPlease tap <b>"1. Join Official Channel"</b> first, join the channel, and then tap <b>Check My Membership Status</b> again.`;

      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: reply,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📢 1. Join Official Channel', url: CHANNEL_INVITE }],
            [{ text: '🚀 Open U.K Football Insight App', url: APP_URL }],
          ],
        },
      });
    }

    if (action === 'VIP_INFO' && chatId) {
      const vipText =
        `👑 <b>U.K FOOTBALL INSIGHT — VIP MEMBERSHIP</b>\n\n` +
        `⚡ <b>DAY DEAL VIP (20 – 70 Odds):</b> KES 350/=\n` +
        `🏆 <b>VIP MONTHLY ELITE (70 – 100 Odds):</b> KES 3,500/=\n\n` +
        `💳 <b>Official M-Pesa / Airtel Payment Number:</b>\n` +
        `<code>0754346915</code>\n\n` +
        `<i>Open the app to pay or redeem your Daily Insight Wallet credits!</i>`;

      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: vipText,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Unlock VIP in App', url: APP_URL }],
            [{ text: '💬 Contact Support Desk', url: WHATSAPP_SUPPORT }],
          ],
        },
      });
    }

    return res.status(200).json({ ok: true });
  }

  // Handle User Text Commands (/start, /id, /vip, /help)
  const msg = update.message;
  if (msg && msg.chat && msg.from) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = (msg.from.first_name || 'Member').replace(/[<>&]/g, '');
    const text = (msg.text || '').trim().toLowerCase();

    if (text === '/id') {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `🆔 <b>Your Telegram Verification ID:</b>\n<code>${userId}</code>\n\n<i>(Tap the number above to copy it)</i>`,
        parse_mode: 'HTML',
      });
      return res.status(200).json({ ok: true });
    }

    const welcomeHtml =
      `🇬🇧 <b>U.K FOOTBALL INSIGHT — OFFICIAL DESK</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Welcome, <b>${firstName}</b>! 👋\n\n` +
      `📊 <b>98% Statistical Match Analysis</b>\n` +
      `⚽ Daily Free (2–5 Odds) &amp; VIP Slips\n` +
      `🔔 Instant Goal &amp; Matchday Alerts\n\n` +
      `🆔 <b>Your Verification ID (Tap to Copy):</b>\n` +
      `👉 <code>${userId}</code>\n\n` +
      `<b>How to Unlock the App:</b>\n` +
      `1️⃣ Tap <b>"1. Join Official Channel"</b> below\n` +
      `2️⃣ Tap your ID (<code>${userId}</code>) to copy it\n` +
      `3️⃣ Paste it inside the app &amp; tap <b>Verify</b>`;

    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: welcomeHtml,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📢 1. Join Official Channel', url: CHANNEL_INVITE }],
          [{ text: '✅ 2. Check My Membership Status', callback_data: 'CHECK_STATUS' }],
          [
            { text: '🚀 Open App', url: APP_URL },
            { text: '👑 VIP Plans', callback_data: 'VIP_INFO' },
          ],
          [{ text: '💬 24/7 WhatsApp Support', url: WHATSAPP_SUPPORT }],
        ],
      },
    });
  }

  return res.status(200).json({ ok: true });
}
