// quiz.js
(async function () {
  const TOPICS = ['All','Unity Interface','C# Scripting','Physics','Animation','Audio','Lighting & Rendering','UI Systems','2D Development','Project & Workflow'];
  const LETTERS = ['A','B','C','D'];

  let allQuestions = [], queue = [], current = 0, score = 0, answered = false, activeTopic = 'All';

  // DOM
  const filterWrap    = document.getElementById('topic-filters');
  const startScreen   = document.getElementById('quiz-start');
  const questionWrap  = document.getElementById('quiz-question-wrap');
  const resultsScreen = document.getElementById('quiz-results');
  const progressBar   = document.getElementById('quiz-progress');
  const qNum          = document.getElementById('q-num');
  const qTopicBadge   = document.getElementById('q-topic-badge');
  const qText         = document.getElementById('q-text');
  const qOptions      = document.getElementById('q-options');
  const qExplanation  = document.getElementById('q-explanation');
  const qExplText     = document.getElementById('q-explanation-text');
  const btnNext       = document.getElementById('btn-next-q');
  const btnStart      = document.getElementById('btn-start');
  const btnRetry      = document.getElementById('btn-retry');

  // Load
  try {
    const res = await fetch('data/questions.json');
    allQuestions = await res.json();
  } catch (e) {
    startScreen.querySelector('p').textContent = 'Error loading questions.';
    return;
  }

  // Filter pills
  TOPICS.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill' + (topic === 'All' ? ' active' : '');
    btn.textContent = topic;
    btn.addEventListener('click', () => {
      activeTopic = topic;
      document.querySelectorAll('#topic-filters .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    filterWrap.appendChild(btn);
  });

  function buildQueue() {
    const filtered = activeTopic === 'All'
      ? [...allQuestions]
      : allQuestions.filter(q => q.topic === activeTopic);
    // Shuffle
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    return filtered;
  }

  function startQuiz() {
    queue = buildQueue();
    current = 0;
    score = 0;
    startScreen.style.display = 'none';
    resultsScreen.style.display = 'none';
    questionWrap.style.display = 'block';
    renderQuestion();
  }

  function renderQuestion() {
    answered = false;
    btnNext.style.display = 'none';
    qExplanation.classList.remove('visible');
    qOptions.innerHTML = '';

    const q = queue[current];
    const total = queue.length;

    progressBar.style.width = `${(current / total) * 100}%`;
    qNum.textContent = `Question ${current + 1} of ${total}`;
    qTopicBadge.innerHTML = `<span class="${window.topicBadgeClass(q.topic)}">${q.topic}</span>`;
    qText.textContent = q.question;
    qExplText.textContent = q.explanation;

    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.innerHTML = `<span class="quiz-option-letter">${LETTERS[i]}</span><span>${opt}</span>`;
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        // Disable all
        qOptions.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);

        if (i === q.correct) {
          btn.classList.add('correct');
          score++;
        } else {
          btn.classList.add('wrong');
          // Highlight correct answer
          qOptions.querySelectorAll('.quiz-option')[q.correct].classList.add('correct');
        }

        qExplanation.classList.add('visible');
        btnNext.style.display = 'block';
      });
      qOptions.appendChild(btn);
    });
  }

  btnNext.addEventListener('click', () => {
    current++;
    if (current < queue.length) {
      renderQuestion();
    } else {
      showResults();
    }
  });

  function showResults() {
    progressBar.style.width = '100%';
    questionWrap.style.display = 'none';
    resultsScreen.style.display = 'block';

    const total = queue.length;
    const pct = Math.round((score / total) * 100);

    document.getElementById('result-pct').textContent = pct + '%';
    document.getElementById('result-detail').textContent = `${score} correct out of ${total} questions`;

    let heading = 'Quiz Complete!';
    let message = '';
    if (pct >= 90)      { heading = '🏆 Excellent!'; message = 'You\'re exam-ready. Outstanding performance!'; }
    else if (pct >= 75) { heading = '👍 Great Work!'; message = 'Strong understanding. Review any weak spots and you\'re set.'; }
    else if (pct >= 60) { heading = '📚 Keep Studying'; message = 'Good foundation. Focus on the topics you missed.'; }
    else                { heading = '💪 Keep Going!'; message = 'Review the Notes and Flashcards, then try again.'; }

    document.getElementById('result-heading').textContent = heading;
    document.getElementById('result-message').textContent = message;
  }

  btnStart.addEventListener('click', startQuiz);
  btnRetry.addEventListener('click', () => {
    startScreen.style.display = 'block';
    resultsScreen.style.display = 'none';
  });
})();
