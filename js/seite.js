// AKTUELL: Termine, deren Datum vorbei ist, wandern automatisch ins ARCHIV (ganz nach vorn).
// Jeder Terminkasten trägt data-bis="JJJJ-MM-TT" (letzter Tag des Termins).
(function () {
  const heute = new Date(); heute.setHours(0, 0, 0, 0);
  const archiv = document.querySelector('.archiv');
  const termine = [...document.querySelectorAll('.termin[data-bis]')];
  const vorbei = termine.filter(t => new Date(t.dataset.bis + 'T23:59:59') < heute);
  // neueste zuerst ins Archiv
  vorbei.sort((a, b) => b.dataset.bis.localeCompare(a.dataset.bis)).reverse().forEach(t => {
    const bild = t.querySelector('img');
    if (archiv && bild) {
      const f = document.createElement('figure');
      const kopie = bild.cloneNode(); kopie.loading = 'lazy';
      f.appendChild(kopie); archiv.prepend(f);
    }
    t.remove();
  });
  const aktuell = document.querySelector('#aktuell .innen');
  if (aktuell && !aktuell.querySelector('.termin')) {
    const p = document.createElement('p'); p.className = 'lead'; p.textContent = 'Neue Termine folgen in Kürze.';
    aktuell.appendChild(p);
  }
})();
// Handy: Menü auf- und zuklappen
(function () {
  const kopf = document.querySelector('.kopf'), knopf = document.querySelector('.menue-knopf');
  if (!kopf || !knopf) return;
  const setze = offen => { kopf.classList.toggle('offen', offen); knopf.setAttribute('aria-expanded', offen); knopf.setAttribute('aria-label', offen ? 'Menü schließen' : 'Menü öffnen'); };
  knopf.addEventListener('click', () => setze(!kopf.classList.contains('offen')));
  document.querySelectorAll('.menue a').forEach(a => a.addEventListener('click', () => setze(false)));
})();
// Menü bekommt hellen Grund, sobald das Wolkenfoto weggescrollt ist
(function () {
  const kopf = document.querySelector('.kopf'), wolken = document.querySelector('.wolken');
  if (!kopf || !wolken || !('IntersectionObserver' in window)) { kopf && kopf.classList.add('fest'); return; }
  new IntersectionObserver(([e]) => kopf.classList.toggle('fest', !e.isIntersecting), { rootMargin: '-64px 0px 0px 0px' }).observe(wolken);
})();
// ARCHIV: Plakate der Reihe nach immer in die kürzeste Spalte legen (neueste oben)
(function () {
  const box = document.querySelector('.archiv'); if (!box) return;
  const bilder = [...box.querySelectorAll('figure')];
  bilder.forEach(f => { const i = f.querySelector('img'); if (i) i.loading = 'eager'; });
  const mass = f => { const i = f.querySelector('img'), v = f.querySelector('video'); if (i && i.naturalWidth) return i.naturalHeight / i.naturalWidth; if (v && v.videoWidth) return v.videoHeight / v.videoWidth; return v ? 1 : 1.4; };
  let anzahl = 0;
  function verteile() {
    const n = Math.max(1, Math.floor((box.clientWidth + 14) / (420 + 14)));
    if (n === anzahl) return; anzahl = n;
    box.textContent = '';
    const spalten = Array.from({ length: n }, () => box.appendChild(Object.assign(document.createElement('div'), { className: 'archiv-spalte' })));
    const hoehe = new Array(n).fill(0);
    bilder.forEach(f => {
      const r = mass(f);
      const k = hoehe.indexOf(Math.min(...hoehe)); spalten[k].appendChild(f); hoehe[k] += r + .05;
    });
  }
  function bereit() { anzahl = 0; verteile(); }
  Promise.all(bilder.map(f => { const i = f.querySelector('img'), v = f.querySelector('video'); if (v) return v.readyState >= 1 ? 0 : new Promise(ok => { v.onloadedmetadata = v.onerror = ok; }); return i.complete ? 0 : new Promise(ok => { i.onload = i.onerror = ok; }); })).then(bereit);
  verteile(); addEventListener('resize', () => { clearTimeout(verteile.t); verteile.t = setTimeout(verteile, 150); });
})();
// Sterne im Nachthimmel von ARCHIV
(function () {
  const c = document.querySelector('.sterne'); if (!c) return;
  const ctx = c.getContext('2d');
  function zeichne() {
    const r = c.parentElement.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    c.width = r.width * d; c.height = r.height * d; c.style.width = r.width + 'px'; c.style.height = r.height + 'px';
    ctx.scale(d, d); let s = 7;
    const zufall = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const n = Math.round(r.width * r.height / 2600);
    for (let i = 0; i < n; i++) {
      ctx.globalAlpha = .25 + zufall() * .75; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(zufall() * r.width, zufall() * r.height, zufall() * 1.2 + .2, 0, 6.29); ctx.fill();
    }
  }
  zeichne(); addEventListener('resize', () => { clearTimeout(zeichne.t); zeichne.t = setTimeout(zeichne, 200); });
})();
