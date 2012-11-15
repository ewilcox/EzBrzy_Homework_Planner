var db;

//generic error handler
function onError(e) {
    alert("Error: "+e.toString());
	//getById("#content").innerHTML = "<h2>Error</h2>"+e.toString();
 }

function dbErrorHandler(err) {
	alert("DB Error : " + err.message + "\n\nCode=" + err.code);
}

//generic getById
function getById(id) {
    return document.querySelector(id);
}

function getEntries() {
	alert("db.transaction success");
//	db.transaction(function(tx) {
//		tx.executeSql("select id, title, body, updated from notes order by updated desc",[],renderEntries,dbErrorHandler);
//	}, dbErrorHandler);
}

function saveAssignment(note,cb) {
    if(note.title === "") { note.title = "[No Title]"; }
    db.transaction(function(tx) {
        if(note.id === "") { tx.executeSql("insert into notes(title,body,updated) values(?,?,?)",[note.title,note.body, new Date()]); }
        else { tx.executeSql("update notes set title=?, body=?, updated=? where id=?",[note.title,note.body, new Date(), note.id]); }
    }, dbErrorHandler,cb);
    getEntries();
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
	var outputAssign='', outputCourses='', outputNotes='', 
		numAssignments = 0, numCourses=0, numNotes=0;
	outputAssign += 'Displaying '+ numAssignments + ' Assignment(s)';
	outputCourses += 'Displaying '+ numCourses + ' Course(s)';
	outputNotes += 'Displaying '+ numNotes + ' Note(s)';
	$('#assignmentsDisplay').html(outputAssign);
	$('#coursesDisplay').html(outputCourses);
	$('#notesDisplay').html(outputNotes);
	//doReadNotes();	//TODO: should go away
}

function setupDB() {
	db = window.openDatabase("ezbrzy","1.0","EzBrzy Database",1000000);
	db.transaction(setupTable,dbErrorHandler,getEntries);
}
//this seems to work with the form for submission
function testSave() {
    $('#editAssignmentForm').submit();
    //alert($('#assignDesc').val());  //<--- this working
    //alert(data.title);	//<---this not working here
}
function onDeviceReady() {
	setupDB();
	displayListing();
	getById('#saveAssignment').addEventListener("touchstart",testSave);
	
//not sure if I need this .live section of code still?
	$("#editAssignmentForm").live("submit",function(e) {
        var data = {title:$("#assignDesc").val(), 
                    body:$("#assignDateDue").val(),
                    id:$("#noteId").val()
        };
        alert(data.title +" : "+data.body);  // <--- this IS working with the testSave submit function above.
//    saveAssignment(data,function() {
//        $.mobile.changePage("#assignments",{reverse:true});
//        });
        });
}

function init() {
    document.addEventListener("deviceready", onDeviceReady, true);
}
