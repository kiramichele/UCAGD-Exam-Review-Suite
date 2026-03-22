// notes.js
(async function () {
  let notes = [];
  let activeId = null;

  const navEl     = document.getElementById('notes-nav');
  const contentEl = document.getElementById('notes-content');

  try {
    const res = await fetch('data/notes.json');
    notes = await res.json();
  } catch (e) {
    contentEl.innerHTML = '<p style="color:var(--error)">Error loading notes.</p>';
    return;
  }

  // Build sidebar nav
  notes.forEach(topic => {
    const a = document.createElement('a');
    a.className = 'notes-nav-item';
    a.href = '#';
    a.innerHTML = `<span class="nav-icon">${topic.icon}</span>${topic.title}`;
    a.dataset.id = topic.id;
    a.addEventListener('click', e => {
      e.preventDefault();
      loadTopic(topic.id);
    });
    navEl.appendChild(a);
  });

  function loadTopic(id) {
    activeId = id;

    // Update nav active state
    navEl.querySelectorAll('.notes-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });

    const topic = notes.find(t => t.id === id);
    if (!topic) return;

    contentEl.innerHTML = '';
    contentEl.classList.add('fade-in');

    // Header
    const header = document.createElement('div');
    header.className = 'notes-topic-header';
    header.innerHTML = `
      <div class="notes-topic-icon">${topic.icon}</div>
      <div>
        <h2 style="margin-bottom:4px;">${topic.title}</h2>
        <span class="${window.topicBadgeClass(topic.title)}">${topic.title}</span>
      </div>
    `;
    contentEl.appendChild(header);

    // Intro
    const intro = document.createElement('p');
    intro.className = 'notes-topic-intro';
    intro.textContent = topic.intro;
    contentEl.appendChild(intro);

    // Accordion sections
    const accordion = document.createElement('div');
    accordion.className = 'notes-accordion';

    topic.sections.forEach((section, i) => {
      const item = document.createElement('div');
      item.className = 'notes-accordion-item';

      const header = document.createElement('div');
      header.className = 'notes-accordion-header' + (i === 0 ? ' open' : '');
      header.innerHTML = `${section.heading} <span class="notes-accordion-chevron">▼</span>`;

      const body = document.createElement('div');
      body.className = 'notes-accordion-body' + (i === 0 ? ' open' : '');
      body.innerHTML = section.content;

      header.addEventListener('click', () => {
        const isOpen = header.classList.contains('open');
        header.classList.toggle('open', !isOpen);
        body.classList.toggle('open', !isOpen);
      });

      item.appendChild(header);
      item.appendChild(body);
      accordion.appendChild(item);
    });
    contentEl.appendChild(accordion);

    // Exam tips
    if (topic.examTips && topic.examTips.length) {
      const tips = document.createElement('div');
      tips.className = 'exam-tips-card';
      tips.innerHTML = `<h4>🎯 Exam Tips</h4><ul>${topic.examTips.map(t => `<li>${t}</li>`).join('')}</ul>`;
      contentEl.appendChild(tips);
    }
  }

  // Load first topic by default
  if (notes.length > 0) {
    loadTopic(notes[0].id);
  }
})();
