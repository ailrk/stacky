"use strict";
document.addEventListener("DOMContentLoaded", () => {
    chrome.runtime.sendMessage({ type: "GET_STACKY" }, popup);
});
function popup(stacky) {
    const clearButton = document.getElementById("clear-button");
    const container = document.getElementById("stack");
    const { stack, pins } = stacky;
    if (!container)
        return;
    const keys = Object.keys(stack).sort((a, b) => {
        if (a in pins && !(b in pins)) {
            return -1;
        }
        if (b in pins && !(a in pins)) {
            return 1;
        }
        return a.localeCompare(b);
    });
    container.innerHTML = "";
    keys.forEach(host => {
        const hostDiv = document.createElement("div");
        hostDiv.classList.add("host");
        const title = document.createElement("div");
        title.classList.add("title");
        const titleText = document.createElement("h2");
        titleText.textContent = host;
        const pinButton = document.createElement('div');
        pinButton.title = "pin";
        pinButton.classList.add("pin-button");
        if (pins[host]) {
            pinButton.classList.add('pinned');
        }
        pinButton.addEventListener("click", function () {
            if (pinButton.classList.contains('pinned')) {
                pinButton.classList.remove('pinned');
                delete pins[host];
            }
            else {
                pinButton.classList.add('pinned');
                pins[host] = true;
            }
            chrome.runtime.sendMessage({ type: "SET_STACKY", stacky: stacky }, _ => {
                popup(stacky);
            });
        });
        title.appendChild(titleText);
        title.appendChild(pinButton);
        hostDiv.appendChild(title);
        const list = document.createElement("ul");
        for (let i = stack[host].length - 1; i >= 0; --i) {
            let page = stack[host][i];
            const url = new URL(page.url);
            const title = page.title || url.pathname;
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = url.href;
            link.textContent = title;
            link.textContent += url.hash ? ` ${url.hash}` : '';
            link.textContent += url.search ? ` ${url.search}` : '';
            link.target = "_blank";
            item.appendChild(link);
            list.appendChild(item);
        }
        hostDiv.appendChild(list);
        container.appendChild(hostDiv);
    });
    clearButton?.addEventListener("click", function () {
        chrome.storage.local.remove("stacky", function () {
            container.innerHTML = "";
        });
    });
}
