/************Variety Block*********/


/************Main Block************/
document.scripts[0].src = "jquery.js"

$(document).ready(function () {
    initUI();
});

/************Function Block********/
function initUI() {
    var dLeft = $(window).width() - parseInt($("#container").width());
    $("#container").show().css("left", dLeft + "px");
    console.log(dLeft);
    updateSysList();
    updateServList();
}

function updateSysList() {
    chrome.extension.sendRequest({reqtype:"getSystemList"}, function (response) {
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
