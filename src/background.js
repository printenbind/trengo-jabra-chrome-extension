import debounce from 'lodash.debounce';

const listener = (details) => {
  console.log(details.tabId, details.url)
  chrome.tabs.sendMessage(details.tabId, { type: 'navigation', url: details.url });
}

const filters = {
  url: [
    {
      hostSuffix: 'trengo.com'
    }
  ]
};
chrome.webNavigation.onHistoryStateUpdated.addListener(debounce(listener, 1000), filters);
chrome.webNavigation.onReferenceFragmentUpdated.addListener(debounce(listener, 1000), filters);
