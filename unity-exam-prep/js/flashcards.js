// flashcards.js
(async function () {
  const TOPICS = ['All','Unity Interface','C# Scripting','Physics','Animation','Audio','Lighting & Rendering','UI Systems','2D Development','Project & Workflow'];

  let allCards = [], filteredCards = [], currentIndex = 0, activeTopic = 'All';

  // DOM refs
  const scene       = document.getElementById('flashcard-scene');
  const frontText   = document.getElementById('card-front-text');
  const backText    = document.getElementById('card-back-text');
  const counter     = document.getElementById('card-counter');
  const progress    = document.getElementById('progress-fill');
  const topicBadge  = document.getElementById('topic-badge-display');
  const filterWrap  = document.getElementById('topic-filters');
  const emptyState  = document.getElementById('empty-state');
  const stage       = document.getElementById('flashcard-stage');

  // Load data
  try {
    const res = await fetch('data/flashcards.json');
    allCards = await res.json();
  } catch (e) {
    frontText.textContent = 'Error loading flashcards.';
    return;
  }

  // Build filter pills
  TOPICS.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill' + (topic === 'All' ? ' active' : '');
    btn.textContent = topic;
    btn.addEventListener('click', () => {
      activeTopic = topic;
      document.querySelectorAll('#topic-filters .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter();
    });
    filterWrap.appendChild(btn);
  });

  function applyFilter() {
    filteredCards = activeTopic === 'All'
      ? [...allCards]
      : allCards.filter(c => c.topic === activeTopic);
    currentIndex = 0;
    unflip();
    render();
  }

  function render() {
    const isEmpty = filteredCards.length === 0;
    scene.style.display    = isEmpty ? 'none' : 'block';
    emptyState.style.display = isEmpty ? 'block' : 'none';
    document.querySelector('.flashcard-controls').style.display = isEmpty ? 'none' : 'flex';
    document.querySelector('.flashcard-counter').style.display  = isEmpty ? 'none' : 'flex';
    if (isEmpty) return;

    const card = filteredCards[currentIndex];
    frontText.innerHTML = card.front;
    backText.innerHTML  = card.back;

    const n = filteredCards.length;
    counter.textContent = `${currentIndex + 1} / ${n}`;
    progress.style.width = `${((currentIndex + 1) / n) * 100}%`;
    topicBadge.innerHTML = `<span class="${window.topicBadgeClass(card.topic)}">${card.topic}</span>`;
  }

  function unflip() {
    scene.classList.remove('flipped');
  }

  // Flip on click
  scene.addEventListener('click', () => scene.classList.toggle('flipped'));

  // Controls
  document.getElementById('btn-next').addEventListener('click', () => {
    if (currentIndex < filteredCards.length - 1) {
      currentIndex++;
      unflip();
      setTimeout(render, 10);
    }
  });

  document.getElementById('btn-prev').addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      unflip();
      setTimeout(render, 10);
    }
  });

  document.getElementById('btn-shuffle').addEventListener('click', () => {
    for (let i = filteredCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]];
    }
    currentIndex = 0;
    unflip();
    render();
  });

  document.getElementById('btn-restart').addEventListener('click', () => {
    currentIndex = 0;
    unflip();
    render();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') document.getElementById('btn-next').click();
    if (e.key === 'ArrowLeft')  document.getElementById('btn-prev').click();
    if (e.key === ' ') { e.preventDefault(); scene.click(); }
  });

  applyFilter();
})();
