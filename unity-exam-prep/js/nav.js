// nav.js — injects the shared site navigation
(function () {
  const pages = [
    { href: 'index.html',      label: 'Home'       },
    { href: 'flashcards.html', label: 'Flashcards' },
    { href: 'quiz.html',       label: 'Quiz'       },
    { href: 'notes.html',      label: 'Notes'      },
    { href: 'snippets.html',   label: 'Code'       },
    { href: 'glossary.html',   label: 'Glossary'   },
  ];

  function currentPage() {
    const p = window.location.pathname.split('/').pop() || 'index.html';
    return p === '' ? 'index.html' : p;
  }

  function topicBadgeClass(topic) {
    const map = {
      'Unity Interface':     'interface',
      'C# Scripting':        'scripting',
      'Physics':             'physics',
      'Animation':           'animation',
      'Audio':               'audio',
      'Lighting & Rendering':'lighting',
      'UI Systems':          'ui',
      '2D Development':      '2d',
      'Project & Workflow':  'workflow',
    };
    return 'badge badge-' + (map[topic] || 'workflow');
  }
  window.topicBadgeClass = topicBadgeClass;

  function render() {
    const current = currentPage();
    const links = pages.map(p => {
      const active = p.href === current ? ' active' : '';
      return `<a href="${p.href}" class="${active}">${p.label}</a>`;
    }).join('');

    const mobileLinks = pages.map(p => {
      const active = p.href === current ? ' active' : '';
      return `<a href="${p.href}" class="${active}">${p.label}</a>`;
    }).join('');

    const html = `
      <nav id="site-nav" role="navigation" aria-label="Main navigation">
        <div class="nav-inner">
          <a href="index.html" class="nav-logo">
            <span class="nav-logo-title">Unity Exam Prep</span>
            <span class="nav-logo-sub">Certified Associate</span>
          </a>
          <div class="nav-links">${links}</div>
          <button class="nav-hamburger" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
      <div class="nav-mobile-overlay" id="nav-overlay"></div>
      <div class="nav-mobile-menu" id="nav-mobile">${mobileLinks}</div>
    `;

    const root = document.getElementById('nav-root');
    if (root) root.outerHTML = html;
    else document.body.insertAdjacentHTML('afterbegin', html);

    document.getElementById('nav-toggle').addEventListener('click', function () {
      const menu = document.getElementById('nav-mobile');
      const overlay = document.getElementById('nav-overlay');
      const open = menu.classList.toggle('open');
      overlay.style.display = open ? 'block' : 'none';
      this.setAttribute('aria-expanded', open);
    });

    document.getElementById('nav-overlay').addEventListener('click', function () {
      document.getElementById('nav-mobile').classList.remove('open');
      this.style.display = 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
