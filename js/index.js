"use strict";
"unsafe-inline";

var promiseError = function (o) {
	console.info(o.stack);
	r();
};

var hints = {};
hints.title = ["请选择账户", "请选择班级", "请选择学生再继续操作", "学生错题", "学生分析"];

var sidebar, views, viewAction, viewTabs, accounts; //arrays
var title, titleHint, fullTab, accountDet, classDet, stuDet, exmDet, spinner;//elements
var tabActive, selected = {}, reqArgs = {};//root properties

var tabResizer = function () {
	title.style.width = (self.innerWidth - 56).toString() + "px";
	fullTab.style.width = (self.innerWidth - 48).toString() + "px";
	fullTab.style.height = (self.innerHeight - 32).toString() + "px";
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
			reqArgs.ex = selected.exmPaper;
		};
		exmDet.appendChild(newEl);
	});
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
		});
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
		gcget("stu-exam", reqArgs).catch(promiseError).then((req)=>{return req.json()}).catch(promiseError).then((examData) => {
			var exmData = examData.data.list;
			gcget("stu-hmwk", reqArgs).catch(promiseError).then((req)=>{return req.json()}).catch(promiseError).then((hmwkData) => {
				exmData.splice(exmData.length, 0, ...hmwkData.data.list);
				selected.exmList = exmData;
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
		viewTabs = Array.from(document.querySelectorAll(".fulltab > div"));
		sidebar = Array.from(document.querySelectorAll(".sidebar li"));
		fullTab = document.querySelector(".interface");
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
		tabResizer();
		addEventListener("resize", tabResizer);
		sidebar[0].click();
	};
});