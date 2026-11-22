export async function postToTelegramChannel(params: {
  botToken?: string;
  channelId?: string;
  channelUrl?: string;
  text: string;
  appUrl?: string;
}): Promise<{ ok: boolean; errorMsg?: string }> {
  const token = (params.botToken || '').trim();
  if (!token) return { ok: false, errorMsg: 'Telegram Bot Token is empty.' };

  let chatId = (params.channelId || '').trim();
  if (!chatId && params.channelUrl) {
    const match = params.channelUrl.match(/t\.me\/([a-zA-Z0-9_]+)/);
    if (match && match[1] && match[1].charAt(0) !== "+") {
      chatId = `@${match[1]}`;
    }
  }
  if (!chatId) {
    return {
      ok: false,
      errorMsg: 'Enter your Channel -100... Chat ID or @username in Admin Settings.',
    };
  }

  try {
    const relayRes = await fetch('/api/telegram-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        botToken: token,
        chatId,
        text: params.text,
        appUrl: params.appUrl,
      }),
    });
    if (relayRes.ok) {
      const data = await relayRes.json();
      return data;
    }
  } catch {}

  try {
    const directRes = await fetch(`https://telegram.org{token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: params.text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const data = await directRes.json();
    if (!data.ok) return { ok: false, errorMsg: data.description || 'Telegram rejected message' };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, errorMsg: err?.message || 'Network error' };
  }
}
