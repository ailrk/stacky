function emptyStacky() {
  return { stack: {}, pins: {} };
}


chrome.history.onVisited.addListener((historyItem) => {
  chrome.storage.local.get("stacky", (data) => {
    const stacky = data.stacky || emptyStacky();

    const url = new URL(historyItem.url!);
    const domain = url.hostname;

    if (!stacky.stack[domain]) {
      stacky.stack[domain] = [];
    }

    stacky.stack[domain].push({ title: historyItem.title, url: historyItem.url });

    chrome.storage.local.set({ stacky: stacky });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_STACKY") {
    chrome.storage.local.get("stacky", (data) => {
      sendResponse(data.stacky || emptyStacky());
    });
    return true; // Keep the message channel open for async response
  }

  if (message.type === "SET_STACKY") {
    chrome.storage.local.set({ stacky: message.stacky }).then(_ => {
      sendResponse(true);
    });
    return true;
  }
});
