// src/app/api/send-to-telegram/route.js
const TELEGRAM_API_BASE = (token) => `https://api.telegram.org/bot${token}`;

async function safeFetchTelegram(token, method, payload) {
  try {
    const resp = await fetch(`${TELEGRAM_API_BASE(token)}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await resp.text().catch(()=>null);
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { /* ignore parse */ }
    return { ok: resp.ok, status: resp.status, json, raw: text };
  } catch (err) {
    return { ok: false, status: 0, error: String(err?.message ?? err) };
  }
}

export async function POST(req) {
  const dev = process.env.NODE_ENV !== 'production';
  try {
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
    const CHAT_IDS_RAW = (process.env.TELEGRAM_CHAT_ID || '')
      .split(',').map(s => s.trim()).filter(Boolean);

    if (!TOKEN || CHAT_IDS_RAW.length === 0) {
      const errMsg = 'Misconfigured env: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing';
      console.error('[send-to-telegram]', errMsg, { TOKEN_exists: !!TOKEN, CHAT_IDS_RAW });
      return new Response(JSON.stringify({ ok: false, error: errMsg }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }

    const body = await req.json().catch(() => ({}));
    console.log('[send-to-telegram] incoming body:', body);

    if (body.honeypot) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200, headers: { 'Content-Type': 'application/json' }});
    }

    const S = v => String(v ?? '').replace(/[`<>\r\t]/g,' ').replace(/\s{2,}/g,' ').trim();
    const clip = (t,n) => (t.length>n ? t.slice(0,n-1)+'…' : t);

    const formName = S(body.form || 'Форма заявки');
    const name = S(body.name || body.username);
    const phone = S(body.phone || body.tel);
    const email = S(body.email || body.useremail);
    const msg = S(body.message || body.comment);
    const metaUrl = S(body.page || body.url);
    const ua = S(body.ua);

    const text = clip([
      '🆕 Новая заявка с сайта',
      `📄 Форма: ${formName}`,
      name ? `👤 Имя: ${name}` : '',
      phone ? `📞 Телефон: ${phone}` : '',
      email ? `✉️ Email: ${email}` : '',
      msg ? ['📝 Сообщение:', msg].join('\n') : '',
      metaUrl ? `🔗 Страница: ${metaUrl}` : '',
      ua ? `🖥 UA: ${ua}` : ''
    ].filter(Boolean).join('\n'), 3500);

    const results = [];
    for (const raw of CHAT_IDS_RAW) {
      console.log('[send-to-telegram] sending to', raw);
      if (raw.startsWith('@')) {
        const getChat = await safeFetchTelegram(TOKEN, 'getChat', { chat_id: raw });
        console.log('[send-to-telegram] getChat', raw, getChat);
        if (getChat.ok && getChat.json && getChat.json.result && typeof getChat.json.result.id !== 'undefined') {
          const numericId = getChat.json.result.id;
          const sendRes = await safeFetchTelegram(TOKEN, 'sendMessage', { chat_id: numericId, text, disable_web_page_preview: true });
          results.push({ target: raw, resolvedTo: numericId, ok: !!sendRes.ok, sendRes });
        } else {
          const sendRes = await safeFetchTelegram(TOKEN, 'sendMessage', { chat_id: raw, text, disable_web_page_preview: true });
          results.push({ target: raw, ok: !!sendRes.ok, sendRes });
        }
      } else {
        const sendRes = await safeFetchTelegram(TOKEN, 'sendMessage', { chat_id: raw, text, disable_web_page_preview: true });
        results.push({ target: raw, ok: !!sendRes.ok, sendRes });
      }
    }

    const allOk = results.every(r => r.ok);
    // Возвращаем 200 всегда — клиент не получит 502, но увидит ok:false в JSON если что-то пошло не так.
    return new Response(JSON.stringify({ ok: allOk, results }), { status: 200, headers: { 'Content-Type': 'application/json' }});
  } catch (err) {
    console.error('[send-to-telegram] unexpected', err);
    const payload = { ok: false, error: String(err?.message ?? err) };
    if (dev) payload.stack = err?.stack ?? null;
    return new Response(JSON.stringify(payload), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}
