// Load and render walkthroughs from walkthroughs.json
(async function () {
  const container = document.getElementById('walkthroughs');
  const countEl = document.getElementById('wt-count');
  const filtersEl = document.getElementById('wt-filters');

  let data = [];
  try {
    const res = await fetch('walkthroughs.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    data = await res.json();
  } catch (err) {
    container.innerHTML =
      '<div class="wt-empty">Could not load walkthroughs.json. ' +
      'Make sure the file exists next to walkthroughs.html.</div>';
    console.error(err);
    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = '<div class="wt-empty">No walkthroughs yet. Check back soon.</div>';
    return;
  }

  // Sort newest first
  data.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  countEl.textContent = data.length + (data.length === 1 ? ' entry' : ' entries');

  // Collect unique platforms for filter buttons
  const platforms = ['all', ...new Set(data.map(w => w.platform).filter(Boolean))];
  let activeFilter = 'all';

  function renderFilters() {
    filtersEl.innerHTML = platforms
      .map(p => `<button class="wt-filter${p === activeFilter ? ' active' : ''}" data-p="${p}">${p}</button>`)
      .join('');
    filtersEl.querySelectorAll('.wt-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.p;
        renderFilters();
        renderList();
      });
    });
  }

  function difficultyClass(d) {
    if (!d) return '';
    const k = d.toLowerCase();
    if (k.includes('easy')) return 'easy';
    if (k.includes('med')) return 'medium';
    if (k.includes('hard') || k.includes('insane')) return 'hard';
    return '';
  }

  function formatDate(d) {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (_) {
      return d;
    }
  }

  function renderList() {
    const filtered = activeFilter === 'all'
      ? data
      : data.filter(w => w.platform === activeFilter);

    if (filtered.length === 0) {
      container.innerHTML = '<div class="wt-empty">No entries for this filter.</div>';
      return;
    }

    container.innerHTML = filtered.map(w => {
      const tags = (w.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
      const diffClass = difficultyClass(w.difficulty);
      const href = w.url || '#';
      const external = w.url ? ' target="_blank" rel="noopener"' : '';
      return `
        <a class="wt-card" href="${href}"${external}>
          <div class="wt-meta">
            <span class="wt-platform">${w.platform || ''}</span>
            ${w.difficulty ? `<span class="wt-diff ${diffClass}">${w.difficulty}</span>` : ''}
            <span class="wt-date">${formatDate(w.date)}</span>
          </div>
          <div class="wt-title">${w.title || 'Untitled'}</div>
          <div class="wt-summary">${w.summary || ''}</div>
          <div class="tags">${tags}</div>
        </a>
      `;
    }).join('');
  }

  renderFilters();
  renderList();
})();
