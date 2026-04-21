// gallery.js — Gallery grid & lightbox with Google Drive URL fix
document.addEventListener('DOMContentLoaded', function () {
  if (!window.IEI) return;

  // ── GOOGLE DRIVE IMAGE URL CONVERTER ──────────────────────────────
  // Converts any Google Drive share/view URL into a direct-embeddable thumbnail URL
  function resolveImageUrl(url) {
    if (!url) return '';
    // Pattern: https://drive.google.com/file/d/FILE_ID/view
    var driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      return 'https://drive.google.com/thumbnail?id=' + driveMatch[1] + '&sz=w800';
    }
    // Pattern: https://drive.google.com/open?id=FILE_ID
    var openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (openMatch) {
      return 'https://drive.google.com/thumbnail?id=' + openMatch[1] + '&sz=w800';
    }
    // Pattern: https://docs.google.com/uc?id=FILE_ID
    var docsMatch = url.match(/docs\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
    if (docsMatch) {
      return 'https://drive.google.com/thumbnail?id=' + docsMatch[1] + '&sz=w800';
    }
    // Already a direct lh3.googleusercontent.com link — use as-is
    return url;
  }

  const galleryGrid = document.getElementById('galleryGrid');
  const galleryFilter = document.getElementById('galleryFilter');
  if (!galleryGrid) return;

  let allItems = IEI.store.get('gallery') || [];
  let activeFilter = 'All';
  let currentIndex = 0;

  // ── LIGHTBOX SETUP ────────────────────────────────────────────────
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.innerHTML = `
    <div class="lb-overlay" id="lbClose"></div>
    <div class="lb-content">
      <button class="lb-nav lb-prev" id="lbPrev">&#8249;</button>
      <div class="lb-img-wrap">
        <img id="lbImg" src="" alt="">
        <div class="lb-caption" id="lbCaption"></div>
      </div>
      <button class="lb-nav lb-next" id="lbNext">&#8250;</button>
      <button class="lb-close" id="lbCloseBtn">&#215;</button>
    </div>`;
  lightbox.style.cssText = 'position:fixed;inset:0;z-index:9000;display:none;';
  document.body.appendChild(lightbox);

  const lbStyle = document.createElement('style');
  lbStyle.textContent = `
    #lightbox{background:rgba(0,0,0,0.93);align-items:center;justify-content:center;}
    #lightbox.open{display:flex!important;}
    .lb-overlay{position:absolute;inset:0;}
    .lb-content{position:relative;z-index:1;max-width:900px;width:calc(100% - 4rem);animation:fadeIn 0.2s ease;}
    .lb-img-wrap{position:relative;border-radius:16px;overflow:hidden;background:#111;}
    #lbImg{width:100%;max-height:80vh;object-fit:contain;display:block;}
    .lb-caption{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);padding:1.5rem;color:#fff;font-size:.9rem;font-weight:500;}
    .lb-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;width:48px;height:48px;border-radius:50%;font-size:1.8rem;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;z-index:2;}
    .lb-nav:hover{background:rgba(255,255,255,0.25);}
    .lb-prev{left:-64px;}.lb-next{right:-64px;}
    .lb-close{position:absolute;top:-48px;right:0;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;width:40px;height:40px;border-radius:50%;font-size:1.4rem;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;}
    .lb-close:hover{background:rgba(200,87,42,0.7);}
    .gallery-item{cursor:zoom-in;border-radius:16px;overflow:hidden;aspect-ratio:4/3;position:relative;background:var(--clr-bg-2);}
    .gallery-item img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;}
    .gallery-item:hover img{transform:scale(1.06);}
    .gallery-item-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(27,45,79,0.85) 0%,transparent 60%);opacity:0;transition:opacity .3s;display:flex;align-items:flex-end;padding:1.25rem;}
    .gallery-item:hover .gallery-item-overlay{opacity:1;}
    .gallery-item-label{color:#fff;font-size:.875rem;font-weight:600;}
    .gallery-item-cat{font-size:.72rem;color:rgba(255,255,255,.6);margin-bottom:4px;}
    .gallery-img-error{display:flex;align-items:center;justify-content:center;height:100%;color:var(--clr-text-muted);font-size:.8rem;flex-direction:column;gap:.5rem;padding:1rem;text-align:center;}
    @media(max-width:480px){.lb-prev{left:-16px;}.lb-next{right:-16px;}}
  `;
  document.head.appendChild(lbStyle);

  let filteredItems = [];

  function openLightbox(idx) {
    currentIndex = idx;
    const item = filteredItems[idx];
    const img = document.getElementById('lbImg');
    const resolvedUrl = resolveImageUrl(item.image);
    img.src = resolvedUrl;
    img.onerror = function() {
      this.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=60';
    };
    document.getElementById('lbCaption').textContent = item.title + ' — ' + IEI.formatDate(item.date);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('lbImg').src = '';
  }

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbCloseBtn').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () =>
    openLightbox((currentIndex - 1 + filteredItems.length) % filteredItems.length));
  document.getElementById('lbNext').addEventListener('click', () =>
    openLightbox((currentIndex + 1) % filteredItems.length));
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') document.getElementById('lbPrev').click();
    if (e.key === 'ArrowRight') document.getElementById('lbNext').click();
    if (e.key === 'Escape') closeLightbox();
  });

  function renderGallery(items) {
    filteredItems = items;
    if (!items.length) {
      galleryGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--clr-text-muted);">No gallery items in this category yet.</div>';
      return;
    }
    galleryGrid.innerHTML = items.map((item, i) => {
      const resolvedUrl = resolveImageUrl(item.image);
      return `
        <div class="gallery-item reveal" data-idx="${i}">
          <img src="${resolvedUrl}" alt="${item.title}" loading="lazy"
               onerror="this.parentNode.innerHTML='<div class=gallery-img-error>🖼️<span>Image unavailable</span><small>${item.title}</small></div>'">
          <div class="gallery-item-overlay">
            <div>
              <div class="gallery-item-cat">${item.category}</div>
              <div class="gallery-item-label">${item.title}</div>
            </div>
          </div>
        </div>`;
    }).join('');

    galleryGrid.querySelectorAll('.gallery-item').forEach(el => {
      el.addEventListener('click', function () {
        openLightbox(parseInt(this.dataset.idx));
      });
      setTimeout(() => el.classList.add('revealed'), 80 + parseInt(el.dataset.idx) * 60);
    });
  }

  function renderFilters() {
    if (!galleryFilter) return;
    const cats = ['All', ...new Set(allItems.map(i => i.category))];
    galleryFilter.innerHTML = cats.map(c =>
      `<button class="btn btn-sm ${c === activeFilter ? 'btn-primary' : 'btn-outline'}" data-cat="${c}">${c}</button>`
    ).join('');
    galleryFilter.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', function () {
        activeFilter = this.dataset.cat;
        renderGallery(activeFilter === 'All' ? allItems : allItems.filter(i => i.category === activeFilter));
        renderFilters();
      });
    });
  }

  renderGallery(allItems);
  renderFilters();
});
