const PAYSTACK_INITIALIZE_URL = 'https://api.paystack.co/transaction/initialize';
const DEFAULT_PLAN_CODE = 'PLN_wwf2ui1yvz9i92p';
const DEFAULT_AMOUNT_KOBO = 24000;

function json(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(body));
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return json(response, 405, { error: 'Method not allowed' });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const planCode = process.env.PAYSTACK_SUPPORT_PLAN || DEFAULT_PLAN_CODE;
  const siteUrl = (process.env.SITE_URL || 'https://anthemresearch.xyz').replace(/\/$/, '');

  if (!secretKey) {
    return json(response, 500, { error: 'PAYSTACK_SECRET_KEY is not configured' });
  }

  let body = request.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return json(response, 400, { error: 'Invalid request body' });
    }
  }

  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return json(response, 400, { error: 'A valid email address is required' });
  }

  const payload = {
    email,
    amount: DEFAULT_AMOUNT_KOBO,
    currency: 'ZAR',
    plan: planCode,
    callback_url: `${siteUrl}/support-thanks.html`,
    metadata: {
      source: 'anthem_support',
      name
    }
  };

  const paystackResponse = await fetch(PAYSTACK_INITIALIZE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await paystackResponse.json().catch(() => null);

  if (!paystackResponse.ok || !data || data.status !== true) {
    return json(response, 502, {
      error: 'Paystack checkout could not be initialized',
      detail: data && data.message ? data.message : null
    });
  }

  return json(response, 200, {
    authorization_url: data.data.authorization_url,
    reference: data.data.reference
  });
};
