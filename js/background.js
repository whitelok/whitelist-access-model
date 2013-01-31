/************Variety Block*********/
var popup = [];
var changed = false;
const ITEMS = {};
var experimental = 0;
const ReqList = {};
const REQITEMS = {};
var requestTypes = [];
var SERVLIST;
var TABLIST = [];
tabListCount = 0;

/************Main Block************/
console.log("This is WebMoudle logger...");
setDefaultOptions();

localStorage['enable'] = 'true';

//
if (typeof chrome.webRequest != 'undefined' && typeof chrome.contentSettings != 'undefined') {
    if (experimental == 0)
        experimental = 1;
    requestUrls = ["http://*/*", "https://*/*"];
    refreshRequestTypes();
    if (typeof chrome.webRequest != 'undefined') {
        // before send block it
        chrome.webRequest.onBeforeSendHeaders.addListener(mitigate, {
            "types":requestTypes,
            "urls":requestUrls
        }, ["requestHeaders", "blocking"]);
//        chrome.webRequest.onBeforeRequest.addListener(accessctrl, {
//            "types":requestTypes,
//            "urls":requestUrls
//        }, ['blocking']);
    }
}

//
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if (request.reqtype == 'getSettings') {
        console.log("Listen the event of getting settings");
        sendResponse({
            status:localStorage['enable'],
            enable:enabled(sender.tab.url),
            experimental:experimental,
            mode:localStorage['mode'],
            annoyancesmode:localStorage['annoyancesmode'],
            antisocial:localStorage['antisocial'],
            whitelist:localStorage['whiteList'],
            blacklist:localStorage['blackList'],
            whitelistSession:sessionStorage['whiteList'],
            blackListSession:sessionStorage['blackList'],
            script:localStorage['script'],
            noscript:localStorage['noscript'],
            object:localStorage['object'],
            applet:localStorage['applet'],
            embed:localStorage['embed'],
            iframe:localStorage['iframe'],
            frame:localStorage['frame'],
            audio:localStorage['audio'],
            video:localStorage['video'],
            image:localStorage['image'],
            annoyances:localStorage['annoyances'],
            preservesamedomain:localStorage['preservesamedomain'],
            webbugs:localStorage['webbugs'],
            referrer:localStorage['referrer'],
            linktarget:localStorage['linktarget']
        });
        if (typeof ITEMS[sender.tab.id] === 'undefined') {
            resetTabData(sender.tab.id, sender.tab.url);
        } else {
            if ((request.iframe != '1' && ((ITEMS[sender.tab.id]['url'].toLowerCase() != sender.tab.url.toLowerCase() && (sender.tab.url.indexOf("#") != -1 || ITEMS[sender.tab.id]['url'].indexOf("#") != -1) && removeHash(sender.tab.url.toLowerCase()) != removeHash(ITEMS[sender.tab.id]['url'].toLowerCase())) || (sender.tab.url.indexOf("#") == -1 && ITEMS[sender.tab.id]['url'].indexOf("#") == -1 && sender.tab.url.toLowerCase() != ITEMS[sender.tab.id]['url'].toLowerCase()) || changed) || sender.tab.url.toLowerCase().indexOf('https://chrome.google.com/webstore') != -1)) {
                resetTabData(sender.tab.id, sender.tab.url);
            }
        }
        return true;
    }
    if (request.reqtype == 'getList') {
        enableval = domainCheck(request.url);
        if (trustCheck(getDomainFromUrl(request.url), 0))
            enableval = 3;
        else if (trustCheck(getDomainFromUrl(request.url), 1))
            enableval = 4;
        if (localStorage['mode'] == 'block')
            sessionlist = sessionStorage['whiteList'];
        else if (localStorage['mode'] == 'allow')
            sessionlist = sessionStorage['blackList'];
        sendResponse({
            status:localStorage['enable'],
            enable:enableval,
            mode:localStorage['mode'],
            annoyancesmode:localStorage['annoyancesmode'],
            antisocial:localStorage['antisocial'],
            annoyances:localStorage['annoyances'],
            closepage:localStorage['classicoptions'],
            rating:localStorage['rating'],
            temp:sessionlist,
            blockeditems:ITEMS[request.tid]['blocked'],
            alloweditems:ITEMS[request.tid]['allowed'],
            domainsort:localStorage['domainsort']
        });
        changed = true;
        return true;
    }
    if (request.reqtype == 'getLocalOS') {
        sendResponse({
            os:localStorage['useragentspoof_os']
        });
        return true;
    }
    if (request.reqtype == 'updateBlocked') {
        updateCount(sender.tab.id);
        if (request.src) {
            if (typeof ITEMS[sender.tab.id]['blocked'] === 'undefined')
                ITEMS[sender.tab.id]['blocked'] = [];
            ITEMS[sender.tab.id]['blocked'].push([request.src, request.node]);
        }
        return true;
    }
    if (request.reqtype == 'updateAllowed') {
        if (request.src) {
            if (typeof ITEMS[sender.tab.id]['allowed'] === 'undefined')
                ITEMS[sender.tab.id]['allowed'] = [];
            ITEMS[sender.tab.id]['allowed'].push([request.src, request.node]);
        }
        return true;
    }
    if (request.reqtype == 'save') {
//        domainHandler(request.url, 2, 1);
//        domainHandler(request.url, request.list);
        changed = true;
        return true;
    }
    if (request.reqtype == 'temp') {
        if (typeof request.url == 'object') {
            for (i = 0; i < request.url.length; i++) {
                if (request.url[i][0] != 'no.script' && request.url[i][0] != 'web.bug') {
                    requesturl = request.url[i][0];
                    if ((localStorage['annoyances'] == 'true' && (localStorage['annoyancesmode'] == 'strict' || (localStorage['annoyancesmode'] == 'relaxed' && domainCheck(requesturl, 1) != '0')) && baddies(requesturl, localStorage['annoyancesmode'], localStorage['antisocial']) == 1) || (localStorage['antisocial'] == 'true' && baddies(requesturl, localStorage['annoyancesmode'], localStorage['antisocial']) == '2')) {
                        // do nothing
                    } else {
                        requesttype = request.url[i][1];
                        if (requesttype == '3') {
                            requesttype = 0;
                            if (!requesturl.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g))
                                requesturl = '*.' + getDomain(requesturl);
                        }
                        if (request.mode == 'block')
                            domainHandler(requesturl, 0, 1);
                        else
                            domainHandler(requesturl, 1, 1);
                    }
                }
            }
        } else {
            requesturl = request.url;
            if ((localStorage['annoyances'] == 'true' && (localStorage['annoyancesmode'] == 'strict' || (localStorage['annoyancesmode'] == 'relaxed' && domainCheck(requesturl, 1) != '0')) && baddies(requesturl, localStorage['annoyancesmode'], localStorage['antisocial']) == 1) || (localStorage['antisocial'] == 'true' && baddies(requesturl, localStorage['annoyancesmode'], localStorage['antisocial']) == '2')) {
                // do nothing
            } else {
                requesttype = request.oldlist;
                if (requesttype == '3') {
                    requesttype = 0;
                    if (!requesturl.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g))
                        requesturl = '*.' + getDomain(requesturl);
                }
                if (request.mode == 'block')
                    domainHandler(requesturl, 0, 1);
                else
                    domainHandler(requesturl, 1, 1);
            }
        }
        changed = true;
        return true;
    }
    if (request.reqtype == 'removeTemp') {
        if (typeof request.url == 'object') {
            for (i = 0; i < request.url.length; i++) {
                requesturl = request.url[i][0];
                requesttype = request.url[i][1];
                if (requesttype == '3') {
                    requesttype = 0;
                    if (!requesturl.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g))
                        requesturl = '*.' + getDomain(requesturl);
                }
                domainHandler(requesturl, 2, 1);
            }
        } else {
            requesturl = request.url;
            requesttype = request.oldlist;
            if (requesttype == '3') {
                requesttype = 0;
                if (!requesturl.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g))
                    requesturl = '*.' + getDomain(requesturl);
            }
            domainHandler(requesturl, 2, 1);
        }
        changed = true;
        return true;
    }
    if (request.reqtype == 'refreshPageIcon') {
        if (request.type == '0')
            chrome.browserAction.setIcon({
                path:"../img/128x128enable.png",
                tabId:request.tid
            });
        else if (request.type == '1')
            chrome.browserAction.setIcon({
                path:"../img/128x128disable.png",
                tabId:request.tid
            });
        else if (request.type == '2')
            chrome.browserAction.setIcon({
                path:"../img/128icon.png",
                tabId:request.tid
            });
        return true;
    }
    // if receive the unbind message
    console.log("Havn't define to listener such event...");
    sendResponse({});
    return true;
});

//
chrome.tabs.onRemoved.addListener(function (tabid) {
    delete ITEMS[tabid];
});

//
chrome.tabs.onUpdated.addListener(function (tabid, changeinfo, tab) {
    if (localStorage['enable'] == 'true' && tab.url.toLowerCase().substr(0, 4) == 'http') {
        if (changeinfo.status == 'loading') {
            icontype = "Allowed";
            iconname = "128x128enable"
            if (enabled(tab.url) == "true")
                icontype = "Forbidden";
            iconname = "128x128disable"
            if (in_array(getDomainFromUrl(tab.url.toLowerCase()), JSON.parse(sessionStorage["whiteList"])) || (getDomainFromUrl(tab.url).toLowerCase().substr(0, 4) == 'www.' && in_array(getDomainFromUrl(tab.url.toLowerCase()).substr(4), JSON.parse(sessionStorage["whiteList"]))) || in_array(getDomainFromUrl(tab.url.toLowerCase()), JSON.parse(sessionStorage["blackList"])) || (getDomainFromUrl(tab.url).toLowerCase().substr(0, 4) == 'www.' && in_array(getDomainFromUrl(tab.url.toLowerCase()).substr(4), JSON.parse(sessionStorage["blackList"]))))
                icontype = "Temp";
            iconame = "128icon"
            //path : "../img/Icon" + icontype + ".png",
            chrome.browserAction.setIcon({
                path:"../img/" + iconame + ".png",
                tabId:tabid
            });
        } else if (changeinfo.status == "complete") {
            if (experimental == '1') {
                chrome.contentSettings.javascript.clear({});
            }
            if (typeof ITEMS[tabid] != 'undefined') {
                if (localStorage['referrer'] == 'true') {
                    chrome.tabs.executeScript(tabid, {
                        code:'blockreferrer()',
                        allFrames:true
                    });
                }
                chrome.tabs.executeScript(tabid, {
                    code:'loaded()',
                    allFrames:true
                });
                changed = true;
                if (localStorage['mode'] == 'block' && typeof ITEMS[tabid]['allowed'] != 'undefined') {
                    for (i = 0; i < ITEMS[tabid]['allowed'].length; i++) {
                        if (in_array(getDomainFromUrl(relativeToAbsoluteUrl(ITEMS[tabid]['allowed'][i][0]).toLowerCase()), JSON.parse(sessionStorage["whiteList"])) || (getDomainFromUrl(relativeToAbsoluteUrl(ITEMS[tabid]['allowed'][i][0]).toLowerCase()).substr(0, 4) == 'www.' && in_array(getDomainFromUrl(relativeToAbsoluteUrl(ITEMS[tabid]['allowed'][i][0]).toLowerCase()).substr(4), JSON.parse(sessionStorage["whiteList"]))))
                            chrome.browserAction.setIcon({
                                path:"../img/128icon.png",
                                tabId:tabid
                            });
                    }
                } else if (localStorage['mode'] == 'allow' && typeof ITEMS[tabid]['blocked'] != 'undefined') {
                    for (i = 0; i < ITEMS[tabid]['blocked'].length; i++) {
                        if (in_array(getDomainFromUrl(relativeToAbsoluteUrl(ITEMS[tabid]['blocked'][i][0]).toLowerCase()), JSON.parse(sessionStorage["blackList"])) || (getDomainFromUrl(relativeToAbsoluteUrl(ITEMS[tabid]['blocked'][i][0]).toLowerCase()).substr(0, 4) == 'www.' && in_array(getDomainFromUrl(relativeToAbsoluteUrl(ITEMS[tabid]['blocked'][i][0]).toLowerCase()).substr(4), JSON.parse(sessionStorage["blackList"]))))
                            chrome.browserAction.setIcon({
                                path:"../img/128icon.png",
                                tabId:tabid
                            });
                    }
                }
            }
        }
    } else
        chrome.browserAction.setIcon({
            path:"../img/128x128disable.png",
            tabId:tabid
        });
});

//
chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        if (port.name == 'popuplifeline') {
            if (msg.url && msg.tid) {
                popup = [msg.url, msg.tid];
            }
        }
    });
    port.onDisconnect.addListener(function (msg) {
        if (popup.length > 0) {
            if (localStorage['refresh'] == 'true')
                chrome.tabs.update(popup[1], {
                    url:popup[0]
                });
            popup = [];
        }
    });
});

/************Function Block********/
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

function refreshRequestTypes() {
    requestTypes = ['main_frame'];
    if (localStorage['iframe'] == 'true' || localStorage['frame'] == 'true')
        requestTypes.push('sub_frame');
    if (localStorage['object'] == 'true' || localStorage['embed'] == 'true')
        requestTypes.push('object');
    if (localStorage['script'] == 'true')
        requestTypes.push('script');
    if (localStorage['image'] == 'true')
        requestTypes.push('image');
    if (localStorage['xml'] == 'true')
        requestTypes.push('xmlhttprequest');
}

//getServlist("http://127.0.0.1:8000/servlist/");

function mitigate(req) {
//    console.log(SERVLIST);
//    console.log(req.url);
    if (localStorage['preservesamedomain'] == 'false' && localStorage['script'] == 'true' && enabled(req.url.toLowerCase()) == 'true') {
        chrome.contentSettings.javascript.set({
            primaryPattern:'*://' + getDomainFromUrl(req.url.toLowerCase()) + '/*',
            setting:'block'
        });
    }
    if (typeof REQITEMS[req.tabId] == "undefined") {
        initREQITEMS(req.tabId);
        TABLIST[tabListCount] = req.tabId;
        tabListCount++;
    }
    if (REQITEMS[req.tabId]['domain'] == "") {
        REQITEMS[req.tabId]['domain'] = extractDomainFromURL(req.url);
        if (REQITEMS[req.tabId]['url'] == "") {
            REQITEMS[req.tabId]['url'] = req.url;
        }
    }
//    if (isBlocked(req)) {
//        // regist the tab id when the tab has blocked item
//        TABLIST.push(req.tabId);
//        console.log(req.url + " is blocked...");
//        return{
//            cancel:true
//        };
//    } else {
//        return {
//            requestHeaders:req.requestHeaders
//        };
//    }
}

function changeStatus(tabId, tabUrl){
    if(localStorage['enable'] == 'true'){
        localStorage['enable'] = 'false';
    }else{
        localStorage['enable'] = 'true';
    }
    refreshTabs();
}

function isBlocked(req) {
    if (localStorage['enable'] == 'true') {
        if (isMatchRules(req)) {
            return true;
        } else {
            return false;
        }
    } else {
        console.log("The apps is close...");
//        refreshTab();
        return false;
    }
}

function isMatchRules(req) {
    if (SERVLIST != 'undefined') {
        if (isInList(req.url, SERVLIST))
            return false;
        else return true;
    }
    return false;
}

function refreshTabs() {
    if (TABLIST != "undefined" || TABLIST.length != 0) {
        for (i = 0; i < TABLIST.length; i++) {
            chrome.tabs.update(TABLIST[i], {url:REQITEMS[TABLIST[i]]['url']});
//            TABLIST.splice(i, 1);
        }
    }
}

function refreshTab(tabId, tabUrl) {
    chrome.tabs.update(tabId, {url:tabUrl});
}

function isInList(url, list) {
    if (typeof list != 'string') {
        return false;
    } else {
        console.log(typeof list);
        return true;
    }
    urlNoParam = url.split('?');
    if (list.indexOf(urlNoParam) == -1) {
        return false;
    } else {
        return true;
    }
}

// 阻塞处理
function accessctrl(req) {
    // 显示请求
    //console.log(req);
    if (req.tabId != -1) {
        chrome.tabs.get(req.tabId, function (tab) {
//            console.log("TabID: " + req.tabId + ", Request URL: " + req.url + ", Request Type: " + req.type);
//            console.log(req.method);
                if (tab != 'undefined' && tab.url != 'undefined') {
                    if (tab.url != 'undefined' && tab.url.toLowerCase().substr(0, 4) == 'http' && enabled(tab.url.toLowerCase())) {
                        // 设定请求的类型
                        reqtype = req.type;
                        if (reqtype == "sub_frame") {
                            console.log("blocked sub frame ");
                            return {
                                cancel:true
                            };
                        }
                        console.log("pass");
                        return {
                            cancel:false
                        };
                    }
//                    if (typeof REQITEMS[req.tabId] == "undefined") {
//                        initREQITEMS(req.tabId);
//                    }
//                    if (reqtype == "main_frame" && REQITEMS[req.tabId]['domain'] == "") {
//                        REQITEMS[req.tabId]['domain'] = extractDomainFromURL(req.url);
//                    }
//                    if (matchRules(req.url, reqtype)) {
//                        REQITEMS[req.tabId]['blocked'].push({url:req.url, type:reqtype, method:req.url});
//                        console.log("163 coming");
//                        return {
//                            cancel:true
//                        };
//                    } else {
//                        return {
//                            cancel:false
//                        };
//                    }

                    //若未定义 则重置数据
//                if (typeof ITEMS[req.tabId] == "undefined") {
//                    resetTabData(req.tabId, req.url);
//                }
                    // 若未子页框则当成页框
//                if (reqtype == "sub_frame")
//                    reqtype = 'frame';
                    // 若是主页框则成页面
//                else if (reqtype == "main_frame")
//                    reqtype = 'page';
                    // video/audio would be caught by the "other" request type, but "other" also matches favicons
                    // 获取需阻塞的内容
//                if (req.url.toLowerCase().substr(0, 17) != 'chrome-extension:' && elementStatus(req.url, localStorage['mode'], tab.url) && (((((reqtype == "frame" && (localStorage['iframe'] == 'true' || localStorage['frame'] == 'true')) || (reqtype == "script" && localStorage['script'] == 'true') || (reqtype == "object" && (localStorage['object'] == 'true' || localStorage['embed'] == 'true')) || (reqtype == "image" && localStorage['image'] == 'true') || (reqtype == "xmlhttprequest" && localStorage['xml'] == 'true' && thirdParty(req.url, getDomainFromUrl(tab.url.toLowerCase()))))) && ((localStorage['preservesamedomain'] == 'true' && thirdParty(req.url, getDomainFromUrl(tab.url.toLowerCase()))) || localStorage['preservesamedomain'] == 'false')) || ((localStorage['annoyances'] == 'true' && (localStorage['annoyancesmode'] == 'strict' || (localStorage['annoyancesmode'] == 'relaxed' && domainCheck(relativeToAbsoluteUrl(req.url).toLowerCase(), 1) != '0')) && baddies(req.url, localStorage['annoyancesmode'], localStorage['antisocial']) == '1') || (localStorage['antisocial'] == 'true' && baddies(req.url, localStorage['annoyancesmode'], localStorage['antisocial']) == '2')))) {
//                    //console.log("BLOCKED: " + reqtype + "|" + req.url);
//                    // 初始化blocked容器
//                    if (typeof ITEMS[req.tabId]['blocked'] == 'undefined')
//                        ITEMS[req.tabId]['blocked'] = [];
//                    // 放入已阻塞的对象
//                    ITEMS[req.tabId]['blocked'].push([req.url, reqtype.toUpperCase()]);
//                    // 修改计数器
//                    updateCount(req.tabId);
//                        console.log(ITEMS.length);
//                    return {
//                        cancel:true
//                    };
//                } else {
//                    // 允许的内容
//                    if (reqtype != 'image' && reqtype != 'page' && reqtype != 'xmlhttprequest') {
//                        console.log("ALLOWED: " + reqtype + "|" + req.url);
//                        // 放进容器里面
//                        ITEMS[req.tabId]['allowed'].push([req.url, reqtype.toUpperCase()]);
//                    }
//                    return {
//                        cancel:false
//                    };
//                }
//            }
                }
                return {
                    cancel:false
                };
            }
        )
        ;
    }
}

function initREQITEMS(tabId) {
    if (tabId) {
        REQITEMS[tabId] = [0];
        REQITEMS[tabId]['domain'] = "";
        REQITEMS[tabId]['url'] = "";
        REQITEMS[tabId]['blocked'] = [];
        REQITEMS[tabId]['allowed'] = [];
    }
}

function matchRules(url, type) {
    if (extractDomainFromURL(url) == "www.163.com") {
        return true;
    }
}

function enabled(url) {
    if (localStorage["enable"] == "true" && domainCheck(url) != '0' && (domainCheck(url) == '1' || (localStorage["mode"] == "block" && domainCheck(url)) == '-1') && url.toLowerCase().indexOf('https://chrome.google.com/webstore') == -1)
        return 'true';
    return 'false';
}

function domainCheck(domain, req) {
    if (req === undefined) {
        if ((localStorage['annoyances'] == 'true' && localStorage['annoyancesmode'] == 'strict' && baddies(domain, localStorage['annoyancesmode'], localStorage['antisocial']) == '1') || (localStorage['antisocial'] == 'true' && baddies(domain, localStorage['annoyancesmode'], localStorage['antisocial']) == '2'))
            return '1';
    }
    domainname = getDomainFromUrl(domain.toLowerCase());
    var blackList = JSON.parse(localStorage['blackList']);
    var whiteList = JSON.parse(localStorage['whiteList']);
    var blackListSession = JSON.parse(sessionStorage['blackList']);
    var whiteListSession = JSON.parse(sessionStorage['whiteList']);
    if (domainname.substr(0, 4) == 'www.') {
        if (localStorage['mode'] == 'allow' && in_array(domainname.substr(4), blackListSession))
            return '1';
        if (localStorage['mode'] == 'block' && in_array(domainname.substr(4), whiteListSession))
            return '0';
        if (in_array(domainname.substr(4), blackList))
            return '1';
        if (in_array(domainname.substr(4), whiteList))
            return '0';
    } else {
        if (localStorage['mode'] == 'allow' && in_array(domainname, blackListSession))
            return '1';
        if (localStorage['mode'] == 'block' && in_array(domainname, whiteListSession))
            return '0';
        if (in_array(domainname, blackList))
            return '1';
        if (in_array(domainname, whiteList))
            return '0';
    }
    if (req === undefined) {
        if (localStorage['annoyances'] == 'true' && localStorage['annoyancesmode'] == 'relaxed' && baddies(domain, localStorage['annoyancesmode'], localStorage['antisocial']) == '1')
            return '1';
    }
    return '-1';
}

function domainSort(hosts) {
    sorted_hosts = new Array();
    split_hosts = new Array();
    multi = 0;
    if (hosts.length > 0) {
        multi = hosts[0].length;
        if (multi == 2) {
            for (h in hosts) {
                split_hosts.push([getDomain(getDomainFromUrl(hosts[h][0])), hosts[h][0], hosts[h][1]]);
            }
            split_hosts.sort();
            for (h in split_hosts) {
                sorted_hosts.push([split_hosts[h][1], split_hosts[h][2]]);
            }
        } else {
            for (h in hosts) {
                split_hosts.push([getDomain(getDomainFromUrl(hosts[h])), hosts[h]]);
            }
            split_hosts.sort();
            for (h in split_hosts) {
                sorted_hosts.push(split_hosts[h][1]);
            }
        }
        return sorted_hosts;
    }
    return hosts;
}

function trustCheck(domain, mode) {
    if (mode == 0) {
        var list = JSON.parse(localStorage['whiteList']);
    } else if (mode == 1) {
        var list = JSON.parse(localStorage['blackList']);
    }
    if (in_array(domain.toLowerCase(), list) == 2)
        return true;
    return false;
}

function topHandler(domain, mode) {
    if (domain) {
        domainHandler(domain, 2);
        if (!domain.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g))
            domain = '*.' + getDomain(domain);
        domainHandler(domain, mode);
        return true;
    }
    return false;
}

// 域名获取
function domainHandler(domain, action, listtype) {
    if (listtype === undefined)
        listtype = 0;
    if (domain) {
        errorflag = false;
        domain = domain.toLowerCase();
        action = parseInt(action);
        // Initialize local storage
        if (listtype == 0) {
            if (typeof (localStorage['whiteList']) == 'undefined')
                localStorage['whiteList'] = JSON.stringify([]);
            if (typeof (localStorage['blackList']) == 'undefined')
                localStorage['blackList'] = JSON.stringify([]);
            var whiteList = JSON.parse(localStorage['whiteList']);
            var blackList = JSON.parse(localStorage['blackList']);
        } else if (listtype == 1) {
            if (typeof (sessionStorage['whiteList']) == 'undefined')
                sessionStorage['whiteList'] = JSON.stringify([]);
            if (typeof (sessionStorage['blackList']) == 'undefined')
                sessionStorage['blackList'] = JSON.stringify([]);
            var whiteList = JSON.parse(sessionStorage['whiteList']);
            var blackList = JSON.parse(sessionStorage['blackList']);
        }
        // Remove domain from whitelist and blacklist
        var pos = whiteList.indexOf(domain);
        if (pos > -1)
            whiteList.splice(pos, 1);
        pos = blackList.indexOf(domain);
        if (pos > -1)
            blackList.splice(pos, 1);
        if (domain.substr(0, 4) == 'www.') {
            var pos = whiteList.indexOf(domain.substr(4));
            if (pos > -1)
                whiteList.splice(pos, 1);
            pos = blackList.indexOf(domain.substr(4));
            if (pos > -1)
                blackList.splice(pos, 1);
            domain = domain.substr(4);
        }
        if (domain.substr(0, 2) == '*.') {
            if (action != '2') {
                var pos = whiteList.indexOf(domain.substr(2));
                if (pos > -1)
                    whiteList.splice(pos, 1);
                pos = blackList.indexOf(domain.substr(2));
                if (pos > -1)
                    blackList.splice(pos, 1);
                if ((in_array(domain, whiteList) && in_array(domain, whiteList) != 2) || (in_array(domain, blackList) && in_array(domain, blackList) != 2)) {
                    if (confirm('Previous entries detected that refer to specific sub-domains on ' + domain.substr(2) + '.\r\n\r\nDo you want to delete the previous entries?')) {
                        if (action == '0') {
                            dinstances = haystackSearch(domain, whiteList);
                            for (x = 0; x < dinstances.length; x++) {
                                whiteList.splice(whiteList.indexOf(dinstances[x]), 1);
                            }
                        } else if (action == '1') {
                            dinstances = haystackSearch(domain, blackList);
                            for (x = 0; x < dinstances.length; x++) {
                                blackList.splice(blackList.indexOf(dinstances[x]), 1);
                            }
                        }
                    }
                }
            }
        }
        switch (action) {
            case 0:
                // Whitelist
                if (in_array(domain, whiteList) != 2)
                    whiteList.push(domain);
                else
                    errorflag = true;
                break;
            case 1:
                // Blacklist
                if (in_array(domain, blackList) != 2)
                    blackList.push(domain);
                else
                    errorflag = true;
                break;
            case 2:
                // Remove
                break;
        }
        if (errorflag)
            return false;
        if (listtype == 0) {
            localStorage['whiteList'] = JSON.stringify(whiteList);
            localStorage['blackList'] = JSON.stringify(blackList);
        } else if (listtype == 1) {
            sessionStorage['whiteList'] = JSON.stringify(whiteList);
            sessionStorage['blackList'] = JSON.stringify(blackList);
        }
        return true;
    }
    return false;
}

function haystackSearch(needle, haystack) {
    var keys = [];
    for (key in haystack) {
        if (getDomain(needle) == getDomain(haystack[key])) {
            keys.push(haystack[key]);
        }
    }
    return keys;
}

// 判断是否存在
function optionExists(opt) {
    return ( typeof localStorage[opt] != "undefined");
}

// 设置默认选项值
function defaultOptionValue(opt, val) {
    if (!optionExists(opt))
        localStorage[opt] = val;
}

// 设置默认选项
function setDefaultOptions() {
    // defaultOptionValue("version", version);
    defaultOptionValue("updatenotify", "true");
    defaultOptionValue("enable", "true");
    defaultOptionValue("mode", "block");
    defaultOptionValue("refresh", "true");
    defaultOptionValue("script", "true");
    defaultOptionValue("noscript", "false");
    defaultOptionValue("object", "true");
    defaultOptionValue("applet", "true");
    defaultOptionValue("embed", "true");
    defaultOptionValue("iframe", "true");
    defaultOptionValue("frame", "true");
    defaultOptionValue("audio", "true");
    defaultOptionValue("video", "true");
    defaultOptionValue("image", "false");
    defaultOptionValue("xml", "true");
    defaultOptionValue("annoyances", "true");
    defaultOptionValue("annoyancesmode", "relaxed");
    defaultOptionValue("antisocial", "false");
    defaultOptionValue("preservesamedomain", "false");
    defaultOptionValue("webbugs", "true");
    defaultOptionValue("classicoptions", "false");
    defaultOptionValue("rating", "true");
    defaultOptionValue("referrer", "true");
    defaultOptionValue("linktarget", "off");
    defaultOptionValue("search", "duckduckgo");
    defaultOptionValue("domainsort", "true");
    defaultOptionValue("useragentspoof", "off");
    defaultOptionValue("useragentspoof_os", "off");
    defaultOptionValue("referrerspoof", "domain");
    defaultOptionValue("cookies", "true");
    if (!optionExists("blackList"))
        localStorage['blackList'] = JSON.stringify([]);
    if (!optionExists("whiteList"))
        localStorage['whiteList'] = JSON.stringify(["translate.googleapis.com", "talkgadget.google.com"]);
    if (typeof sessionStorage['blackList'] === "undefined")
        sessionStorage['blackList'] = JSON.stringify([]);
    if (typeof sessionStorage['whiteList'] === "undefined")
        sessionStorage['whiteList'] = JSON.stringify([]);
    chrome.browserAction.setBadgeBackgroundColor({
        color:[208, 0, 24, 255]
    });
}

// 更新在图标下方显示BLOCKED资源的个数
function updateCount(tabId) {
    const TAB_ITEMS = ITEMS[tabId] || (ITEMS[tabId] = [0]);
    const TAB_BLOCKED_COUNT = ++TAB_ITEMS[0];
    chrome.browserAction.setBadgeBackgroundColor({
        color:[208, 0, 24, 255],
        tabId:tabId
    });
    chrome.browserAction.setBadgeText({
        tabId:tabId,
        text:TAB_BLOCKED_COUNT + ''
    });
}

// 从队列中删除
function removeFromArray(arr, value) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i][0] == value)
            arr.splice(i, 1);
    }
}


function removeHash(str) {
    if (str.indexOf("#") != -1)
        return str.substr(0, str.indexOf("#"));
    return str;
}

// 重设Tab中的数据
function resetTabData(id, url) {
    if (id && url) {
        ITEMS[id] = [0];
        ITEMS[id]['url'] = url;
        ITEMS[id]['blocked'] = [];
        ITEMS[id]['allowed'] = [];
    }
}

function revokeTemp() {
    sessionStorage['blackList'] = JSON.stringify([]);
    sessionStorage['whiteList'] = JSON.stringify([]);
}

function statuschanger() {
    if (localStorage['enable'] == 'true') {
        localStorage['enable'] = 'false';
        chrome.browserAction.setIcon({
            path:"../img/128x128enable.png"
        });
    } else {
        localStorage['enable'] = 'true';
        chrome.browserAction.setIcon({
            path:"../img/128x128disable.png"
        });
    }
}

function getServlist(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            clearTimeout(clearTO);
            localStorage['serverListEnable'] = true;
            console.log("Success");
            SERVLIST = xhr.responseText;
        }
        if (xhr.status == 404) {
            localStorage['serverListEnable'] = false;
            console.log("Access Forbbiden");
            return;
        }
    };
    var clearTO = setTimeout(function () {
        xhr.abort();
        console.log("Access Timeout");
    }, 5);
    xhr.send(null);
    console.log(SERVLIST);
}

function in_array(str1, str2) {
    for (key in str2) {
        if (str2[key] == str1) {
            return '1';
            break;
        } else if (str2[key][0] == '*' && str2[key][1] == '.' && str1.indexOf(str2[key].substr(2)) != -1 && getDomain(needle) == getDomain(haystack[key])) {
            return '2';
            break;
        }
    }
    return false;
}
function baddies(src, amode, antisocial) {
    // Confucius say: you go to JAIL, BAD BOY!
    src = src.toLowerCase();
    dmn = extractDomainFromURL(relativeToAbsoluteUrl(src));
    if (dmn.indexOf(".") == -1 && src.indexOf(".") != -1) dmn = src;
    if (antisocial == 'true' && (antisocial2.indexOf(dmn) != -1 || antisocial1.indexOf(getDomain(dmn)) != -1 || src.indexOf("digg.com/tools/diggthis.js") != -1 || src.indexOf("/googleapis.client__plusone.js") != -1 || src.indexOf("apis.google.com/js/plusone.js") != -1 || src.indexOf(".facebook.com/connect") != -1 || src.indexOf(".facebook.com/plugins") != -1 || src.indexOf(".facebook.com/widgets") != -1 || src.indexOf(".fbcdn.net/connect.php/js") != -1 || src.indexOf(".stumbleupon.com/hostedbadge") != -1 || src.indexOf(".youtube.com/subscribe_widget") != -1 || src.indexOf(".ytimg.com/yt/jsbin/www-subscribe-widget") != -1))
        return '2';
//    if (((amode == 'relaxed' && domainCheck(dmn, 1) != '0') || amode == 'strict') && (yoyo2.indexOf(dmn) != -1 || yoyo1.indexOf(getDomain(dmn)) != -1))
    if (((amode == 'relaxed' && domainCheck(dmn, 1) != '0') || amode == 'strict'))
        return '1';
    return false;
}
function elementStatus(src, mode, taburl) {
    src = relativeToAbsoluteUrl(src).toLowerCase();
    if (taburl === undefined) taburl = window.location.hostname.toLowerCase();
    else taburl = extractDomainFromURL(taburl.toLowerCase());
    if (src.substr(0, 11) != 'javascript:' && domainCheck(src) != '0' && (domainCheck(src) == '1' || (domainCheck(src) == '-1' && mode == 'block' && (thirdParty(src, taburl) || !thirdParty(src, taburl) || (thirdParty(src, taburl) && src.indexOf("?") != -1 && (src.indexOf(taburl) != -1 || (taburl.substr(0, 4) == 'www.' && src.indexOf(taburl.substr(4)) != -1) || src.indexOf(extractDomainFromURL(src), extractDomainFromURL(src).length) != -1 || (extractDomainFromURL(src).substr(0, 4) == 'www.' && src.indexOf(extractDomainFromURL(src).substr(4), extractDomainFromURL(src).length) != -1) || src.indexOf(getDomain(taburl, 1)) != -1)))))) return true;
    return false;
}
function thirdParty(url, taburl) {
    if (url) {
        var requestHost = relativeToAbsoluteUrl(url.toLowerCase());
        if (domainCheck(requestHost) == '0') return false;
        var requestHost = extractDomainFromURL(requestHost);
        if (taburl === undefined) documentHost = window.location.hostname.toLowerCase();
        else documentHost = taburl;
        requestHost = requestHost.replace(/\.+$/, "");
        documentHost = documentHost.replace(/\.+$/, "");
        if (requestHost == documentHost) return false; // if they match exactly (same domain), our job here is done
        // handle IP addresses (if we're still here, then it means the ip addresses don't match)
        if (requestHost.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) || documentHost.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g)) return true;
        // now that IP addresses have been processed, carry on.
        elConst = requestHost.split('.').reverse(); // work backwards :)
        pageConst = documentHost.split('.').reverse();
        max = elConst.length;
        if (max < pageConst.length)
            max = pageConst.length;
        matchCount = 0;
        for (i = 0; i < max; i++) {
            if (elConst[i] && pageConst[i] && elConst[i] == pageConst[i]) matchCount++;
            else break; // exit loop as soon as something doesn't exist/match
        }
        if (matchCount > 2) return false;
        else if (matchCount == 2 && ((pageConst[1] == 'co' || pageConst[1] == 'com' || pageConst[1] == 'net') && pageConst[0] != 'com')) return true;
        if (matchCount == 2) return false;
        return true;
    } else return false; // doesn't have a URL
}
function relativeToAbsoluteUrl(url) { // credit: NotScripts
    if (!url || url.match(/^http/i))
        return url;
    if (url[0] == '/' && url[1] == '/')
        return document.location.protocol + url;
    if (url[0] == '/')
        return document.location.protocol + "//" + window.location.hostname + url;
    var base = document.baseURI.match(/.+\//);
    if (!base)
        return document.baseURI + "/" + url;
    return base[0] + url;
}
function extractDomainFromURL(url) {
    if (!url) return "";
    var x = url.toLowerCase();
    if (x.indexOf("://") != -1) x = x.substr(url.indexOf("://") + 3);
    if (x.indexOf("/") != -1) x = x.substr(0, x.indexOf("/"));
    if (x.indexOf("@") != -1) x = x.substr(x.indexOf("@") + 1);
    if (x.indexOf(":") > 0) x = x.substr(0, x.indexOf(":"));
    return x;
}
function getDomain(url, type) {
    if (url && !url.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) && url.indexOf(".") != -1) {
        // below line may be edited/removed in the future to support granular trust-ing
        if (url[0] == '*' && url[1] == '.') return url.substr(2);
        url = url.toLowerCase().split(".").reverse();
        len = url.length;
        if (len > 1) {
            if (type === undefined) domain = url[1] + '.' + url[0];
            else domain = url[1];
            if ((url[1] == 'co' || url[1] == 'com' || url[1] == 'net') && url[0] != 'com' && len > 2) {
                if (type === undefined) domain = url[2] + '.' + url[1] + '.' + url[0];
                else domain = url[2];
            }
        }
        return domain;
    }
    return url;
}