"use strict";
var _ecma6_ = false;
if (self.Promise) {_ecma6_ = true};

var TabSearch = function (apply = location.search) {
	let text = apply.replace("?", "");
	console.log(text);
	let form = [];
	let output = {};
	form = text.split("&");
	console.warn(form);
	let count = 0;
	while (count < form.length) {
		form[count] = form[count].split("=");
		while (form[count].length > 2) {
			form[count].pop();
		}
		console.log("[elsl.ext.tab.search] Assigned item " + form[count][0] + " with value " + decodeURI(form[count][1]) + " inside table.");
		count++;
	}
	console.warn(form);
	if (_ecma6_) {
		count = 0;
		while (count < form.length) {
			output[decodeURI(form[count][0])] = decodeURI(form[count][1]);
			count++;
		}
	}
	else {
		console.error("[elsl.ext.tab.search] Does not support ECMA6.");
		output = new Error();
		output.message = "[elsl.ext.tab.search] Unsupported browser.";
	}
	console.warn(output);
	return output;
};
var getRaForQ = function (qid, sid, reqArgs) {
	gcRqPath(sid, qid, reqArgs).catch(promiseError).then((req)=>{return req.json()}).catch(promiseError).then((json) => {
		let dpth, dhd, ddone = false;
		if (json.data.length > 0) {
			dpth = json.data[0].examQuestionAnswers[0].analysisCapture;
			dhd = "https://image.fclassroom.com/";
		};
		Array.from(picDet.children).forEach((e) => {
			if (!(ddone) && e.children[4].innerHTML.indexOf("<img") == -1) {
				if (e.children[0].title == qid.toString()) {
					ddone = true;
					if (json.data.length > 0) {
						e.children[4].innerHTML = wAlter('<img src="${p}" />', {p: (dhd + dpth)});
						e.children[5].innerHTML = json.data[0].examQuestionAnswers[0].createUserName;
					} else {
						e.children[4].innerHTML = '<div id="load-spinner" class="fail"></div>';
					};
				};
			};
		});
	}).catch(promiseError);
};
var normalDate =  function (date = (new Date())) {
	let year = date.getFullYear().toString();
	let month = (date.getMonth() + 1).toString();
	let day = date.getDate().toString();
	return year + "-" + month + "-" + day;
};
var cleanUp = function () {
	let removed = [0, 0];
	Array.from(picDet.children).forEach((e) => {
		let exam = e.children[1].innerHTML.split("/");
		let ac = parseInt(exam[0]);
		let fs = parseInt(exam[1]);
		if (ac >= (fs - 1)) {
			//剔除做对了的题目
			e.remove();
			removed[0] ++;
		} else {
			e.children[1].remove();
			e.children[4].remove();
			if (e.children[2].children[0].tagName == "IMG") {
				if (e.children[2].children[0].src.indexOf("_3462x261_") != -1) {
					//剔除空扫题目
					e.remove();
					removed[1] ++;
				};
			} else if (e.children[2].children[0].tagName == "DIV") {
				e.remove();
				removed[1] ++;
			};
		};
	});
	alert("总共" + removed[0]+ "个对题，" + removed[1]+ "个空扫描题目");
};
var promiseError = function (o) {
	if (!(o)) {
		console.error("Received a reject but no further information provided.");
	} else {
		console.error(o.stack);
	};
};
var getAll = async function () {
	let local = Object.assign({}, reqArgs);
	picDet.innerHTML = "";
	for (let c = 0; c < selected.exmList.length; c ++) {
		let e = selected.exmList[c];
		local.ex = e.examId;
		let rep = await gcget("stu-getonewrong", local);
		let json = await rep.json();
		json.data[0].questionList.forEach((e1) => {
			let bigIdx = e1.questionTitle.replace("、", ".").replace(",", ".").split(".")[0];
			e1.childrenList.forEach((e2) => {
				let qid = e2.questionId;
				let ags = e2.score;
				let fqs = e2.questionScore;
				let smallIdx = e2.questionTitle;
				let hasAns = 0;
				let rans = "无";
				if (e2.answer) {
					rans = e2.answer;
				};
				let ansImg = "";
				if (e2.answerImage) {hasAns = 1; ansImg = e2.answerImage;};
				let qImg = "";
				if (e2.questionContent.imgPath != "") {
					qImg = ('<img src="https://teacher.fclassroom.com/q_file' + e2.questionContent.imgPath + '" />');
				} else {
					qImg = '<div id="load-spinner" class="fail"></div>';
				};
				let newEl = document.createElement("tr");
				newEl.innerHTML = wAlter('<td title="${qx}">${si}</td><td>${as}/${qs}</td><td title="${ai}">${ha}</td><td>${qi}</td><td>${nt}</td><td>无</td>', {
					bi: bigIdx, si: smallIdx, as: ags, qs: fqs, ai: ansImg, ha: [rans, "有"][hasAns], qi: qImg, qx: qid, nt: ['<div id="load-spinner" class="fail"></div>', '<div id="load-spinner" class="going"></div>'][hasAns]
				});
				if (hasAns == 1) {
					getRaForQ(qid, selected.school, local);
				};
				picDet.appendChild(newEl);
			});
		});
	};
	cleanUp();
	Promise.resolve();
};

let searchDet = TabSearch();
var broadcastChannel;
document.addEventListener("readystatechange", function () {
	if (this.readyState == "interactive") {
		self.picDet = document.querySelector("#list-exmpic");
		if (searchDet.channel) {
			broadcastChannel = new BroadcastChannel(searchDet.channel);
			broadcastChannel.postMessage({stage: "LOADED"});
			broadcastChannel.addEventListener("message", function (data) {
				switch (data.data.stage) {
					case "SENDING": {
						self.selected = data.data.selected;
						self.reqArgs = data.data.reqArgs;
						if (searchDet.type == "selected") {
							let selected = data.data.selected;
							self.picDet.innerHTML = data.data.form;
							document.title = "极课提取 - " + selected.studentName + "的错题（" + selected.exmName + "）[" + normalDate() + "]";
						};
						break;
					};
					case "DATA_OK": {
						if (searchDet.type == "all") {
							console.log("完全提取");
							document.title = "极课提取 - " + selected.studentName + "的全部错题[" + normalDate() + "]";
							getAll();
						} else {
							cleanUp();
						};
						break;
					};
				};
				console.log(data);
			});
		} else {
			document.write('<span style="color: #f00; font-size: 36px; font-weight: bold;">消息频道ID不正确，无法收到打印信息！</span>');
		};
	};
});