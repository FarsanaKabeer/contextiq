const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

const ACTION_PROMPTS = {
  summarize: 'Summarize this content in 4-6 bullet points. Be concise.',
  explain: 'Identify and explain the key points in plain language.',
  extract: 'Extract all important facts, figures, names, and dates as a list.',
  rewrite: 'Rewrite this text to be clearer and more professional.'
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ciq-summarize',
    title: '⚡ Summarize with ContextIQ',
    contexts: ['selection', 'page']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.sendMessage(tab.id, { type: 'OPEN_PANEL' });
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.type !== 'ANALYSE') return;

  chrome.storage.local.get(['apiKey'], function(data) {
    console.log('API Key:', data.apiKey ? 'YES' : 'NO KEY');

    const key = data.apiKey;
    if (!key) {
      sendResponse({ result: '⚠ No API key set. Click the extension icon to add one.' });
      return;
    }

    fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: 'You are ContextIQ, an AI browser assistant. Be concise and use bullet points.'
          },
          {
            role: 'user',
            content: ACTION_PROMPTS[msg.action] + '\n\nURL: ' + msg.url + '\n\n---\n' + msg.content
          }
        ]
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(json) {
      console.log('Groq response:', JSON.stringify(json));
      const result = json.choices?.[0]?.message?.content || 'No response.';
      sendResponse({ result: result });
    })
    .catch(function(err) {
      console.log('Error:', err.message);
      sendResponse({ result: 'Error: ' + err.message });
    });
  });

  return true;
});