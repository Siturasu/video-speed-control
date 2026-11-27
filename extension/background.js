importScripts('lib/core.js');

const core = globalThis.VSC;
const AUTO_SCRIPT_ID = 'auto-start';
const PAGE_FILES = ['lib/core.js', 'content.js'];

// Sites where the user turned on automatic start and also granted access.
async function autoStartMatches() {
  const matches = [];
  for (const host of await core.autoSites(chrome.storage.local)) {
    const patterns = core.originPatterns(host);
    if (await chrome.permissions.contains({origins: patterns})) matches.push(...patterns);
  }
  return matches;
}

let syncQueue = Promise.resolve();
function syncAutoStart() {
  syncQueue = syncQueue.then(async () => {
    const matches = await autoStartMatches();
    const existing = await chrome.scripting.getRegisteredContentScripts({ids: [AUTO_SCRIPT_ID]});
    if (!matches.length) {
      if (existing.length) await chrome.scripting.unregisterContentScripts({ids: [AUTO_SCRIPT_ID]});
      return;
    }
    const script = {id: AUTO_SCRIPT_ID, matches, js: PAGE_FILES, allFrames: true, runAt: 'document_start', persistAcrossSessions: true};
    if (existing.length) await chrome.scripting.updateContentScripts([script]);
    else await chrome.scripting.registerContentScripts([script]);
  }).catch(error => console.warn('Automatic start update failed', error));
  return syncQueue;
}

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get(null);
  const {updates, removals} = core.migrate(stored);
  if (removals.length) await chrome.storage.local.remove(removals);
  if (Object.keys(updates).length) await chrome.storage.local.set(updates);
  await syncAutoStart();
});

chrome.runtime.onStartup.addListener(syncAutoStart);
chrome.permissions.onAdded.addListener(syncAutoStart);
chrome.permissions.onRemoved.addListener(syncAutoStart);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  const autoChanged = Object.entries(changes).some(([key, change]) =>
    key.startsWith(core.SITE_PREFIX) && Boolean(change.oldValue?.auto) !== Boolean(change.newValue?.auto));
  if (autoChanged) syncAutoStart();
});

// A shortcut press gives temporary access to the current tab, like opening the popup.
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (!tab?.id || !['faster', 'slower', 'toggle'].includes(command)) return;
  try {
    await core.injectPageScript(tab.id);
    await chrome.tabs.sendMessage(tab.id, {type: 'vsc:command', command}, {frameId: 0});
  } catch {
    // Chrome pages, the Web Store and similar pages do not allow extensions.
    await chrome.action.setBadgeText({tabId: tab.id, text: '!'});
    setTimeout(() => chrome.action.setBadgeText({tabId: tab.id, text: ''}).catch(() => {}), 1500);
  }
});
