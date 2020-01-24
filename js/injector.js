"use strict";
console.log("已注入脚本至极课页面中！");
var binded = false, senderThread, senderFunc;

// 随机字符表
var genRand = function (length) {
	let r = "";
	let m = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
	for (let c = 0; c < length; c ++) {
		r += m[Math.floor(Math.random()*m.length)];
	};
	return r;
};

// 注入脚本后尝试与背景脚本建立连接
var qToken = genRand(32);
var transmit = function (data) {
	chrome.extension.sendMessage(data);
};
senderFunc = function () {
	if (binded) {
		try {
			var tmp = {};
			tmp.teacherId = localStorage.getItem("teacherId");
			tmp.teacherInfo = JSON.parse(localStorage.getItem("teacherInfo" + tmp.teacherId));
			tmp.trackStu = localStorage.getItem(tmp.teacherId + "stuTrack");
			transmit({method: "data", status: "fine", query: qToken, desc: tmp});
			console.info("正在向极课提取发送极课用户[$1]的数据".replace("$1", tmp.teacherId));
			tmp = null;
		} catch (error) {
			transmit({method: "data", status: "error", query: qToken, desc: error.stack});
		};
	} else {
		chrome.extension.sendMessage({
			method: "bind", query: qToken
		});
		console.info("尝试与极课提取建立连接……");
	};
};
senderThread = setInterval(senderFunc, 1000);

// 如果极课页面被关闭，则尝试断开连接
addEventListener("beforeunload", function () {
    chrome.extension.sendMessage({method: "unbind", query: qToken});
});

// 接收来自背景脚本的消息
chrome.extension.onMessage.addListener(function (msg) {
	//console.log([msg]);
	if (msg.query == qToken) {
		console.info("收到正确的连接回应");
		switch (msg.method.toLowerCase()) {
			case "bind": {
				if (msg.status == "complete") {
					binded = true;
					clearInterval(senderThread);
					senderFunc();
					senderThread = setInterval(senderFunc, 10000);
					console.info("连接已经成功建立");
				} else {
					console.error("连接建立失败：[$1]".replace("$1", msg.desc));
				};
				break;
			};
			default: {
				console.info("未知的方法：$1".replace("$1", msg.method.toUpperCase()));
			};
		};
	} else {
		console.info("收到不正确的连接回应，消息已经被忽略");
	};
});