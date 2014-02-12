var manifest = chrome.runtime.getManifest();
document.title = manifest.name;
window.location.href = manifest.homepage_url;