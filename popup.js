'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const expandToggle          = document.getElementById('expand-toggle');
  const filterToggle          = document.getElementById('filter-toggle');
  const filterVariablesToggle = document.getElementById('filter-variables-toggle');
  const statusDot    = document.getElementById('status-dot');
  const statusText   = document.getElementById('status-text');

  function setStatus(text, type = 'active') {
    statusText.textContent = text;
    statusDot.className = 'status-dot' + (type !== 'active' ? ` ${type}` : '');
  }

  let tab;
  try {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  } catch {
    setStatus('Errore lettura tab', 'inactive');
    return;
  }

  const isGtm = tab?.url?.includes('tagmanager.google.com');
  if (!isGtm) {
    setStatus('Apri Google Tag Manager', 'inactive');
    expandToggle.disabled          = true;
    filterToggle.disabled          = true;
    filterVariablesToggle.disabled = true;
    return;
  }

  let state;
  try {
    state = await chrome.tabs.sendMessage(tab.id, { type: 'GET_STATE' });
  } catch {
    setStatus('Ricarica la pagina GTM', 'warning');
    expandToggle.disabled          = true;
    filterToggle.disabled          = true;
    filterVariablesToggle.disabled = true;
    return;
  }

  expandToggle.checked          = state.expandContent;
  filterToggle.checked          = state.typeFilter      !== false;
  filterVariablesToggle.checked = state.filterVariables !== false;
  setStatus('Attivo');

  expandToggle.addEventListener('change', async () => {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'SET_STATE',
        payload: { expandContent: expandToggle.checked }
      });
    } catch { setStatus('Errore — ricarica GTM', 'warning'); }
  });

  filterToggle.addEventListener('change', async () => {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'SET_STATE',
        payload: { typeFilter: filterToggle.checked }
      });
    } catch { setStatus('Errore — ricarica GTM', 'warning'); }
  });

  filterVariablesToggle.addEventListener('change', async () => {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'SET_STATE',
        payload: { filterVariables: filterVariablesToggle.checked }
      });
    } catch { setStatus('Errore — ricarica GTM', 'warning'); }
  });

});
