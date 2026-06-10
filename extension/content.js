if (typeof panel === 'undefined') var panel = null;function getPageContent() {
  const selected = window.getSelection().toString().trim();
  if (selected.length > 50) return { content: selected, url: location.href };
  const main = document.querySelector('article, main, [role="main"], .content, #content');
  const text = (main || document.body).innerText.slice(0, 8000);
  return { content: text, url: location.href };
}

function createPanel() {
  if (panel) { panel.style.display = 'flex'; return; }
  panel = document.createElement('div');
  panel.id = 'ciq-panel';
  panel.innerHTML = `
    <div id="ciq-header">
      <span>⚡ ContextIQ</span>
      <button id="ciq-close">✕</button>
    </div>
    <div id="ciq-actions">
      <button class="ciq-btn" data-action="summarize">Summarize</button>
      <button class="ciq-btn" data-action="explain">Explain</button>
      <button class="ciq-btn" data-action="extract">Extract facts</button>
      <button class="ciq-btn" data-action="rewrite">Rewrite</button>
    </div>
    <div id="ciq-output"><p id="ciq-placeholder">Select an action above.</p></div>
    <div id="ciq-footer"><button id="ciq-copy">Copy</button></div>
  `;
  document.body.appendChild(panel);

  document.getElementById('ciq-close').onclick = () => panel.style.display = 'none';
  document.getElementById('ciq-copy').onclick = () => {
    navigator.clipboard.writeText(document.getElementById('ciq-output').innerText);
  };
  panel.querySelectorAll('.ciq-btn').forEach(btn => {
    btn.onclick = () => runAction(btn.dataset.action);
  });
}

async function runAction(action) {
  const output = document.getElementById('ciq-output');
  output.innerHTML = '<p class="ciq-loading">Analysing…</p>';
  const pageData = getPageContent();
  const response = await chrome.runtime.sendMessage({
    type: 'ANALYSE', action,
    content: pageData.content,
    url: pageData.url
  });
  output.innerHTML = `<p>${response.result.replace(/\n/g, '<br>')}</p>`;
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'OPEN_PANEL') createPanel();
});