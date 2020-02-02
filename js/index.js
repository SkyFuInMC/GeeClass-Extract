"use strict";
"unsafe-inline";

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
var genRand = function (length) {
	let r = "";
	let m = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
	for (let c = 0; c < length; c ++) {
		r += m[Math.floor(Math.random()*m.length)];
	};
	return r;
};
var promiseError = function (o) {
	spinner.className = "fail";
	if (!(o)) {
		console.info("Received a reject but no further information provided.");
	} else {
		console.info(o.stack);
	};
};
var refuse = function (text = "No information provided.") {
	throw(new Error(text));
};

var hints = {};
hints.title = ["请选择账户", "请选择班级", "请选择学生再继续操作", "学生错题", "学生分析"];

var sidebar, views, viewAction, viewTabs, accounts, bottomBtns, gcePrintBtns, printChannels = []; //arrays
var title, titleHint, fullTab, accountDet, classDet, stuDet, exmDet, picDet, spinner;//elements
var tabActive, selected = {}, reqArgs = {}, popup = {};//root properties

var tabResizer = function () {
	title.style.width = (self.innerWidth - 56).toString() + "px";
	fullTab.style.width = (self.innerWidth - 48).toString() + "px";
	fullTab.style.height = (self.innerHeight - 32).toString() + "px";
	popup.windows.forEach((e) => {
		e.winEl.style.height = (e.clientHeight - 24).toString() + "px";
	});
};
var stuListDisp = function () {
	stuDet.innerHTML = "";
	selected.stuList.forEach((e) => {
		let newEl = document.createElement("tr");
		newEl.innerHTML = wAlter('<td>${stv}</td><td title="${sti}">${stn}</td><td>${stj}</td><td>请看页面左边</td>', {stv: e.studentNo, sti: e.studentId, stn: e.studentName, stj: e.jikeNum});
		if (selected.student == e.studentId) {
			newEl.className = "active";
		};
		newEl.onpointerup = function () {
			Array.from(stuDet.children).forEach((e2) => {
				e2.className = "";
			});
			this.className = "active";
			selected.student = this.children[1].title;
			selected.studentName = this.children[1].innerText;
			selected.exmName = "";
			selected.exmPaper = 0;
			reqArgs.st = selected.student;
		};
		stuDet.appendChild(newEl);
	});
};
var exmListDisp = function () {
	exmDet.innerHTML = "";
	let etDesc = ["考试", "作业"];
	selected.exmList.forEach((e) => {
		let newEl = document.createElement("tr");
		newEl.innerHTML = wAlter('<td>${type}</td><td title="${eid}">${ename}</td><td>${ags}/${fus}</td><td>${cas}</td><td>${etime}</td>', {type: etDesc[e.examType], eid: e.examId, ename: e.examName, ags: e.studentScore, fus: e.examScore, cas: e.clzssAvgScore, etime: e.produceTime});
		newEl.onpointerup = function () {
			Array.from(exmDet.children).forEach((e2) => {
				e2.className = "";
			});
			this.className = "active";
			selected.exmPaper = this.children[1].title;
			selected.exmName = this.children[1].innerText;
			reqArgs.ex = selected.exmPaper;
		};
		exmDet.appendChild(newEl);
	});
};
var switchPopup = function (index) {
	popup.windows.forEach((e) => {
		e.title = "";
	});
	if (index > -1) {
		popup.windows[index].title = "active";
	};
	tabResizer();
};
var selExmDisp = function (p, r) {
	let curwin = popup.windows[0];
	curwin.titleEl.innerText = wAlter("提取“${studentName}”的“${exmName}”错题", selected);
	if (selected.exmName == "" || selected.exmName == undefined) {
		refuse();
	} else {
		picDet.innerHTML = "";
		gcget("stu-getonewrong", reqArgs).catch(promiseError).then((req)=>{return req.json()}).catch(promiseError).then((json) => {
			console.log(json);
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
						getRaForQ(qid, selected.school);
					};
					picDet.appendChild(newEl);
				});
			});
			p();
		});
	};
};
var getRaForQ = function (qid, sid) {
	gcRqPath(sid, qid, reqArgs).catch(promiseError).then((req)=>{return req.json()}).catch(promiseError).then((json) => {
		let dpth, dhd, ddone = false;
		if (json.data.length > 0) {
			dpth = json.data[0].examQuestionAnswers[0].analysisCapture;
			dhd = "https://image.fclassroom.com/";
		};
		Array.from(picDet.children).forEach((e) => {
			if (!(ddone)) {
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

viewAction = [function (p, r) {
	accountDet.innerHTML = "";
	accounts = [];
	for (let c = 0; c < localStorage.length; c ++) {
		let key = localStorage.key(c);
		if (key.indexOf("T:") == 0) {
			accounts.push(key);
			let stored = JSON.parse(localStorage.getItem(key));
			let id, name, number, client, token, logged;
			id = key.replace("T:","");
			number = stored.info.teacherInfo.loginName;
			name = stored.info.teacherInfo.realName;
			client = stored.info.teacherInfo.lastLoginClient;
			token = stored.info.accessToken;
			logged = new Date(stored.info.teacherInfo.lastLoginTime);
			let newEl = document.createElement("tr");
			newEl.innerHTML = wAlter("<td>${i}</td><td>${n}</td><td>${u}</td><td>${c}</td><td>${l}</td><td>${t}</td>", {i: id, u: number, n: name, c: client, t: token, l: logged.toLocaleString()});
			if (selected.account == id) {
				newEl.className = "active";
			};
			newEl.onpointerup = function () {
				//Array.from(accountDet.children).forEach((e)=>{e.className="";});
				//this.className = "active";
				selected.account = this.children[0].innerText;
				reqArgs.a = selected.account;
				selected.stored = JSON.parse(localStorage.getItem(wAlter("T:${i}", {i: selected.account})));
				selected.trackStudent = selected.stored.trackStu;
				selected.stored = selected.stored.info;
				reqArgs.t = selected.stored.accessToken;
				reqArgs.i = selected.stored.teacherInfo.lastLoginClient;
				sidebar[1].click();
			};
			accountDet.appendChild(newEl);
		};
	};
	p();
},function (p, r) {
	classDet.innerHTML = "";
	let school = selected.stored.school;
	let sname = school.schoolName;
	let sid = school.id;
	let syear = school.schoolYear.schoolYear;
	let syname = school.schoolYear.schoolYearName;
	let roleid = school.schoolYear.role.id;
	let rolen = school.schoolYear.role.roleName;
	school.schoolYear.role.grades.forEach((e1) => {
		let gradeid = e1.id;
		let gradebase = e1.baseGradeValue;
		let gradename = e1.baseGradeName;
		e1.subjects.forEach((e2) => {
			let subname = e2.baseSubjectName;
			let subid = e2.id;
			let subbv = e2.baseSubjectValue;
			e2.clzsses.forEach((e3) => {
				let classname = e3.clzssName;
				let classid = e3.id;
				let newEl = document.createElement("tr");
				newEl.innerHTML = wAlter('<td title="${gi},${gbv}">${gn}</td><td title="${ci}">${cn}</td><td title="${ri}">${rn}</td><td title="${sv},${sbv}">${sbn}</td><td title="${yi}">${yn}</td><td title="${si}">${sn}</td>', {gi: gradeid, gn: gradename, ci: classid, cn: classname, ri: roleid, rn: rolen, yi: syear, yn: syname, si: sid, sn: sname, sv: subid, sbv: subbv, sbn: subname, gbv: gradebase});
				if (selected.class == classid && selected.role == roleid) {
					newEl.className = "active";
				};
				newEl.onpointerup = function () {
					let info = Array.from(this.children);
					selected.grade = info[0].title;
					selected.class = info[1].title;
					selected.role = info[2].title;
					selected.subject = info[3].title;
					selected.year = info[4].title;
					selected.school = info[5].title;
					selected.subjectName = info[3].innerText;
					reqArgs.g = selected.grade.split(",")[0];
					reqArgs.gb = selected.grade.split(",")[1];
					reqArgs.c = selected.class;
					reqArgs.r = selected.role;
					reqArgs.y = selected.year;
					reqArgs.s = selected.school;
					reqArgs.b = selected.subject.split(",")[0];
					reqArgs.bb = selected.subject.split(",")[1];
					sidebar[2].click();
				};
				classDet.appendChild(newEl);
			});
		});
	});
	p();
},function (p, r) {
	let tUpdate = function () {
		gcget("stu-list", reqArgs).catch(promiseError).then((req)=>{return req.json()}).then((json) => {
			selected.stuList = json.data;
			selected.stuList.class = selected.class;
			stuListDisp();
			p();
		}).catch(promiseError);
	};
	if (!(selected.stuList)) {
		tUpdate();
	} else {
		if (selected.class == selected.stuList.class) {p()} else {
			tUpdate();
		};
	};
},function (p, r) {
	if (!(selected.exmList)) {
		selected.exmList = [];
	};
	reqArgs.pn = 1;
	if (selected.student != selected.exmList.student) {
		selected.exmList = [];
		gcget("stu-exam", reqArgs).catch(promiseError).then((req)=>{return req.json()}).catch(promiseError).then((examData) => {
			selected.exmList.splice(selected.exmList.length, 0, ...examData.data.list);
		}).then(() => {
			gcget("stu-hmwk", reqArgs).catch(promiseError).then((req)=>{return req.json()}).catch(promiseError).then((hmwkData) => {
				selected.exmList.splice(selected.exmList.length, 0, ...hmwkData.data.list);
				selected.exmList.student = selected.student;
				exmListDisp();
				p();
			});
		});
	} else {
		p();
	};
},function (p, r) {
	p();
}];

document.addEventListener("readystatechange", function () {
	if (this.readyState == "interactive") {
		document.oncontextmenu = function () {
			return false;
		};
		title = document.querySelector(".titlebar");
		titleHint = document.querySelector("#hint-title");
		accountDet = document.querySelector("#list-account");
		classDet = document.querySelector("#list-classes");
		spinner = document.querySelector("#load-spinner");
		stuDet = document.querySelector("#list-student");
		exmDet = document.querySelector("#list-exam");
		picDet = document.querySelector("#list-exmpic");
		gcePrintBtns = Array.from(document.querySelectorAll(".link-print"));
		viewTabs = Array.from(document.querySelectorAll(".fulltab > div"));
		sidebar = Array.from(document.querySelectorAll(".sidebar li"));
		bottomBtns = Array.from(document.querySelector(".bottom-btns").children);
		fullTab = document.querySelector(".interface");
		popup.base = document.querySelector(".popup");
		popup.back = document.querySelector(".popup-background");
		popup.windows = Array.from(document.querySelectorAll(".popup-window"));
		sidebar.forEach((e) => {
			e.addEventListener("click", function () {
				sidebar.forEach((e)=>{e.className=""});
				e.className="active";
				spinner.className = "going";
				tabActive = sidebar.indexOf(e);
				titleHint.innerText = hints.title[tabActive];
				viewTabs.forEach((e)=>{e.style.display="none"});
				viewTabs[tabActive].style.display = "";
				new Promise(viewAction[tabActive])
					.then(()=>{spinner.className = ""})
					.catch((error)=>{spinner.className = "fail"; console.error(error.stack)});
			});
		});
		addEventListener("resize", tabResizer);
		sidebar[0].click();
		bottomBtns[1].onpointerup = function () {
			popup.base.title = "active";
			switchPopup(0);
			spinner.className = "going";
			new Promise(selExmDisp).catch(promiseError).then(()=>{spinner.className = ""});
		};
		popup.back.onclick = function () {
			popup.base.title = "";
			switchPopup(-1);
		};
		popup.windows.forEach((e) => {
			e.titleEl = e.children[0].children[0];
			e.winEl = e.children[1];
		});
		gcePrintBtns.forEach((e) => {
			let tpath = "print.htm?type=";
			if (e.id == "link-selprint") {
				tpath += "selected";
			} else if (e.id == "link-allprint") {
				tpath += "all";
			};
			e.onclick = function () {
				this.href = tpath + "&channel=" + genRand(32);
				let nbc = new BroadcastChannel((TabSearch(e.href.split("?")[1])).channel);
				nbc.addEventListener("message", function (event) {
					if (event.data.stage == "LOADED") {
						event.target.postMessage({stage: "SENDING", reqArgs: reqArgs, selected: selected, form: picDet.innerHTML});
						event.target.postMessage({stage: "DATA_OK"});
					};
					console.log(event);
				});
				printChannels.push(nbc);
			};
			e.href = tpath + "&channel=" + genRand(32);
		});
		bottomBtns[0].onpointerup = function () {
			let tpath = "print.htm?type=all";
			this.onclick = function () {
				this.href = tpath + "&channel=" + genRand(32);
				let nbc = new BroadcastChannel((TabSearch(this.href.split("?")[1])).channel);
				nbc.addEventListener("message", function (event) {
					if (event.data.stage == "LOADED") {
						event.target.postMessage({stage: "SENDING", reqArgs: reqArgs, selected: selected, form: picDet.innerHTML});
						event.target.postMessage({stage: "DATA_OK"});
					};
					console.log(event);
				});
				printChannels.push(nbc);
			};
			this.href = tpath + "&channel=" + genRand(32);
		};
		tabResizer();
	};
});