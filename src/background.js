chrome.action.onClicked.addListener(tab => {
  chrome.tabs.sendMessage(tab.id, { type: 'consent' });
});

chrome.webNavigation.onCompleted.addListener(({tabId}) => {
  console.log(`Injected ringtone script in tab ${tabId}`)
  chrome.scripting.executeScript({
      target: { tabId },
      files: ['dist/ringtone.js'],
      world: 'MAIN',
  });
}, { url: [{ urlMatches: 'https://app.trengo.com/' }] });
