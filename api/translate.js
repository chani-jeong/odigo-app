export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  
  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing text or targetLang' });
  }

  try {
    const r = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: [text], 
        target_lang: targetLang.toUpperCase() 
      }),
    });
    
    const data = await r.json();
    res.status(200).json({ translated: data.translations?.[0]?.text || text });
  } catch (e) {
    console.error('Translation error:', e);
    res.status(500).json({ error: 'translation failed' });
  }
}
