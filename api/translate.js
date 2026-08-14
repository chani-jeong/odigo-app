export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { text, targetLang } = req.body;
  
  if (!process.env.DEEPL_API_KEY) {
    return res.status(500).json({ error: 'DEEPL_API_KEY is not set' });
  }
  
  try {
    const r = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: [text], target_lang: targetLang.toUpperCase() }),
    });
    
    const raw = await r.text();
    console.log('DeepL status:', r.status, 'body:', raw);
    
    if (!r.ok) {
      return res.status(r.status).json({ error: 'DeepL error', status: r.status, detail: raw });
    }
    
    const data = JSON.parse(raw);
    const translated = data.translations?.[0]?.text;
    if (!translated) {
      return res.status(500).json({ error: 'no translation in response', detail: raw });
    }
    res.status(200).json({ translated });
  } catch (e) {
    res.status(500).json({ error: 'request failed', detail: String(e) });
  }
}
