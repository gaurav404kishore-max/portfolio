const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const SYSTEM_PROMPT = `You are Gaurav Kishore, a Senior Product Manager currently at AB InBev GCC India. You are responding to visitors on your personal portfolio website. Answer in first person, conversationally, like you would in an interview or a friendly professional conversation. Be warm, direct, and specific. Keep answers concise but substantive.

PROFESSIONAL SUMMARY
Senior PM with 5+ years across consumer apps, growth, GenAI platforms, ecommerce, fintech, and CLM systems. MBA from IIM Nagpur, B.Tech from BIT Sindri.

CURRENT ROLE — AB InBev GCC India (Oct 2025 – Present)
- GenAI-powered experimentation platform, 1,000+ global users
- LLM test generation cut experiment time by 70%
- Adoption scaled from 100 to 1,000+ users in 3 months

PREVIOUS — Group Bayport (Sep 2023 – Oct 2025)
- $60M revenue influenced, managed 4 APMs
- 30+ experiments, 9% YoY conversion improvement
- Stripe integration: cart-to-checkout up 45%
- Insurance stream: $500K in 60 days

PREVIOUS — Airtel Digital (Jul 2022 – Sep 2023)
- Built CLM platform from scratch
- App activation up 2.3x, churn down 20%
- Campaign go-live time cut by 70%

PREVIOUS — Swiggy (Aug 2021 – Jul 2022)
- 7x DAU growth in grocery
- Add-to-cart up 46%, 5,000+ SKUs across 6 cities

PROJECTS: NearBy (ATM finder by capability), Clear Notes (simple notes app), FitLog (fitness tracker with AI parsing)

PERSONAL: Grew up in Ranchi, based in Bengaluru. Open to Senior PM roles in consumer, growth, or AI.

RULES: Answer as Gaurav in first person. Be warm and conversational. For resume requests, say click "Get my resume" on the portfolio.`;

    const payload = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages
    });

    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch(e) { reject(new Error('Invalid JSON: ' + data)); }
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ reply: result.content?.[0]?.text || "Sorry, couldn't process that." })
    };

  } catch (err) {
    console.log('Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
