function getDomainFromUrl(url) {
    var host = "null";
    if (typeof url == "undefined"
        || null == url)
        url = window.location.href;
    var regex = /.*\:\/\/([^\/]*).*/;
    var match = url.match(regex);
    if (typeof match != "undefined"
        && null != match)
        host = match;
    return host[1];
}

function getTypeFromUrl(url) {
    var arrayParam = url.split(":");
    return arrayParam[0];
}

function openTabFromUrl(url) {
    chrome.tabs.create({
        url:url
    });
    window.close();
}