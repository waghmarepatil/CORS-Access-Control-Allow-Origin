'use strict';

const prefs = {
  'enabled': false,
  'overwrite-origin': true,
  'overwrite-methods': true,
  'methods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH']
};

const cors = {};
cors.onHeadersReceived = ({responseHeaders}) => {
  if (
    prefs['overwrite-origin'] === true ||
    responseHeaders.find(({name}) => name.toLowerCase() === 'access-control-allow-origin') === undefined
  ) {
    responseHeaders.push({
      'name': 'Access-Control-Allow-Origin',
      'value': '*'
    });
  }
  if (
    prefs['overwrite-methods'] === true ||
    responseHeaders.find(({name}) => name.toLowerCase() === 'access-control-allow-methods') === undefined
  ) {
    responseHeaders.push({
      'name': 'Access-Control-Allow-Origin',
      'value': '*'
    });
    responseHeaders.push({
      'name': 'Access-Control-Allow-Methods',
      'value': prefs.methods.join(', ')
    });
  }

  return {responseHeaders};
};
cors.install = () => {
  cors.remove();
  chrome.webRequest.onHeadersReceived.addListener(cors.onHeadersReceived, {
    urls: ['<all_urls>']
  }, ['blocking', 'responseHeaders', 'extraHeaders']);
};
cors.remove = () => {
  chrome.webRequest.onHeadersReceived.removeListener(cors.onHeadersReceived);
};

cors.onCommand = () => {
  if (prefs.enabled) {
    cors.install();
  }
  else {
    cors.remove();
  }
  chrome.browserAction.setIcon({
    path: {
      '16': 'data/icons/icon' + (prefs.enabled ? '' : 'disabled/') + '.png',
      '19': 'data/icons/icon' + (prefs.enabled ? '' : 'disabled/') + '.png',
      '32': 'data/icons/icon' + (prefs.enabled ? '' : 'disabled/') + '.png',
      '38': 'data/icons/icon' + (prefs.enabled ? '' : 'disabled/') + '.png',
      '48': 'data/icons/icon' + (prefs.enabled ? '' : 'disabled/') + '.png',
      '64': 'data/icons/icon' + (prefs.enabled ? '' : 'disabled/') + '.png'
    }
  });
  chrome.browserAction.setTitle({
    title: prefs.enabled ? 'Access-Control-Allow-Origin is unblocked' : 'Disabled: Default server behavior'
  });
};

chrome.storage.onChanged.addListener(ps => {
  Object.keys(ps).forEach(name => prefs[name] = ps[name].newValue);
  cors.onCommand();
});

chrome.browserAction.onClicked.addListener(() => chrome.storage.local.set({
  enabled: prefs.enabled === false
}));

chrome.contextMenus.onClicked.addListener(info => {
  const ps = {};
  if (info.menuItemId === 'test-cors') {
    chrome.tabs.create({
      url: 'https://webbrowsertools.com/test-cors/'
    });
  }
  else if (info.menuItemId === 'overwrite-origin' || info.menuItemId === 'overwrite-methods') {
    ps[info.menuItemId] = info.checked;
  }
  else {
    if (info.checked) {
      prefs.methods.push(info.menuItemId);
    }
    else {
      const index = prefs.methods.indexOf(info.menuItemId);
      if (index !== -1) {
        prefs.methods.splice(index, 1);
      }
    }
    ps.methods = prefs.methods;
  }
  chrome.storage.local.set(ps);
});

/* init */
chrome.storage.local.get(prefs, ps => {
  Object.assign(prefs, ps);
  /* context menu */
  chrome.contextMenus.create({
    title: 'Overwrite access-control-allow-origin',
    type: 'checkbox',
    id: 'overwrite-origin',
    contexts: ['browser_action'],
    checked: prefs['overwrite-origin']
  });
  chrome.contextMenus.create({
    title: 'Overwrite access-control-allow-methods',
    type: 'checkbox',
    id: 'overwrite-methods',
    contexts: ['browser_action'],
    checked: prefs['overwrite-methods']
  });

  const menu = chrome.contextMenus.create({
    title: 'Methods',
    contexts: ['browser_action']
  });

  chrome.contextMenus.create({
    title: 'PUT',
    type: 'checkbox',
    id: 'PUT',
    contexts: ['browser_action'],
    checked: prefs.methods.indexOf('PUT') !== -1,
    parentId: menu
  });
  chrome.contextMenus.create({
    title: 'DELETE',
    type: 'checkbox',
    id: 'DELETE',
    contexts: ['browser_action'],
    checked: prefs.methods.indexOf('DELETE') !== -1,
    parentId: menu
  });
  chrome.contextMenus.create({
    title: 'OPTIONS',
    type: 'checkbox',
    id: 'OPTIONS',
    contexts: ['browser_action'],
    checked: prefs.methods.indexOf('OPTIONS') !== -1,
    parentId: menu
  });
  chrome.contextMenus.create({
    title: 'PATCH',
    type: 'checkbox',
    id: 'PATCH',
    contexts: ['browser_action'],
    checked: prefs.methods.indexOf('PATCH') !== -1,
    parentId: menu
  });

  

  cors.onCommand();
});

