// snippets.js
(async function () {
  const TOPICS = ['All','C# Scripting','Physics','Animation','Audio','UI Systems','2D Development','Project & Workflow'];

  let allSnippets = [], activeTopic = 'All', activeDiff = 'all';

  const grid        = document.getElementById('snippets-grid');
  const emptyState  = document.getElementById('empty-state');
  const filterWrap  = document.getElementById('topic-filters');
  const diffSelect  = document.getElementById('diff-filter');

  try {
    const res = await fetch('data/snippets.json');
    allSnippets = await res.json();
  } catch (e) {
    grid.innerHTML = '<p style="color:var(--error)">Error loading snippets.</p>';
    return;
  }

  // Build topic filters
  TOPICS.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill' + (topic === 'All' ? ' active' : '');
    btn.textContent = topic;
    btn.addEventListener('click', () => {
      activeTopic = topic;
      document.querySelectorAll('#topic-filters .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
    filterWrap.appendChild(btn);
  });

  diffSelect.addEventListener('change', e => {
    activeDiff = e.target.value;
    render();
  });

  function diffBadgeClass(diff) {
    return `badge diff-${diff.toLowerCase()}`;
  }

  function render() {
    const filtered = allSnippets.filter(s => {
      const topicOk = activeTopic === 'All' || s.topic === activeTopic;
      const diffOk  = activeDiff === 'all' || s.difficulty === activeDiff;
      return topicOk && diffOk;
    });

    grid.innerHTML = '';
    emptyState.style.display = filtered.length === 0 ? 'block' : 'none';

    filtered.forEach(snippet => {
      const card = document.createElement('div');
      card.className = 'snippet-card';

      card.innerHTML = `
        <div class="snippet-header">
          <div class="snippet-meta">
            <div class="snippet-title">${snippet.title}</div>
            <div class="snippet-desc">${snippet.description}</div>
          </div>
          <div class="snippet-badges">
            <span class="${window.topicBadgeClass(snippet.topic)}">${snippet.topic}</span>
            <span class="${diffBadgeClass(snippet.difficulty)} badge">${snippet.difficulty}</span>
          </div>
        </div>
        <div class="snippet-code-wrap">
          <button class="snippet-copy-btn" data-code="${encodeURIComponent(snippet.code)}">Copy</button>
          <pre><code class="language-csharp">${escapeHtml(snippet.code)}</code></pre>
        </div>
      `;

      // Copy button
      card.querySelector('.snippet-copy-btn').addEventListener('click', function () {
        const code = decodeURIComponent(this.dataset.code);
        navigator.clipboard.writeText(code).then(() => {
          this.textContent = '✓ Copied!';
          this.classList.add('copied');
          setTimeout(() => {
            this.textContent = 'Copy';
            this.classList.remove('copied');
          }, 2000);
        });
      });

      grid.appendChild(card);
    });

    // Trigger Prism highlighting
    if (window.Prism) Prism.highlightAllUnder(grid);
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  render();
})();
