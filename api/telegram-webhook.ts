export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, status: 'UK Football Insight Bot Active' });
  }

  const token = '9235004140:AAFQnk7qv6ABm9aIRXiHbrtOcUcnGnYcDiY';
  const update = req.body || {};
  const msg = update.message;

  if (msg && msg.chat && msg.from) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || 'Member';

    const replyText =
      `Welcome ${firstName} to U.K FOOTBALL INSIGHT! ⚽🔥\n\n` +
      `✅ Your Telegram Verification ID is:\n` +
      `👉 ${userId}\n\n` +
      `How to unlock the app:\n` +
      `1. Join our official channel: https://t.me\n` +
      `2. Copy your ID (${userId}) and paste it in the app verification box!`;

    const sendUrl = 'https://' + `api.telegram.org/bot${token}/sendMessage`;
    await fetch(sendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
      }),
    });
  }

  return res.status(200).json({ ok: true });
}
