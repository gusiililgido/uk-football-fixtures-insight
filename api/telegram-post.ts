export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, errorMsg: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const token = String(body.botToken || '').trim();
    const chatId = String(body.chatId || '').trim();
    const text = String(body.text || '').trim();
    const appUrl = String(body.appUrl || '').trim();

    if (!token || !chatId || !text) {
      return res.status(400).json({ ok: false, errorMsg: 'Missing botToken, chatId, or text' });
    }

    const tgRes = await fetch(`https://telegram.org{token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: appUrl
          ? { inline_keyboard: [[{ text: '📲 Open Live App & Slips', url: appUrl }]] }
          : undefined,
      }),
    });

    const data = await tgRes.json();
    if (!data.ok) {
      return res.status(200).json({ ok: false, errorMsg: data.description || 'Telegram rejected message' });
    }
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(200).json({ ok: false, errorMsg: err?.message || 'Server relay error' });
  }
}
