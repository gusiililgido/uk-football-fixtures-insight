import https from 'https';

function postTelegramIPv4(token: string, payload: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        family: 4,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch {
            reject(new Error(`Invalid Telegram response (${res.statusCode})`));
          }
        });
      }
    );
    req.on('timeout', () => {
      req.destroy(new Error('Telegram API request timed out'));
    });
    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

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

    const payload = JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: appUrl
        ? { inline_keyboard: [[{ text: '📲 Open Live App & Slips', url: appUrl }]] }
        : undefined,
    });

    const data = await postTelegramIPv4(token, payload);
    if (!data.ok) {
      return res.status(200).json({ ok: false, errorMsg: data.description || 'Telegram rejected message' });
    }
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(200).json({ ok: false, errorMsg: err?.message || 'Telegram relay error' });
  }
}
