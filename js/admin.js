/**
 * admin.js — Full Admin Dashboard Backend
 * Handles: Auth guard, CRUD for News/Events/Gallery,
 * Dashboard stats, Modals, Sidebar navigation, Clock
 */

document.addEventListener('DOMContentLoaded', function () {

  /* ══════════════════════════════════════════
     1. AUTH GUARD — redirect if not logged in
  ══════════════════════════════════════════ */
  if (!window.IEI_Auth) {
    console.error('[IEI Admin] auth.js not loaded');
    window.location.href = 'login.html';
    return;
  }
  if (!IEI_Auth.requireAuth()) return; // redirects to login.html

  const session = IEI_Auth.getSession();

  /* ══════════════════════════════════════════
     2. POPULATE SESSION INFO
  ══════════════════════════════════════════ */
  document.querySelectorAll('.admin-username').forEach(el => {
    el.textContent = session ? session.username : 'Admin';
  });

  /* ══════════════════════════════════════════
     3. LIVE CLOCK
  ══════════════════════════════════════════ */
  function updateClock() {
    const el = document.getElementById('adminClock');
    if (el) el.textContent = new Date().toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  }
  updateClock();
  // Use setTimeout chain instead of setInterval — avoids browser loading spinner
  function clockTick() { updateClock(); setTimeout(clockTick, 60000); }
  setTimeout(clockTick, 60000);

  /* ══════════════════════════════════════════
     4. SIDEBAR PANEL NAVIGATION
  ══════════════════════════════════════════ */
  const PANEL_TITLES = {
    dashboardPanel: '📊 Dashboard',
    newsPanel:      '📰 News Posts',
    eventsPanel:    '📅 Events',
    galleryPanel:   '🖼️ Gallery',
    themePanel:     '🎨 Theme & Appearance'
  };

  function showPanel(panelId) {
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-link[data-panel]').forEach(l => l.classList.remove('active'));

    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');

    document.querySelectorAll(`[data-panel="${panelId}"]`).forEach(l => {
      if (l.classList.contains('sidebar-link')) l.classList.add('active');
    });

    const titleEl = document.getElementById('topbarTitle');
    if (titleEl) titleEl.textContent = PANEL_TITLES[panelId] || 'Dashboard';

    // Refresh dashboard tables when switching to dashboard
    if (panelId === 'dashboardPanel') refreshDashboardTables();
  }

  // Wire ALL [data-panel] elements (sidebar links + quick-action buttons)
  document.querySelectorAll('[data-panel]').forEach(btn => {
    btn.addEventListener('click', function () {
      showPanel(this.dataset.panel);
    });
  });

  /* ══════════════════════════════════════════
     5. LOGOUT
  ══════════════════════════════════════════ */
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      if (confirm('Are you sure you want to logout?')) {
        IEI_Auth.logout();
      }
    });
  });

  /* ══════════════════════════════════════════
     6. MOBILE SIDEBAR TOGGLE
  ══════════════════════════════════════════ */
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.style.display = 'flex';
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    // Close sidebar when a panel link is clicked on mobile
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) sidebar.classList.remove('open');
      });
    });
  }

  /* ══════════════════════════════════════════
     7. MODAL SYSTEM
  ══════════════════════════════════════════ */
  function openModal(id) {
    const m = document.getElementById(id);
    if (m) {
      m.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) {
      m.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }

  // Close buttons
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Click outside modal
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function (e) {
      if (e.target === this) closeAllModals();
    });
  });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });

  /* ══════════════════════════════════════════
     8. STATS UPDATE
  ══════════════════════════════════════════ */
  function updateStats() {
    const news    = IEI.store.get('news')    || [];
    const events  = IEI.store.get('events')  || [];
    const gallery = IEI.store.get('gallery') || [];

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('statNews',    news.filter(n => n.status === 'published').length);
    setEl('statEvents',  events.length);
    setEl('statGallery', gallery.length);
    setEl('statTotal',   news.length + events.length + gallery.length);

    // Sidebar badge
    const badge = document.getElementById('newsBadge');
    if (badge) badge.textContent = news.filter(n => n.status === 'published').length;
  }

  /* ══════════════════════════════════════════
     9. DASHBOARD QUICK PREVIEW TABLES
  ══════════════════════════════════════════ */
  function refreshDashboardTables() {
    const news   = IEI.store.get('news')   || [];
    const events = IEI.store.get('events') || [];

    const dn = document.getElementById('dashRecentNews');
    const de = document.getElementById('dashRecentEvents');

    if (dn) {
      dn.innerHTML = news.slice(0, 5).map(n => `
        <tr>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n.title}</td>
          <td><span class="card-tag" style="font-size:.7rem;">${n.category}</span></td>
          <td><span class="status-badge status-${n.status}">${n.status}</span></td>
        </tr>`).join('') ||
        '<tr><td colspan="3" style="text-align:center;padding:1.5rem;color:var(--clr-text-muted);">No posts yet</td></tr>';
    }

    if (de) {
      de.innerHTML = events.slice(0, 4).map(e => `
        <tr>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.title}</td>
          <td>${IEI.formatDate(e.date)}</td>
          <td><span class="status-badge status-${e.status === 'upcoming' ? 'published' : 'draft'}">${e.status}</span></td>
        </tr>`).join('') ||
        '<tr><td colspan="3" style="text-align:center;padding:1.5rem;color:var(--clr-text-muted);">No events yet</td></tr>';
    }
  }

  /* ══════════════════════════════════════════
     10. NEWS CRUD
  ══════════════════════════════════════════ */
  function renderNewsTable() {
    const items = IEI.store.get('news') || [];
    const tbody = document.getElementById('newsTableBody');
    if (!tbody) return;

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2.5rem;color:var(--clr-text-muted);">No news posts yet. Click "+ Add Post" to create one.</td></tr>';
      updateStats();
      return;
    }

    tbody.innerHTML = items.map(n => `
      <tr>
        <td>
          <img src="${n.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&q=60'}"
               class="table-img" alt="" onerror="this.style.display='none'">
        </td>
        <td style="max-width:220px;">
          <div style="font-weight:600;font-size:.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n.title}</div>
          <div style="font-size:.75rem;color:var(--clr-text-muted);margin-top:2px;">${IEI.truncate(n.excerpt || '', 60)}</div>
        </td>
        <td><span class="card-tag">${n.category}</span></td>
        <td style="white-space:nowrap;">${IEI.formatDate(n.date)}</td>
        <td><span class="status-badge status-${n.status}">${n.status}</span></td>
        <td>
          <div class="table-actions">
            <button class="action-btn edit" data-id="${n.id}" data-type="news" title="Edit">✏️</button>
            <button class="action-btn delete" data-id="${n.id}" data-type="news" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Wire buttons
    tbody.querySelectorAll('.action-btn.edit[data-type="news"]').forEach(btn => {
      btn.addEventListener('click', () => openNewsModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.action-btn.delete[data-type="news"]').forEach(btn => {
      btn.addEventListener('click', () => deleteNews(parseInt(btn.dataset.id)));
    });

    updateStats();
  }

  function openNewsModal(id) {
    const items = IEI.store.get('news') || [];
    const item = id ? items.find(n => n.id === id) : null;
    const form = document.getElementById('newsForm');
    if (!form) return;

    form.reset();
    document.getElementById('newsModalTitle').textContent = item ? 'Edit News Post' : 'Add News Post';
    document.getElementById('newsId').value = item ? item.id : '';

    if (item) {
      document.getElementById('newsTitle').value    = item.title    || '';
      document.getElementById('newsCategory').value = item.category || 'Scholarship';
      document.getElementById('newsDate').value     = item.date     || '';
      document.getElementById('newsImage').value    = item.image    || '';
      document.getElementById('newsExcerpt').value  = item.excerpt  || '';
      document.getElementById('newsStatus').value   = item.status   || 'published';
    } else {
      document.getElementById('newsDate').value = new Date().toISOString().split('T')[0];
    }

    openModal('newsModal');
  }

  function deleteNews(id) {
    if (!confirm('Delete this news post? This cannot be undone.')) return;
    const items = (IEI.store.get('news') || []).filter(n => n.id !== id);
    IEI.store.set('news', items);
    renderNewsTable();
    refreshDashboardTables();
    IEI.showToast('News post deleted.', 'success');
  }

  const newsForm = document.getElementById('newsForm');
  if (newsForm) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const id = document.getElementById('newsId').value;
      const data = {
        id:       id ? parseInt(id) : Date.now(),
        title:    document.getElementById('newsTitle').value.trim(),
        category: document.getElementById('newsCategory').value,
        date:     document.getElementById('newsDate').value,
        image:    document.getElementById('newsImage').value.trim() ||
                  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80',
        excerpt:  document.getElementById('newsExcerpt').value.trim(),
        status:   document.getElementById('newsStatus').value
      };

      if (!data.title || !data.date) {
        IEI.showToast('Please fill in all required fields.', 'error');
        return;
      }

      let items = IEI.store.get('news') || [];
      if (id) {
        items = items.map(n => n.id === parseInt(id) ? data : n);
      } else {
        items.unshift(data);
      }
      IEI.store.set('news', items);
      closeAllModals();
      renderNewsTable();
      refreshDashboardTables();
      IEI.showToast(id ? '✅ Post updated successfully!' : '✅ Post published!', 'success');
    });
  }

  document.getElementById('addNewsBtn')?.addEventListener('click', () => openNewsModal(null));
  // Expose for quick-action on dashboard
  window.adminOpenNews = () => {
    showPanel('newsPanel');
    setTimeout(() => openNewsModal(null), 100);
  };

  /* ══════════════════════════════════════════
     11. EVENTS CRUD
  ══════════════════════════════════════════ */
  function renderEventsTable() {
    const items = IEI.store.get('events') || [];
    const tbody = document.getElementById('eventsTableBody');
    if (!tbody) return;

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2.5rem;color:var(--clr-text-muted);">No events yet. Click "+ Add Event" to create one.</td></tr>';
      updateStats();
      return;
    }

    tbody.innerHTML = items.map(ev => `
      <tr>
        <td style="max-width:200px;">
          <div style="font-weight:600;font-size:.9rem;">${ev.title}</div>
        </td>
        <td style="white-space:nowrap;">${IEI.formatDate(ev.date)}</td>
        <td>${ev.time || '—'}</td>
        <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${ev.location || '—'}</td>
        <td><span class="status-badge status-${ev.status === 'upcoming' ? 'published' : 'draft'}">${ev.status}</span></td>
        <td>
          <div class="table-actions">
            <button class="action-btn edit" data-id="${ev.id}" data-type="event" title="Edit">✏️</button>
            <button class="action-btn delete" data-id="${ev.id}" data-type="event" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.action-btn.edit[data-type="event"]').forEach(btn => {
      btn.addEventListener('click', () => openEventModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.action-btn.delete[data-type="event"]').forEach(btn => {
      btn.addEventListener('click', () => deleteEvent(parseInt(btn.dataset.id)));
    });

    updateStats();
  }

  function openEventModal(id) {
    const items = IEI.store.get('events') || [];
    const item = id ? items.find(e => e.id === id) : null;
    const form = document.getElementById('eventForm');
    if (!form) return;

    form.reset();
    document.getElementById('eventModalTitle').textContent = item ? 'Edit Event' : 'Add Event';
    document.getElementById('eventId').value = item ? item.id : '';

    if (item) {
      document.getElementById('eventTitle').value    = item.title       || '';
      document.getElementById('eventDate').value     = item.date        || '';
      document.getElementById('eventTime').value     = item.time        || '';
      document.getElementById('eventLocation').value = item.location    || '';
      document.getElementById('eventDesc').value     = item.description || '';
      document.getElementById('eventStatus').value   = item.status      || 'upcoming';
    } else {
      document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
    }

    openModal('eventModal');
  }

  function deleteEvent(id) {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    const items = (IEI.store.get('events') || []).filter(e => e.id !== id);
    IEI.store.set('events', items);
    renderEventsTable();
    refreshDashboardTables();
    IEI.showToast('Event deleted.', 'success');
  }

  const eventForm = document.getElementById('eventForm');
  if (eventForm) {
    eventForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const id = document.getElementById('eventId').value;
      const data = {
        id:          id ? parseInt(id) : Date.now(),
        title:       document.getElementById('eventTitle').value.trim(),
        date:        document.getElementById('eventDate').value,
        time:        document.getElementById('eventTime').value.trim(),
        location:    document.getElementById('eventLocation').value.trim(),
        description: document.getElementById('eventDesc').value.trim(),
        status:      document.getElementById('eventStatus').value
      };

      if (!data.title || !data.date) {
        IEI.showToast('Please fill in all required fields.', 'error');
        return;
      }

      let items = IEI.store.get('events') || [];
      if (id) {
        items = items.map(ev => ev.id === parseInt(id) ? data : ev);
      } else {
        items.unshift(data);
      }
      IEI.store.set('events', items);
      closeAllModals();
      renderEventsTable();
      refreshDashboardTables();
      IEI.showToast(id ? '✅ Event updated!' : '✅ Event added!', 'success');
    });
  }

  document.getElementById('addEventBtn')?.addEventListener('click', () => openEventModal(null));

  /* ══════════════════════════════════════════
     12. GALLERY CRUD
  ══════════════════════════════════════════ */
  function renderGalleryTable() {
    const items = IEI.store.get('gallery') || [];
    const tbody = document.getElementById('galleryTableBody');
    if (!tbody) return;

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2.5rem;color:var(--clr-text-muted);">No gallery items yet. Click "+ Add Item" to add one.</td></tr>';
      updateStats();
      return;
    }

    tbody.innerHTML = items.map(g => `
      <tr>
        <td>
          <img src="${g.image || ''}" class="table-img" alt=""
               onerror="this.style.background='var(--clr-bg-2)';this.src=''">
        </td>
        <td>
          <div style="font-weight:600;font-size:.9rem;">${g.title}</div>
        </td>
        <td><span class="card-tag">${g.category}</span></td>
        <td style="white-space:nowrap;">${IEI.formatDate(g.date)}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn edit" data-id="${g.id}" data-type="gallery" title="Edit">✏️</button>
            <button class="action-btn delete" data-id="${g.id}" data-type="gallery" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.action-btn.edit[data-type="gallery"]').forEach(btn => {
      btn.addEventListener('click', () => openGalleryModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.action-btn.delete[data-type="gallery"]').forEach(btn => {
      btn.addEventListener('click', () => deleteGallery(parseInt(btn.dataset.id)));
    });

    updateStats();
  }

  function openGalleryModal(id) {
    const items = IEI.store.get('gallery') || [];
    const item = id ? items.find(g => g.id === id) : null;
    const form = document.getElementById('galleryForm');
    if (!form) return;

    form.reset();
    document.getElementById('galleryModalTitle').textContent = item ? 'Edit Gallery Item' : 'Add Gallery Item';
    document.getElementById('galleryItemId').value = item ? item.id : '';

    if (item) {
      document.getElementById('galleryTitle').value    = item.title    || '';
      document.getElementById('galleryCategory').value = item.category || 'Events';
      document.getElementById('galleryDate').value     = item.date     || '';
      document.getElementById('galleryImage').value    = item.image    || '';
    } else {
      document.getElementById('galleryDate').value = new Date().toISOString().split('T')[0];
    }

    openModal('galleryModal');
  }

  function deleteGallery(id) {
    if (!confirm('Delete this gallery item? This cannot be undone.')) return;
    const items = (IEI.store.get('gallery') || []).filter(g => g.id !== id);
    IEI.store.set('gallery', items);
    renderGalleryTable();
    IEI.showToast('Gallery item deleted.', 'success');
    updateStats();
  }

  const galleryForm = document.getElementById('galleryForm');
  if (galleryForm) {
    galleryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const id = document.getElementById('galleryItemId').value;

      // Image URL preview validation
      const imgUrl = document.getElementById('galleryImage').value.trim();

      const data = {
        id:       id ? parseInt(id) : Date.now(),
        title:    document.getElementById('galleryTitle').value.trim(),
        category: document.getElementById('galleryCategory').value,
        date:     document.getElementById('galleryDate').value,
        image:    imgUrl || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80'
      };

      if (!data.title || !data.date) {
        IEI.showToast('Please fill in all required fields.', 'error');
        return;
      }

      let items = IEI.store.get('gallery') || [];
      if (id) {
        items = items.map(g => g.id === parseInt(id) ? data : g);
      } else {
        items.unshift(data);
      }
      IEI.store.set('gallery', items);
      closeAllModals();
      renderGalleryTable();
      IEI.showToast(id ? '✅ Gallery item updated!' : '✅ Item added to gallery!', 'success');
      updateStats();
    });
  }

  document.getElementById('addGalleryBtn')?.addEventListener('click', () => openGalleryModal(null));

  /* ══════════════════════════════════════════
     13. IMAGE URL PREVIEW in gallery modal
  ══════════════════════════════════════════ */
  const galleryImageInput = document.getElementById('galleryImage');
  if (galleryImageInput) {
    let previewEl = document.createElement('div');
    previewEl.id = 'galleryImgPreview';
    previewEl.style.cssText = 'margin-top:.75rem;border-radius:8px;overflow:hidden;max-height:140px;display:none;';
    previewEl.innerHTML = '<img style="width:100%;object-fit:cover;max-height:140px;display:block;" id="galleryPreviewImg">';
    galleryImageInput.parentNode.appendChild(previewEl);

    galleryImageInput.addEventListener('input', function () {
      const val = this.value.trim();
      const imgEl = document.getElementById('galleryPreviewImg');
      if (val && imgEl) {
        imgEl.src = val;
        previewEl.style.display = 'block';
        imgEl.onerror = () => { previewEl.style.display = 'none'; };
      } else {
        previewEl.style.display = 'none';
      }
    });
  }

  /* ══════════════════════════════════════════
     14. INIT — render everything
  ══════════════════════════════════════════ */
  showPanel('dashboardPanel');
  updateStats();
  refreshDashboardTables();
  renderNewsTable();
  renderEventsTable();
  renderGalleryTable();

  // Session check — uses visibilitychange so it NEVER causes browser "loading" spinner
  // Checks only when user returns to the tab, not on a timer
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      if (!IEI_Auth.getSession()) {
        IEI.showToast('Session expired. Redirecting to login…', 'error');
        setTimeout(() => IEI_Auth.logout(), 1500);
      }
    }
  });

});
