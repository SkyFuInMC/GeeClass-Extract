"use strict";
function wAlter (text, map) {
	let wtAr = Array.from(text);
	let wlist = [];
	let wstart = 0;
	let wname = "";
	let wmode = 0; //0 for $ searching, 1 for ${ confirm, 2 for ${} name add
	let wres = "";
	wtAr.forEach((e, i) => {
		//console.warn(i);
		switch (wmode) {
			case 0: {
				if (e == "$") {
					wmode = 1;
				};
				break;
			};
			case 1: {
				if (e == "{") {
					wstart = i - 1;
					wmode = 2;
				} else {
					wmode = 0;
				};
				break;
			};
			case 2: {
				if (e == "}") {
					wstart ++;
					wlist.push(new wAlter.alterItem(wstart, wname, ""));
					wstart = 0;
					wname = "";
					wmode = 0;
				} else {
					wname += e;
				};
				break;
			};
			default: {
				throw(new Error("Unknown mode $1 encountered at index $2.".replace("$1", wmode))).replace("$2", i);
			};
		};
	});
	let stOffset = 0;
	wlist.forEach((e) => {
		let wstart = e.start;
		let wname = e.name;
		//console.log([wstart, wname]);
		wtAr.splice(wstart - 1 - stOffset, wname.length + 3);
		//console.log(e.start);
		e.start -= stOffset;
		//console.log(e.start);
		stOffset += wname.length + 3;
		//console.log(wtAr);
	});
	stOffset = 0;
	wlist.forEach((e) => {
		let value = map[e.name];
		if (map[e.name] == undefined || map[e.name] == null) {
			e.value = Array.from("ERR_NULL");
		} else {
			let value = map[e.name];
			if (value.constructor == String) {
				e.value = Array.from(value);
			} else if (value.constructor == Number || value.constructor == BigInt) {
				e.value = Array.from(value.toString());
			} else {
				throw(new TypeError("Value \"$1\" must not be an explicit object.").replace("$1", e.name));
			};
		};
		wtAr.splice(e.start - 1 + stOffset, 0, ...e.value);
		stOffset += e.value.length;
	});
	//console.log(wlist);
	wtAr.forEach((e) => {
		wres += e;
	});
	return (wres);
};
wAlter.alterItem = function (start, name, value) {
	if (start.constructor == Number) {
		this.start = start;
	} else {
		throw(new TypeError("Value \"start\" must be a Number."));
	};
	if (name.constructor == String) {
		this.name = name;
	} else {
		throw(new TypeError("Value \"name\" must be a String."));
	};
	if (value.constructor == String) {
		this.value = Array.from(value);
	} else if (value.constructor == Number || value.constructor == BigInt) {
		this.value = Array.from(value.toString());
	} else {
		throw(new TypeError("Value \"value\" must not be an explicit object."));
	};
};

// Get school, grade and class information from storage
// Explicit fetch shorthand, especially for GeeClass
// https://teacher.fclassroom.com/so-analysis/api/download/download-student-wrong-question?schoolId=3633&exportConfig=11&gradeId=9224&clzssId=100939&gradeBaseId=6&studentId=3380901&subjectId=149795&subjectBaseId=1&knowledgeIds=&examIds=731353&orderType=1&questionType=&minScoreRate=&maxScoreRate=1&accountId=2656889&year=2019&accessToken=30f037f0a307bf329754adf53ed27179&client_value=14
var gcget = function (usage, tmp) {
	let path = "";
	switch (usage.toLowerCase()) {
		// JSON APIs
		case "stu-list": {path = "so-learning/api/learning/clzss-student-list?clzssId=${c}&gradeId=${g}&schoolId=${s}&subjectBaseId=${bb}&subjectId=${b}&year=${y}";break;};
		case "student-know": {path = "so-learning/api/learning/student-academic-records?clzssId=${c}&gradeId=${g}&schoolId=${s}&studentId=${st}&subjectBaseId=${bb}&subjectId=${b}&year=${y}";break;};
		case "stu-exam": {path = "so-learning/api/learning/student-exam-page?clzssId=${c}&examType=0&gradeBaseId=${gb}&gradeId=${g}&orderColumn=1&orderType=2&pageNum=${pn}&pageSize=20&schoolId=${s}&specialEnglishStatus=0&studentId=${st}&subjectBaseId=${bb}&subjectId=${b}&year=${y}";break;};
		case "stu-hmwk": {path = "so-learning/api/learning/student-exam-page?clzssId=${c}&examType=1&gradeBaseId=${gb}&gradeId=${g}&orderColumn=1&orderType=2&pageNum=${pn}&pageSize=20&schoolId=${s}&specialEnglishStatus=0&studentId=${st}&subjectBaseId=${bb}&subjectId=${b}&year=${y}";break;};
		case "stu-getonewrong": {path = "so-analysis/api/question/student-question-list?clzssId=${c}&examId=${ex}&gradeBaseId=${gb}&gradeId=${g}&maxScoreRate=1&minScoreRate=0&schoolId=${s}&studentId=${st}&subjectBaseId=${bb}&subjectId=${b}&year=${y}";break;};
		// Blob APIs
		case "stu-blobonewrong": {path = "so-analysis/api/download/download-student-wrong-question?schoolId=3633&exportConfig=11&gradeId=9224&clzssId=100939&gradeBaseId=6&studentId=3380901&subjectId=149795&subjectBaseId=1&knowledgeIds=&examIds=731353&orderType=1&questionType=&minScoreRate=&maxScoreRate=1&accountId=2656889&year=2019&accessToken=30f037f0a307bf329754adf53ed27179&client_value=14";break;};
	};
	return (fetch(wAlter("https://teacher.fclassroom.com/" + path, tmp), {"credentials":"include","headers":{"accept":"application/json, text/plain, */*","authorization":"Bearer " + tmp.t,"client-value": tmp.i},"referrer":"https://teacher.fclassroom.com/learnTrack/main.html","referrerPolicy":"no-referrer-when-downgrade","method":"GET","mode":"cors"}));
};