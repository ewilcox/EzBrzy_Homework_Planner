var db, data, outputAssign, outputCourses, outputNotes,numAssignments, numCourses, numNotes,
	assignmentCount, courseCount, noteCount;

function dbErrorHandler(err) { alert("DB Error : " + err.message + "\n\nCode=" + err.code); }
function getById(id) { return document.querySelector(id); }
function dbSuccessCB() { alert("db.transaction success"); }
function dbQueryError(err) { alert("DB Query Error: " + err.message); }

function saveAssignment() {  // took (data,cb) out of parameter list
	db.transaction(function(tx) {
		var id = 1,
			name = "test",
			loc = "none",
			due = "some date",
			time = "some time",
			rem = "none",
			note = "none";
		tx.executeSql('INSERT INTO courses (cid, cname, cloc, cdue, ctime, crem, cnote) VALUES (?,?,?,?,?,?,?)',[id,name,loc,due,time,rem,note]);
	}, dbErrorHandler, dbSuccessCB);
//    if(data.title === "") { data.title = "[No Title]"; }
//    db.transaction(function(tx) {
//        if(data.id === "") { tx.executeSql("insert into notes(title,body,updated) values(?,?,?)",[data.title,data.body, new Date()]); }
//        else { tx.executeSql("update notes set title=?, body=?, updated=? where id=?",[data.title,data.body, new Date(), data.id]); }
//    }, dbErrorHandler,dbSuccessCB);
//    alert(data.title);
    //getEntries();
}

function setupTable(tx) {
	tx.executeSql('PRAGMA foreign_keys = ON;'); 
	tx.executeSql("CREATE TABLE IF NOT EXISTS courses(cid INTEGER PRIMARY KEY, cname TEXT NOT NULL, cloc, cdue, ctime, crem, cnote)");
	tx.executeSql("CREATE TABLE IF NOT EXISTS assignments(" +
					"aid INTEGER PRIMARY KEY, " +
					"cid INTEGER NOT NULL, " +
					"adesc TEXT NOT NULL, " +
					"adue, atime, aocc, arem, " +
					"anote TEXT, " +
					"FOREIGN KEY (cid) REFERENCES courses (cid))");
	tx.executeSql("CREATE TABLE IF NOT EXISTS notes(nid INTEGER PRIMARY KEY, ndesc TEXT NOT NULL, ndue, ntime, nrem, nooc)");
}

//TODO: calculate numbers!
function displayListing() {
	outputAssign='';
	outputCourses='';
	outputNotes='';
	numAssignments = 0;
	numCourses=0;
	numNotes=0;
	outputAssign += 'Displaying '+ numAssignments + ' Assignment(s)';
	outputCourses += 'Displaying '+ numCourses + ' Course(s)';
	outputNotes += 'Displaying '+ numNotes + ' Note(s)';
	$('#assignmentsDisplay').html(outputAssign);
	$('#coursesDisplay').html(outputCourses);
	$('#notesDisplay').html(outputNotes);
	//doReadNotes();	//TODO: should go away
}
function renderEntries(tx, results) {
	var i;
	for (i=0; i<results.rows.length; i++) {
		alert(results.rows.item(i).cid);
	}
}
function populateAssignments (tx,results) {
	//fill in output and .html to index.html correct location
	alert("Assignments count: " + results.rows.length);
}
function populateCourses () {
	//fill in output and .html to index.html correct location
	alert("Courses count: " + results.rows.length);
}
function populateNotes () {
	//fill in output and .html to index.html correct location
	alert("Notes count: " + results.rows.length);
}
function getAssignments() {
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM assignments", [], function (tx, results) { assignmentCount = results.rows.length; }, dbQueryError);
		tx.executeSql("SELECT * FROM courses", [], function (tx, results) { courseCount = results.rows.length; }, dbQueryError);
		tx.executeSql("SELECT * FROM notes", [], function (tx, results) { noteCount = results.rows.length; }, dbQueryError);
	}, dbErrorHandler);
	if (assignmentCount) { db.transaction(function(tx) { tx.executeSql("SELECT * FROM assignments", [], populateAssignments, dbQueryError); });	}   //else alert('no assignments');
	if (courseCount) { db.transaction(function(tx) { tx.executeSql("SELECT * FROM courses", [], populateCourses, dbQueryError); });	}   //else alert('no courses');
	if (noteCount) { db.transaction(function(tx) { tx.executeSql("SELECT * FROM notes", [], populateNotes, dbQueryError); });	}   //else alert('no notes');
}
function setupDB() {
	db = window.openDatabase("ezbrzy","1.0","EzBrzy Database",1000000);
	db.transaction(setupTable, dbErrorHandler);
}

function doSave() {
	$('#editAssignmentForm').submit();
	//getAssignments();  //<--- is working but don't want it here I think
	//saveAssignment();  //<--- is working but saveAssignment not adding correctly yet so keep commented out for now.
	
	//alert(data.title);  //seems to display data in form correctly.
	//alert($('#assignDesc').val());  //<--- this working
}
function onDeviceReady() {
	setupDB();
	displayListing();
	getAssignments();
	getById('#saveAssignment').addEventListener("click",doSave);
	
	$("#editAssignmentForm").live("submit",function(e) {
        data = {desc:$("#assignDesc").val(), 
                    due:$("#assignDateDue").val(),
                    time:$("#assignTimeDue").val()
        };
	});
	
	$('.mainPage').live('pageshow', function () {
		displayListing();
		getAssignments();
		//alert("Assignments: "+ assignmentCount +"\nCourses: "+courseCount+"\nNotes: "+noteCount);
	});
	
	$('.historyBack').live('tap',function() {
		history.back();
		return false;
	}).live('click',function() {
		return false;
	});

	//date picker function
	$(function(){
	    $('.dateScroller').scroller({
	        preset: 'date',
	        invalid: '',
	        theme: 'default',
	        display: 'inline',
	        mode: 'scroller',
	        dateOrder: 'mmD ddyy'
	    });    
	});

}

function init() {
    document.addEventListener("deviceready", onDeviceReady, true);
}
