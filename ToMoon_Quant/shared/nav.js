/**
 * ToMoon Quant — Sidebar Navigation
 * Matches ToMoon MVP visual language
 */

const quantSidebarConfig = {
  brand: {
    name: 'ToMoon Quant',
    iconPath: '../../Logo Files/Favicons/browser.png'
  },
  sections: [
    {
      label: null, // no group label for primary
      items: [
        { id: 'dashboard', label: 'Dashboard',   icon: 'grid',       href: '../dashboard/' },
      ]
    },
    {
      label: 'Research',
      items: [
        { id: 'alpha-library', label: 'Alpha Library',     icon: 'layers',    href: '../alpha-library/' },
        { id: 'canvas',        label: 'Strategy Builder',   icon: 'canvas',    href: '../canvas/' },
        { id: 'research',      label: 'Research Pipeline', icon: 'activity',  href: '../research/' },
      ]
    },
    {
      label: 'Operations',
      items: [
        { id: 'execution', label: 'Test Monitor', icon: 'monitor', href: '../execution/' },
      ]
    },
    {
      label: 'System',
      items: [
        { id: 'admin', label: 'Admin & Config', icon: 'settings', href: '../admin/' },
      ]
    }
  ]
};

const ICONS = {
  grid:     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  layers:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  zap:      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  activity: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  monitor:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  settings: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  canvas:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/><line x1="10" y1="8" x2="14" y2="8"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="10" x2="16" y2="14"/></svg>',
  moon:     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  menu:     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
};

function normalizeLocalDirectoryHref(rawHref) {
  if (!rawHref || typeof rawHref !== 'string') return rawHref;
  if (typeof window === 'undefined' || typeof window.location === 'undefined') return rawHref;
  if (window.location.protocol !== 'file:') return rawHref;

  const href = rawHref.trim();
  if (!href) return rawHref;

  // Skip external / special protocols and in-page anchors
  if (/^(https?:|mailto:|tel:|sms:|data:|blob:)/i.test(href)) return rawHref;
  if (href.startsWith('#')) return rawHref;

  // If it's a directory-style link, point to index.html explicitly for file:// usage
  if (href.endsWith('/')) return href + 'index.html';

  return rawHref;
}

function fixLocalDirectoryLinks(root = document) {
  if (typeof document === 'undefined') return;
  if (window.location.protocol !== 'file:') return;

  const anchors = root.querySelectorAll ? root.querySelectorAll('a[href]') : [];
  for (const a of anchors) {
    const rawHref = a.getAttribute('href');
    const normalized = normalizeLocalDirectoryHref(rawHref);
    if (normalized !== rawHref) a.setAttribute('href', normalized);
  }
}

// Apply automatically for all pages that include this nav script.
// This prevents users from landing on a directory listing (and having to click index.html manually)
// when running the demo via local files.
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => fixLocalDirectoryLinks(document));
  } else {
    fixLocalDirectoryLinks(document);
  }

  if (window.location.protocol === 'file:' && typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes || []) {
          if (!node || node.nodeType !== 1) continue;
          if (node.matches && node.matches('a[href]')) {
            const rawHref = node.getAttribute('href');
            const normalized = normalizeLocalDirectoryHref(rawHref);
            if (normalized !== rawHref) node.setAttribute('href', normalized);
          }
          if (node.querySelectorAll) fixLocalDirectoryLinks(node);
        }
      }
    });
    document.addEventListener('DOMContentLoaded', () => {
      if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    });
  }
}

/**
 * Render sidebar into the page
 * @param {string} activeId - currently active nav item id
 */
function renderQuantSidebar(activeId) {
  const cfg = quantSidebarConfig;

  const sidebar = document.createElement('nav');
  sidebar.className = 'sidebar';
  sidebar.id = 'sidebar';

  // Restore expanded state
  if (sessionStorage.getItem('qSidebarExpanded') === 'true') {
    sidebar.classList.add('expanded');
  }

  // Brand
  const brand = document.createElement('div');
  brand.className = 'sidebar-brand';
  brand.innerHTML = `
    <img class="brand-icon" src="${cfg.brand.iconPath}" alt="" onerror="this.style.display='none'">
    <span class="brand-text">${cfg.brand.name}</span>
  `;
  brand.addEventListener('click', () => {
    sidebar.classList.toggle('expanded');
    sessionStorage.setItem('qSidebarExpanded', sidebar.classList.contains('expanded'));
  });
  sidebar.appendChild(brand);

  // Nav
  const nav = document.createElement('div');
  nav.className = 'sidebar-nav';

  for (const section of cfg.sections) {
    if (section.label) {
      const gl = document.createElement('div');
      gl.className = 'nav-group-label';
      gl.textContent = section.label;
      nav.appendChild(gl);
    }
    for (const item of section.items) {
      const a = document.createElement('a');
      a.className = 'nav-item' + (item.id === activeId ? ' active' : '');
      a.href = normalizeLocalDirectoryHref(item.href);
      a.innerHTML = `
        <span class="nav-icon">${ICONS[item.icon] || ''}</span>
        <span class="nav-label">${item.label}</span>
      `;
      nav.appendChild(a);
    }
  }
  sidebar.appendChild(nav);

  // Bottom: link back to MVP
  const bottom = document.createElement('div');
  bottom.className = 'sidebar-bottom';
  const mvpLink = document.createElement('a');
  mvpLink.className = 'nav-item';
  mvpLink.href = normalizeLocalDirectoryHref('../../ToMoon_MVP/home/index.html');
  mvpLink.innerHTML = `<span class="nav-icon">${ICONS.moon}</span><span class="nav-label">ToMoon MVP</span>`;
  bottom.appendChild(mvpLink);
  sidebar.appendChild(bottom);

  // Insert sidebar inside .app-layout so CSS sibling selectors (~) work
  const appLayout = document.querySelector('.app-layout');
  if (appLayout) {
    appLayout.prepend(sidebar);
  } else {
    document.body.prepend(sidebar);
  }
}

/**
 * Render topbar
 */
function renderQuantTopbar(title, breadcrumbs) {
  const topbar = document.createElement('header');
  topbar.className = 'topbar';

  const left = document.createElement('div');
  left.className = 'topbar-left';

  // Mobile menu button
  const menuBtn = document.createElement('button');
  menuBtn.className = 'btn-icon btn';
  menuBtn.innerHTML = ICONS.menu;
  menuBtn.style.display = 'none';
  menuBtn.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('expanded');
  });
  // Show on mobile
  if (window.innerWidth <= 768) menuBtn.style.display = 'inline-flex';
  window.addEventListener('resize', () => {
    menuBtn.style.display = window.innerWidth <= 768 ? 'inline-flex' : 'none';
  });
  left.appendChild(menuBtn);

  if (breadcrumbs && breadcrumbs.length) {
    const bc = document.createElement('div');
    bc.className = 'topbar-breadcrumb';
    breadcrumbs.forEach((b, i) => {
      if (i > 0) { const sep = document.createElement('span'); sep.className = 'sep'; sep.textContent = '/'; bc.appendChild(sep); }
      if (b.href) {
        const a = document.createElement('a');
        a.href = normalizeLocalDirectoryHref(b.href);
        a.textContent = b.label;
        a.style.color = 'var(--text-muted)';
        bc.appendChild(a);
      } else {
        const s = document.createElement('span');
        s.textContent = b.label;
        s.style.color = 'var(--text-main)';
        s.style.fontWeight = '700';
        bc.appendChild(s);
      }
    });
    left.appendChild(bc);
  } else {
    const h = document.createElement('h1');
    h.className = 'topbar-title';
    h.textContent = title;
    left.appendChild(h);
  }

  topbar.appendChild(left);

  const right = document.createElement('div');
  right.className = 'topbar-right';
  right.innerHTML = `<span class="pill pill-accent">MVP · Mock Data</span>`;
  topbar.appendChild(right);

  // Insert after sidebar
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.after(topbar);
  else document.body.prepend(topbar);
}
