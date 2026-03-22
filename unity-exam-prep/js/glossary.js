// glossary.js
(async function () {
  const TOPICS = ['All','Unity Interface','C# Scripting','Physics','Animation','Audio','Lighting & Rendering','UI Systems','2D Development','Project & Workflow'];

  let allTerms = [], activeTopic = 'All', activeLetter = 'All', searchQuery = '';

  const alphaNav    = document.getElementById('alpha-nav');
  const listEl      = document.getElementById('glossary-list');
  const emptyState  = document.getElementById('empty-state');
  const filterWrap  = document.getElementById('topic-filters');
  const searchInput = document.getElementById('glossary-search');

  try {
    const res = await fetch('data/glossary.json');
    allTerms = await res.json();
    // Sort alphabetically
    allTerms.sort((a, b) => a.term.localeCompare(b.term));
  } catch (e) {
    listEl.innerHTML = '<p style="color:var(--error)">Error loading glossary.</p>';
    return;
  }

  // Build topic filters
  TOPICS.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill' + (topic === 'All' ? ' active' : '');
    btn.textContent = topic;
    btn.addEventListener('click', () => {
      activeTopic = topic;
      activeLetter = 'All';
      document.querySelectorAll('#topic-filters .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateAlphaNav();
      render();
    });
    filterWrap.appendChild(btn);
  });

  // Search
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase().trim();
    activeLetter = 'All';
    updateAlphaNav();
    render();
  });

  function getFiltered() {
    return allTerms.filter(t => {
      const topicOk  = activeTopic === 'All' || t.topic === activeTopic;
      const letterOk = activeLetter === 'All' || t.term[0].toUpperCase() === activeLetter;
      const searchOk = !searchQuery ||
        t.term.toLowerCase().includes(searchQuery) ||
        t.definition.toLowerCase().includes(searchQuery);
      return topicOk && letterOk && searchOk;
    });
  }

  function updateAlphaNav() {
    const filteredForLetters = allTerms.filter(t =>
      (activeTopic === 'All' || t.topic === activeTopic) &&
      (!searchQuery || t.term.toLowerCase().includes(searchQuery) || t.definition.toLowerCase().includes(searchQuery))
    );
    const availableLetters = new Set(filteredForLetters.map(t => t.term[0].toUpperCase()));

    alphaNav.innerHTML = '';

    // "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'alpha-btn' + (activeLetter === 'All' ? ' active' : '');
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', () => {
      activeLetter = 'All';
      updateAlphaNav();
      render();
    });
    alphaNav.appendChild(allBtn);

    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
      const btn = document.createElement('button');
      const has = availableLetters.has(letter);
      btn.className = 'alpha-btn' + (activeLetter === letter ? ' active' : '') + (!has ? ' inactive' : '');
      btn.textContent = letter;
      if (has) {
        btn.addEventListener('click', () => {
          activeLetter = letter;
          updateAlphaNav();
          render();
        });
      }
      alphaNav.appendChild(btn);
    });
  }

  function render() {
    const filtered = getFiltered();
    listEl.innerHTML = '';
    emptyState.style.display = filtered.length === 0 ? 'block' : 'none';
    if (filtered.length === 0) return;

    // Group by first letter
    const groups = {};
    filtered.forEach(t => {
      const letter = t.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(t);
    });

    Object.keys(groups).sort().forEach(letter => {
      const group = document.createElement('div');
      group.className = 'glossary-letter-group';
      group.id = 'letter-' + letter;

      const heading = document.createElement('div');
      heading.className = 'glossary-letter-heading';
      heading.textContent = letter;
      group.appendChild(heading);

      groups[letter].forEach(term => {
        const item = document.createElement('div');
        item.className = 'glossary-term';
        item.innerHTML = `
          <div class="glossary-term-name">${highlight(term.term)}</div>
          <div class="glossary-term-def">
            ${highlight(term.definition)}
            <span style="margin-left:8px;">${`<span class="${window.topicBadgeClass(term.topic)} badge" style="font-size:0.68rem;">${term.topic}</span>`}</span>
          </div>
        `;
        group.appendChild(item);
      });

      listEl.appendChild(group);
    });
  }

  function highlight(text) {
    if (!searchQuery) return text;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark style="background:#fef08a;border-radius:2px;">$1</mark>');
  }

  updateAlphaNav();
  render();
})();
