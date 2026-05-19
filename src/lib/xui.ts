// src/lib/xui.ts
// کلاینت 3x-UI / X-UI panel API
// اینجا اطلاعات سرور رو از ENV می‌خونه

const XUI_BASE_URL = process.env.XUI_PANEL_URL!;   // مثلاً: http://46.226.161.214:54321
const XUI_USERNAME = process.env.XUI_USERNAME!;     // یوزر پنل
const XUI_PASSWORD = process.env.XUI_PASSWORD!;     // پسورد پنل
const XUI_SECRET   = process.env.XUI_SECRET_PATH || ''; // /secret-path اگه داری

let sessionCookie: string | null = null;
let cookieExpiry: number = 0;

/**
 * لاگین به پنل و گرفتن session cookie
 */
async function loginToPanel(): Promise<string> {
  const now = Date.now();
  if (sessionCookie && now < cookieExpiry) {
    return sessionCookie;
  }

  const res = await fetch(`${XUI_BASE_URL}${XUI_SECRET}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: XUI_USERNAME, password: XUI_PASSWORD }),
  });

  if (!res.ok) throw new Error('XUI panel login failed');

  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) throw new Error('No session cookie received');

  sessionCookie = setCookie.split(';')[0];
  cookieExpiry = now + 23 * 60 * 60 * 1000; // 23 ساعت

  return sessionCookie;
}

/**
 * ساخت کلاینت جدید در پنل — برای هر خرید اشتراک
 */
export async function createXUIClient(params: {
  inboundId: number;
  email: string;        // شناسه یکتا (telegramId + planId)
  dataLimitGB: number | null; // null = نامحدود
  expiryDays: number;
}): Promise<{ configUrl: string; subLink: string }> {
  const cookie = await loginToPanel();

  const expiryTime = params.expiryDays > 0
    ? Date.now() + params.expiryDays * 24 * 60 * 60 * 1000
    : 0;

  const dataLimitBytes = params.dataLimitGB
    ? params.dataLimitGB * 1024 * 1024 * 1024
    : 0;

  const clientId = crypto.randomUUID();

  const body = {
    id: params.inboundId,
    settings: JSON.stringify({
      clients: [{
        id: clientId,
        email: params.email,
        enable: true,
        expiryTime,
        totalGB: dataLimitBytes,
        flow: 'xtls-rprx-vision',
      }]
    })
  };

  const res = await fetch(`${XUI_BASE_URL}${XUI_SECRET}/panel/api/inbounds/addClient`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.success) throw new Error(`XUI client creation failed: ${data.msg}`);

  // ساخت لینک config
  const serverHost = process.env.XUI_SERVER_HOST!;
  const serverPort = process.env.XUI_SERVER_PORT || '443';
  const serverSNI  = process.env.XUI_SERVER_SNI || serverHost;

  const configUrl = `vless://${clientId}@${serverHost}:${serverPort}?type=tcp&security=reality&flow=xtls-rprx-vision&sni=${serverSNI}#Titan_${params.email}`;
  const subLink   = `${XUI_BASE_URL}${XUI_SECRET}/sub/${clientId}`;

  return { configUrl, subLink };
}

/**
 * گرفتن آمار مصرف یه کلاینت
 */
export async function getClientStats(inboundId: number, email: string) {
  try {
    const cookie = await loginToPanel();

    const res = await fetch(
      `${XUI_BASE_URL}${XUI_SECRET}/panel/api/inbounds/getClientTraffics/${email}`,
      { headers: { Cookie: cookie } }
    );

    const data = await res.json();
    if (!data.success) return null;

    return {
      up: data.obj?.up || 0,
      down: data.obj?.down || 0,
      total: data.obj?.total || 0,
      enable: data.obj?.enable || false,
      expiryTime: data.obj?.expiryTime || 0,
    };
  } catch {
    return null;
  }
}

/**
 * تمدید اشتراک
 */
export async function renewXUIClient(params: {
  inboundId: number;
  email: string;
  extraDays: number;
  dataLimitGB: number | null;
}): Promise<boolean> {
  try {
    const cookie = await loginToPanel();
    const stats = await getClientStats(params.inboundId, params.email);
    if (!stats) return false;

    const currentExpiry = stats.expiryTime > 0 ? stats.expiryTime : Date.now();
    const newExpiry = currentExpiry + params.extraDays * 24 * 60 * 60 * 1000;
    const dataLimitBytes = params.dataLimitGB ? params.dataLimitGB * 1024 * 1024 * 1024 : 0;

    const res = await fetch(`${XUI_BASE_URL}${XUI_SECRET}/panel/api/inbounds/updateClient/${params.email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({
        id: params.inboundId,
        settings: JSON.stringify({
          clients: [{
            email: params.email,
            enable: true,
            expiryTime: newExpiry,
            totalGB: dataLimitBytes,
          }]
        })
      })
    });

    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

/**
 * حذف کلاینت (بعد از انقضا)
 */
export async function deleteXUIClient(inboundId: number, clientId: string): Promise<boolean> {
  try {
    const cookie = await loginToPanel();
    const res = await fetch(
      `${XUI_BASE_URL}${XUI_SECRET}/panel/api/inbounds/${inboundId}/delClient/${clientId}`,
      { method: 'POST', headers: { Cookie: cookie } }
    );
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}