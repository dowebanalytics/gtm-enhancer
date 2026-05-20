'use strict';

const STORAGE_KEY = 'gtmUiEnhancer';
const STYLE_ID    = 'gtm-ui-enhancer-style';
const FILTER_ID   = 'gtm-enh-type-filter';
const HIDDEN_ROW  = 'gtm-enh-hidden-row';
const HEADER_ID   = 'gtm-enh-header-info';

// ── CSS (Feature 1: expand + Feature 2: filter UI) ───────────────────────────

const CSS = `
/* ── Feature 1: Espandi area contenuto ─────────────────────────────────── */

/* Il wrapper ha flex:0 1 1440px — flex-grow:0 blocca l'espansione oltre 1440px.
   Cambiamo in flex-grow:1 per far crescere fino allo spazio disponibile. */
.gtm-container-page-content-wrapper {
  flex: 1 1 auto !important;
  max-width: none !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}

.gtm-container-page-content {
  width: 100% !important;
  max-width: none !important;
  box-sizing: border-box !important;
}

.draft-overview-card-container {
  width: 100% !important;
  max-width: none !important;
}

/* ── Top bar: search a destra, picker auto-width ───────────────────────── */

suite-assistant-search.gms-header-assistant-search {
  flex: 0 0 300px !important;
  margin-left: auto !important;
}

/* Spacer dopo la search: azzerato (margin-left:auto lo sostituisce) */
.md-toolbar-tools.gms-header-toolbar > span.flex {
  flex: 0 0 0 !important;
}

/* Picker contenitore: larghezza adattata al contenuto, senza troncamento */
suite-universal-picker.gms-header-up {
  flex: 0 0 auto !important;
  max-width: none !important;
}

.suite-up-text-name,
.suite-up-button-text-secondary,
.suite-up-button-text {
  max-width: none !important;
  text-overflow: clip !important;
  overflow: visible !important;
  white-space: nowrap !important;
}

.suite-up-button {
  overflow: visible !important;
  max-width: none !important;
}

/* ── Header info (Account / Container / Workspace) ─────────────────────── */

#${HEADER_ID} {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 10px;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.2px;
  color: rgb(95, 99, 104);
}

.gtm-enh-hi-item {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
}

.gtm-enh-hi-label {
  color: rgb(95, 99, 104);
}

.gtm-enh-hi-sep {
  color: rgba(95, 99, 104, 0.4);
  font-size: 14px;
}

.gtm-enh-hi-divider {
  display: inline-block;
  width: 1px;
  height: 14px;
  background: rgba(0,0,0,0.18);
  margin: 0 2px;
  vertical-align: middle;
}

/* ── Feature 2: Filtro per tipo tag (chip inline) ───────────────────────── */

.${HIDDEN_ROW} { display: none !important; }

#${FILTER_ID} {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
  border-top: 1px solid rgba(0,0,0,0.12);
  border-bottom: 1px solid rgba(0,0,0,0.12);
}


.gtm-enh-checkboxes {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.gtm-enh-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border: 1px solid rgba(0,0,0,0.18);
  border-radius: 14px;
  cursor: pointer;
  font-size: 12px;
  font-family: 'Roboto', sans-serif;
  color: rgba(0,0,0,0.7);
  user-select: none;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s;
  line-height: 1.4;
}
.gtm-enh-item:hover { background: rgba(0,0,0,0.04); }

.gtm-enh-item input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
  accent-color: #1a73e8;
  flex-shrink: 0;
  width: 12px;
  height: 12px;
}

.gtm-enh-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
  flex-shrink: 0;
}
`;

// ── Type colour palette ───────────────────────────────────────────────────────

const TYPE_PALETTE = [
  '#c62828', // red-800
  '#6a1b9a', // purple-800
  '#283593', // indigo-800
  '#00695c', // teal-800
  '#2e7d32', // green-800
  '#bf360c', // deep-orange-800
  '#0277bd', // light-blue-800
  '#880e4f', // pink-800
  '#4527a0', // deep-purple-800
  '#e65100', // orange-800
  '#4e342e', // brown-800
  '#00838f', // cyan-800
];

function typeColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return TYPE_PALETTE[h % TYPE_PALETTE.length];
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}


// ── State ──────────────────────────────────────────────────────────────────────

let state = { expandContent: true, typeFilter: true, filterVariables: true };

// ── Feature 1: Expand ─────────────────────────────────────────────────────────

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = CSS;
  (document.head || document.documentElement).appendChild(s);
}

function removeStyles() { document.getElementById(STYLE_ID)?.remove(); }

function fixExpandInline() {
  const wrapper = document.querySelector('.gtm-container-page-content-wrapper');
  if (wrapper) {
    wrapper.style.setProperty('flex', '1 1 auto', 'important');
    wrapper.style.setProperty('max-width', 'none', 'important');
  }
  const content = document.querySelector('.gtm-container-page-content');
  if (content) {
    content.style.setProperty('width', '100%', 'important');
    content.style.setProperty('max-width', 'none', 'important');
  }
}

function applyExpandState() {
  if (state.expandContent) {
    ensureStyles();
    requestAnimationFrame(() => { fixExpandInline(); setTimeout(fixExpandInline, 400); });
  } else {
    removeStyles();
  }
}

// ── Feature 2: Type filter ────────────────────────────────────────────────────

let activeTypes = new Set();
let filterMutationObserver = null;

function isFilterablePage() {
  const hash = window.location.hash;
  if (state.typeFilter      && /\/(tags|triggers)(?:[^\/]|$)/.test(hash)) return true;
  if (state.filterVariables && /\/variables(?:[^\/]|$)/.test(hash))        return true;
  return false;
}

function getTagRows() {
  return Array.from(document.querySelectorAll('table tbody tr'));
}

// Trova l'indice della colonna "Type" DENTRO una specifica tabella.
// Necessario perché tabelle diverse (es. built-in vs user-defined in Variables)
// possono avere strutture di colonne diverse.
function getTypeColIndexForTable(table) {
  const ths = Array.from(table.querySelectorAll('th'));
  for (let i = 0; i < ths.length; i++) {
    if (/^(event\s+)?type$/i.test(ths[i].textContent.trim())) return i;
  }
  return -1; // tabella senza colonna Type
}

function collectTypeCounts() {
  const map = new Map();
  document.querySelectorAll('table').forEach(table => {
    const colIdx = getTypeColIndexForTable(table);
    if (colIdx < 0) return;
    table.querySelectorAll('tbody tr').forEach(row => {
      const t = row.querySelectorAll('td')[colIdx]?.textContent.trim() || '';
      if (t) map.set(t, (map.get(t) || 0) + 1);
    });
  });
  return map;
}

function applyTypeFilter() {
  document.querySelectorAll('table').forEach(table => {
    const colIdx = getTypeColIndexForTable(table);
    table.querySelectorAll('tbody tr').forEach(row => {
      if (colIdx < 0) { row.classList.remove(HIDDEN_ROW); return; }
      const t = row.querySelectorAll('td')[colIdx]?.textContent.trim() || '';
      const hide = activeTypes.size > 0 && !!t && !activeTypes.has(t);
      row.classList.toggle(HIDDEN_ROW, hide);
    });
  });
}

function populateCheckboxes(cbContainer) {
  cbContainer.innerHTML = '';
  const types = collectTypeCounts();
  types.forEach((count, type) => {
    const color = typeColor(type);
    const isActive = activeTypes.has(type);

    const item = document.createElement('label');
    item.className = 'gtm-enh-item';
    item.title = `${type} (${count})`;
    item.style.background = hexToRgba(color, isActive ? 0.22 : 0.10);
    if (isActive) item.style.borderColor = color;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = isActive;
    cb.addEventListener('change', e => {
      e.stopPropagation();
      if (cb.checked) {
        activeTypes.add(type);
        item.style.background = hexToRgba(color, 0.22);
        item.style.borderColor = color;
      } else {
        activeTypes.delete(type);
        item.style.background = hexToRgba(color, 0.10);
        item.style.borderColor = '';
      }
      applyTypeFilter();
    });

    const span = document.createElement('span');
    span.textContent = type;
    span.style.color = color;

    item.appendChild(cb);
    item.appendChild(span);
    cbContainer.appendChild(item);
  });
}

function getNameColIndexForTable(table) {
  const ths = Array.from(table.querySelectorAll('th'));
  for (let i = 0; i < ths.length; i++) {
    if (/^name$/i.test(ths[i].textContent.trim())) return i;
  }
  return 0;
}

function colorizeRows() {
  document.querySelectorAll('table').forEach(table => {
    const typeColIdx = getTypeColIndexForTable(table);
    const nameColIdx = getNameColIndexForTable(table);
    if (typeColIdx < 0) return;
    table.querySelectorAll('tbody tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      const typeCell = cells[typeColIdx];
      const nameCell = cells[nameColIdx];
      if (!typeCell || !nameCell) return;
      const t = typeCell.textContent.trim();
      if (!t) return;
      nameCell.querySelector('.gtm-enh-dot')?.remove();
      const dot = document.createElement('span');
      dot.className = 'gtm-enh-dot';
      dot.style.background = typeColor(t);
      const anchor = nameCell.querySelector('a') || nameCell;
      anchor.insertBefore(dot, anchor.firstChild);
      typeCell.style.color = typeColor(t);
      typeCell.classList.add('gtm-enh-colored-cell');
    });
  });
}

function injectTypeFilter() {
  if (!state.typeFilter) return;
  if (!isFilterablePage()) return;
  if (document.getElementById(FILTER_ID)) return;
  if (getTagRows().length === 0) return;

  const tableFilter = document.querySelector('gtm-table-filter');
  if (!tableFilter) return;

  const toolbar = tableFilter.parentElement;
  const container = document.createElement('div');
  container.id = FILTER_ID;
  container.style.display = 'none'; // nascosto finché le chip non si popolano

  const cbContainer = document.createElement('div');
  cbContainer.className = 'gtm-enh-checkboxes';
  container.appendChild(cbContainer);

  const cardHeader = toolbar.parentElement;
  cardHeader.after(container);

  tryPopulateWithRetry(cbContainer);
}

function tryPopulateWithRetry(cbContainer, attempt = 0) {
  if (attempt > 15) return;
  if (collectTypeCounts().size > 0) {
    populateCheckboxes(cbContainer);
    colorizeRows();
    const container = document.getElementById(FILTER_ID);
    if (container) container.style.display = '';
    return;
  }
  setTimeout(() => tryPopulateWithRetry(cbContainer, attempt + 1), 200);
}

function removeTypeFilter() {
  document.getElementById(FILTER_ID)?.remove();
  getTagRows().forEach(r => r.classList.remove(HIDDEN_ROW));
  document.querySelectorAll('.gtm-enh-dot').forEach(d => d.remove());
  document.querySelectorAll('td.gtm-enh-colored-cell').forEach(cell => {
    cell.style.color = '';
    cell.classList.remove('gtm-enh-colored-cell');
  });
  activeTypes.clear();
}

// MutationObserver sul content area: rilancia l'injection ogni volta che AngularJS
// modifica il DOM (navigazione SPA, caricamento tabella, re-render).
let filterBodyObserver = null;

function startFilterBodyObserver() {
  if (filterBodyObserver) return;
  let debounceTimer = null;
  const target = document.querySelector('.gtm-container-page-content') || document.body;
  filterBodyObserver = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (!state.typeFilter || !isFilterablePage()) return;
      if (!document.getElementById(FILTER_ID) && document.querySelector('gtm-table-filter')) {
        injectTypeFilter();
      }
    }, 350);
  });
  filterBodyObserver.observe(target, { childList: true, subtree: true });
}

function stopFilterBodyObserver() {
  if (filterBodyObserver) { filterBodyObserver.disconnect(); filterBodyObserver = null; }
}

function tryInjectWithRetry(attempt = 0) {
  if (attempt > 20) return;
  if (document.getElementById(FILTER_ID)) return;
  injectTypeFilter();
  if (!document.getElementById(FILTER_ID)) {
    setTimeout(() => tryInjectWithRetry(attempt + 1), 200);
  }
}

// ── Feature 4: Account / Container / Workspace nel top bar ───────────────────

function injectHeaderInfo() {
  document.getElementById(HEADER_ID)?.remove(); // aggiorna se già presente

  const anchor = document.querySelector('gtm-container-public-id');
  if (!anchor) return;

  const m = window.location.hash.match(/accounts\/(\d+)\/containers\/(\d+)\/workspaces\/(\d+)/);
  if (!m) return;

  const [, accountId, containerId, workspaceId] = m;

  const el = document.createElement('div');
  el.id = HEADER_ID;
  el.innerHTML =
    `<span class="gtm-enh-hi-item"><span class="gtm-enh-hi-label">Account:</span>${accountId}</span>` +
    `<span class="gtm-enh-hi-sep">·</span>` +
    `<span class="gtm-enh-hi-item"><span class="gtm-enh-hi-label">Container:</span>${containerId}</span>` +
    `<span class="gtm-enh-hi-sep">·</span>` +
    `<span class="gtm-enh-hi-item"><span class="gtm-enh-hi-label">Workspace:</span>${workspaceId}</span>` +
    `<span class="gtm-enh-hi-divider"></span>`;

  anchor.parentElement.insertBefore(el, anchor);
}

function tryInjectHeaderInfo(attempt = 0) {
  if (attempt > 20) return;
  if (document.querySelector('gtm-container-public-id')) { injectHeaderInfo(); return; }
  setTimeout(() => tryInjectHeaderInfo(attempt + 1), 200);
}

// ── Feature 5: Sort by Last Edited desc ──────────────────────────────────────

function getLastEditedSpan() {
  const th = Array.from(document.querySelectorAll('th[data-gtm-sort-column-by]'))
    .find(th => /last\s*edit/i.test(th.textContent));
  return th ? th.querySelector('span.sortable') : null;
}

function applySortByLastEdited() {
  const span = getLastEditedSpan();
  if (!span) return false;
  const isDesc = span.classList.contains('active-sort') && span.classList.contains('sort-reversed');
  if (isDesc) return true;
  span.click();
  // Primo click → ascending (active-sort); secondo → descending (sort-reversed)
  setTimeout(() => {
    if (span.classList.contains('active-sort') && !span.classList.contains('sort-reversed')) {
      span.click();
    }
  }, 150);
  return true;
}

let sortTimer = null;
function trySortByLastEdited(attempt = 0) {
  if (attempt > 20) return;
  if (applySortByLastEdited()) return;
  sortTimer = setTimeout(() => trySortByLastEdited(attempt + 1), 200);
}

// ── Applicazione stato globale ────────────────────────────────────────────────

function applyState() {
  applyExpandState();
  tryInjectHeaderInfo();
  trySortByLastEdited();

  if (state.typeFilter || state.filterVariables) {
    startFilterBodyObserver();
    if (isFilterablePage()) tryInjectWithRetry();
    else removeTypeFilter(); // pagina corrente non più filtrabile (es. toggle variabili disattivato)
  } else {
    removeTypeFilter();
    stopFilterBodyObserver();
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

chrome.storage.sync.get(STORAGE_KEY, result => {
  if (result[STORAGE_KEY]) state = { ...state, ...result[STORAGE_KEY] };
  applyState();
});

// ── Messaggi dal popup ────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'GET_STATE') { sendResponse(state); return false; }
  if (msg.type === 'SET_STATE') {
    state = { ...state, ...msg.payload };
    chrome.storage.sync.set({ [STORAGE_KEY]: state });
    applyState();
    sendResponse({ ok: true });
    return false;
  }
});

// ── SPA navigation (hash routing) ─────────────────────────────────────────────

let navTimer = null;
window.addEventListener('hashchange', () => {
  clearTimeout(navTimer);
  navTimer = setTimeout(() => {
    // Feature 1
    if (state.expandContent) { fixExpandInline(); setTimeout(fixExpandInline, 400); }

    // Feature 2: rimuovi filtro precedente; l'observer e il retry gestiscono il re-inject
    removeTypeFilter();
    activeTypes.clear();
    if (state.typeFilter && isFilterablePage()) tryInjectWithRetry();
    // Il filterBodyObserver rileva in autonomia quando il nuovo DOM è pronto

    // Feature 4: aggiorna header info (i workspaceId possono cambiare tra navigazioni)
    tryInjectHeaderInfo();

    // Feature 5: riapplica sort by last edited sulla nuova pagina
    clearTimeout(sortTimer);
    trySortByLastEdited();
  }, 150);
});

// ── Observer: rinietta <style> se rimosso da Angular ─────────────────────────

const styleObserver = new MutationObserver(() => {
  if (state.expandContent && !document.getElementById(STYLE_ID)) ensureStyles();
});

function startObserver() {
  const target = document.head || document.documentElement;
  if (target) styleObserver.observe(target, { childList: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startObserver);
} else {
  startObserver();
}
