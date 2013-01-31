/************Variety Block*********/
var listServerUrl = "http://127.0.0.1/whitelist";
var bkg = chrome.extension.getBackgroundPage();
var port = chrome.extension.connect({name:"popuplifeline"});
var blocked = [];
var allowed = [];
var sysWhiteList, sysBlackList, sysSessionWhiteList, sysSessionBlackList;

/************Main Block************/
document.scripts[0].src = "jquery.js"

$(document).ready(function () {
    if(localStorage['enable'] == 'true'){
        $("#controler").html('Close');
    }else{
        $("#controler").html('Open');
    }
    $("#test").bind("click", test);
    $("#controler").bind("click", changeStatus);
    $("#getServlist").bind("click", getServerList);
    $("#closewindow").bind("click", closeWindow);
    $("#settings").bind("click", openSettings);

    // check the status of the background and port
    if (bkg == null)
        console.log("Init the background page fail...");
    else console.log("Init the background page success...");
    if (port == null)
        console.log("Init the connect port of background fail...");
    else console.log("Init the connect port of background success...");

    initUI();
});

/************Function Block********/
function test() {

}

function loadServList() {
    bkg.getServlist()
}

function changeStatus() {
    if(localStorage['enable'] == 'true'){
        $("#controler").html('Close');
    }else{
        $("#controler").html('Open');
    }
    bkg.changeStatus();
    window.close();
}

function getServerList() {
    servUrl = document.getElementsByTagName("input")[0].value;
    testStr = servUrl.match(/http:\/\/.+/);
    if (testStr == null) {
        alert("Input error...");
        return;
    } else {
        alert("get the url: " + servUrl);
    }
//    bkg.refreshTabs();
    chrome.windows.getCurrent(function (w) {
        chrome.tabs.getSelected(w.id, function (tab) {
            bkg.refreshTab(tab.id, tab.url);
        });
    });
}

function getSystemList() {

}

function closeWindow() {
    window.close();
}

function openSettings() {
    openTabFromUrl("html/setting.html");
}

function initUI() {
    chrome.windows.getCurrent(function (w) {
        chrome.tabs.getSelected(w.id, function (tab) {
            taburloriginal = tab.url;
            tabUrl = taburloriginal.toLowerCase();
            tabID = tab.id;
            tabDomain = getDomainFromUrl(tabUrl);
            tabType = getTypeFromUrl(tabUrl);
            $("#currentwebsite").append(tabDomain);
            $("#currenttype").append(tabType);

            console.log("TabID:" + tabID);
            console.log("TabUrl:" + tabUrl);

            if (localStorage['enable'] != null && localStorage['enable']) {
                $("#controler").html("Close");
            } else {
                $("#controler").html("Open");
            }
//            console.log(bkg.ITEMS[tabID]['blocked'].length);

            chrome.windows.getCurrent(function (w) {
                chrome.tabs.getSelected(w.id, function (tab) {
                    if (bkg.extractDomainFromURL(tab.url) == "chrome") {
                        $("#accesslist").append("There is no blocked for chrome");
                    } else {
                        $("#accesslist").append(bkg.extractDomainFromURL(tab.url) + "/servlist");
                    }
                });
            });
        });
    });
}

function updateSysList(tabUrl, tabID) {
    chrome.extension.sendRequest({reqtype:"getAccessList", url:tabUrl, tid:tabID}, function (response) {
        sysWhiteList = JSON.parse(response.whitelist);
        sysBlackList = JSON.parse(response.blacklist);
        sysSessionWhiteList = JSON.parse(response.whitelistSession);
        sysSessionBlackList = JSON.parse(response.blacklistSession);
        for (i = 0; i < sysWhiteList.length; i++) {
            console.log(sysWhiteList[i]);
            $("#defaultwhitelist").append("<tr><td><a href='http://" + sysWhiteList[i] + "'>" + sysWhiteList[i] + "</a></td></tr>");
        }
        for (i = 0; i < sysSessionWhiteList.length; i++) {
            console.log(sysSessionWhiteList[i]);
            $("#defaultwhitelist").append("<tr><td><a href='http://" + sysSessionWhiteList[i] + "'>" + sysSessionWhiteList[i] + "</a></td></tr>");
        }
        $("#defaultwhitelist").find("a").bind("click", function () {
            openTabFromUrl($(this).attr('href'));
        });
        for (i = 0; i < sysBlackList.length; i++) {
            console.log(sysBlackList[i]);
            $("#defaultblacklist").append("<tr><td><a href='http://" + sysBlackList[i] + "'>" + sysBlackList[i] + "</a></td></tr>");
        }
        for (i = 0; i < sysSessionBlackList.length; i++) {
            console.log(sysSessionBlackList[i]);
            $("#defaultblacklist").append("<tr><td><a href='http://" + sysSessionBlackList[i] + "'>" + sysSessionBlackList[i] + "</a></td></tr>");
        }
        $("#defaultblacklist").find("a").bind("click", function () {
            openTabFromUrl($(this).attr('href'));
        });
    });
}

function updateServList(tabUrl, tabID) {

}

function getServList() {

}

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