"use strict";
chrome.runtime.onInstalled.addListener(function () {
	console.log("极课提取已成功安装！");
	chrome.tabs.create({url: "/web/firstRun.htm"}, function () {
		console.log("安装向导已打开。");
	});
});
chrome.webNavigation.onDOMContentLoaded.addListener(function (event) {
	console.log(event);
	gcTabs.permitted.add(event.tabId);
}, {
	url: [
		{urlMatches: 'https://teacher.fclassroom.com/'},
		{urlMatches: 'https://teacher.fclassroom.com/*'},
		{urlMatches: 'chrome-extension://*'}
	]
});

// 已建立连接页面的信息
function TabDesc (tab, q) {
	this.id = tab.id;
	this.index = tab.index;
	this.width = tab.width;
	this.height = tab.height;
	this.incognito = tab.incognito;
	this.url = tab.url;
	this.query = q;
};

// 尝试与极课页面建立连接
var gcTabs = {
	permitted: new Set(),
	connected: new Set()
};
var rep = function (id, data) {
	chrome.tabs.sendMessage(id, data);
};
chrome.extension.onMessage.addListener(function (msg, ini) {
	//console.log([msg, ini]);
	let urlSet = ini.url;
	let src = ini.tab.id;
	switch (msg.method.toLowerCase()) {
		case "bind": {
			let allow = false;
			let ident = "$2-$3".replace("$2", ini.tab.id).replace("$3", ini.tab.index);
			if (urlSet.indexOf("https://") == 0) {
				allow = true;
			} else if (urlSet.indexOf("chrome-extension://") == 0) {
				allow = true;
			} else {
				rep(src, {method: "bind", status: "rejected", query: msg.query, desc: "ERR: UNKNOWN_PROTOCOL"});
				console.error("收到来自未知协议来源的[$2]连接请求：[$1]".
					replace("$1", ini.url)
					.replace("$2", ident));
			};
			if (allow) {
				urlSet.replace("//","/");
				urlSet = urlSet.split("/");
				console.info(urlSet);
				switch (urlSet[2]) {
					case "teacher.fclassroom.com": {
						if ((Array.from(gcTabs.permitted)).indexOf(ini.tab.id) != -1) {
							gcTabs.connected.add(new TabDesc(ini.tab, msg.query));
							rep(src, {method: "bind", status: "complete", query: msg.query});
							console.info("已建立[$2]连接！".replace("$2", ident));
						} else {
							rep(src, {method: "bind", status: "rejected", query: msg.query, desc: "ERR: UNKNOWN_REQUEST"});
							console.error("收到来自极课教师端的[$2]连接请求，但是因为没有事先声明启动，连接有被滥用的风险，因此拒绝".replace("$2", ident));
						};
						break;
					};
					default: {
						//rep(src, {method: "bind", status: "rejected", query: msg.query, desc: "ERR: UNKNOWN_DOMAIN"});
						console.warn("收到未知域名来源的[$2]连接请求：$1"
							.replace("$2", ident)
							.replace("$1", urlSet[2]));
					}
				};
				if (urlSet[0] == "chrome-extension:") {
					gcTabs.permitted.add(ini.tab.id);
					gcTabs.connected.add(new TabDesc(ini.tab, msg.query));
					rep(src, {method: "bind", status: "complete", query: msg.query});
					console.info("已建立[$2]连接！".replace("$2", ident));
				};
			} else {
				console.error("[$2]连接请求已拒绝"
					.replace("$2", ident));
			};
			break;
		};
		default: {
			let allow = false;
			Array.from(gcTabs.connected).forEach((e) => {
				if (msg.query == e.query){
					allow = true;
				};
			});
			if (allow) {
				switch (msg.method.toLowerCase()) {
					case "unbind": {
						console.info("收到与页面[$1]断开连接的请求".replace("$1", ini.tab.id));
						if (Array.from(gcTabs.permitted).indexOf(ini.tab.id) != -1) {
							let done = false;
							Array.from(gcTabs.connected).forEach((e) => {
								if (e.id == ini.tab.id && done == false) {
									gcTabs.connected.delete(e);
									gcTabs.permitted.delete(ini.tab.id);
									console.info("已经与页面[$1]断开连接".replace("$1", ini.tab.id));
								};
							});
						} else {
							console.info("页面[$1]不在被允许的页面内，请求无效".replace("$1", ini.tab.id));
						};
						break;
					};
					case "data": {
						console.info("收到来自页面[$1]的极课用户数据".replace("$1", ini.tab.id));
						localStorage.setItem("T:" + msg.desc.teacherId, JSON.stringify({info: msg.desc.teacherInfo, trackStu: JSON.parse(msg.desc.trackStu)}));
						console.info("已存储来自页面[$1]的极课用户[$2]数据".replace("$1", ini.tab.id).replace("$2", msg.desc.teacherId));
						break;
					};
					default: {
						console.error("收到未知的请求：“$1”".replace("$1", msg.method));
					};
				};
			} else {
				console.error("收到不正确的[$1]连接请求，已忽略".replace("$1", ini.tab.id));
			};
		};
	};
});