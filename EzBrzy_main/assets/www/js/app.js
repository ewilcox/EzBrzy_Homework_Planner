var dbShell;

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
	dbShell.transaction(function(tx) {
		tx.executeSql("select id, title, body, updated from notes order by updated desc",[],renderEntries,dbErrorHandler);
	}, dbErrorHandler);
}

function saveAssignment(note,cb) {
    if(note.title === "") { note.title = "[No Title]"; }
    dbShell.transaction(function(tx) {
        if(note.id === "") { tx.executeSql("insert into notes(title,body,updated) values(?,?,?)",[note.title,note.body, new Date()]); }
        else { tx.executeSql("update notes set title=?, body=?, updated=? where id=?",[note.title,note.body, new Date(), note.id]); }
    }, dbErrorHandler,cb);
    getEntries();
}

function setupTable(tx) {
	tx.executeSql("CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY,title,body,updated)");
	//alert("setup table done");
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
	dbShell = window.openDatabase("ezbrzy","1.0","EzBrzy Database",1000000);
	dbShell.transaction(setupTable,dbErrorHandler,getEntries);
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
//	getById("#saveNote").addEventListener("touchstart",doSaveNote);
//	getById("#deleteNotes").addEventListener("touchstart",doDeleteNotes);
//	getById('#saveAssignment').addEventListener("touchstart",saveAssignment);
	getById('#saveAssignment').addEventListener("touchstart",testSave);
	
//	testing form submit linking outside of form
//	$("#editAssignmentForm").focus(function () {
//		alert("form fired");
//	});
	
//not sure if I need this .live section of code still?
	$("#editAssignmentForm").live("submit",function(e) {
        var data = {title:$("#assignDesc").val(), 
                    body:$("#assignDateDue").val(),
                    id:$("#noteId").val()
        };
        alert(data.title);  // <--- this IS working with the testSave submit function above.
    saveAssignment(data,function() {
        $.mobile.changePage("#assignments",{reverse:true});
        });
    });
}

function init() {
    document.addEventListener("deviceready", onDeviceReady, true);
}
