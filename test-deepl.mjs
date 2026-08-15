
async function test() {
  const apiKey = '3c8c7202-a868-4272-8ba5-9e7fcffcb76a:fx';
  try {
    const r = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: ['Hello world'], target_lang: 'VI' }),
    });
    const text = await r.text();
    console.log('Status:', r.status);
    console.log('Response:', text);
  } catch (e) {
    console.error(e);
  }
}
test();
