import https from 'https';

function callTelegramIPv4(
  token: string,
  methodName: string,
  bodyBuffer: Buffer,
  contentType: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${token}/${methodName}`,
        method: 'POST',
        family: 4,
        timeout: 15000,
        headers: {
          'Content-Type': contentType,
          'Content-Length': bodyBuffer.length,
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
    req.on('timeout', () => req.destroy(new Error('Telegram API request timed out')));
    req.on('error', (err) => reject(err));
    req.write(bodyBuffer);
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
    const photoDataUrl = String(body.photoDataUrl || '').trim();

    if (!token || !chatId || !text) {
      return res.status(400).json({ ok: false, errorMsg: 'Missing botToken, chatId, or text' });
    }

    const replyMarkup = appUrl
      ? JSON.stringify({ inline_keyboard: [[{ text: '📲 Open Live App & Slips', url: appUrl }]] })
      : '';

    if (photoDataUrl && photoDataUrl.startsWith('data:image/')) {
      const m = photoDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (m) {
        const mime = m[1];
        const ext = mime.includes('png') ? 'png' : 'jpg';
        const imgBuf = Buffer.from(m[2], 'base64');
        const boundary = `----TgFormBoundary${Date.now()}`;
        const parts: Buffer[] = [];

        const addField = (name: string, val: string) => {
          parts.push(
            Buffer.from(
              `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${val}\r\n`,
              'utf8'
            )
          );
        };

        addField('chat_id', chatId);
        addField('caption', text.slice(0, 1000));
        addField('parse_mode', 'HTML');
        if (replyMarkup) addField('reply_markup', replyMarkup);

        parts.push(
          Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="winning_slip.${ext}"\r\nContent-Type: ${mime}\r\n\r\n`,
            'utf8'
          )
        );
        parts.push(imgBuf);
        parts.push(Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8'));

        const multipartBuf = Buffer.concat(parts);
        const photoRes = await callTelegramIPv4(
          token,
          'sendPhoto',
          multipartBuf,
          `multipart/form-data; boundary=${boundary}`
        );
        if (photoRes.ok) return res.status(200).json({ ok: true });
      }
    }

    const payload = Buffer.from(
      JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: appUrl
          ? { inline_keyboard: [[{ text: '📲 Open Live App & Slips', url: appUrl }]] }
          : undefined,
      }),
      'utf8'
    );

    const data = await callTelegramIPv4(token, 'sendMessage', payload, 'application/json');
    if (!data.ok) {
      return res.status(200).json({ ok: false, errorMsg: data.description || 'Telegram rejected message' });
    }
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(200).json({ ok: false, errorMsg: err?.message || 'Telegram relay error' });
  }
}
