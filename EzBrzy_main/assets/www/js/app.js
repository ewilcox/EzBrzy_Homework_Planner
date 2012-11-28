var db, data, assignmentCount, courseCount, noteCount;

function dbErrorHandler(err) { alert("DB Error : " + err.message + "\n\nCode=" + err.code); }
function getById(id) { return document.querySelector(id); }
function dbSuccessCB() { alert("db.transaction success"); }
function dbQueryError(err) { alert("DB Query Error: " + err.message); }

function saveAssignment() {
	$('#editAssignmentForm').submit();
	db.transaction(function(tx) {
		tx.executeSql('INSERT INTO assignments (cid, adesc, adue, atime, aocc, arem, anote) VALUES (?,?,?,?,?,?,?)',
				[data.courseId, data.desc, data.due, data.time, data.occ, data.rem, data.note]);
	}, dbErrorHandler);
	$('a[data-icon=delete]').hide();
}
function saveCourse() {
	$('#addCourseForm').submit();
	db.transaction (function (tx) {
		tx.executeSql('INSERT INTO courses (cname, cloc, cdue, ctime, crem, cnote) VALUES (?,?,?,?,?,?)',
				[data.name,data.loc,data.due,data.time,data.rem,data.note]);
	}, dbErrorHandler);
	$('a[data-icon=delete]').hide();
}
function saveNote() {
	$('#addNoteForm').submit();
	db.transaction (function (tx) {
		tx.executeSql('INSERT INTO notes (ndesc, ndue, ntime, nrem, nocc) VALUES (?,?,?,?,?)',
				[data.desc, data.due, data.time, data.rem, data.occ]);
	}, dbErrorHandler);
	$('a[data-icon=delete]').hide();
}
function setupTable(tx) {
	//tx.executeSql("DROP TABLE IF EXISTS assignments");
	//tx.executeSql("DROP TABLE IF EXISTS courses");
	//tx.executeSql("DROP TABLE IF EXISTS notes");
	tx.executeSql('PRAGMA foreign_keys = ON;'); 
	tx.executeSql("CREATE TABLE IF NOT EXISTS courses(cid INTEGER PRIMARY KEY AUTOINCREMENT, cname TEXT NOT NULL, cloc, cdue, ctime, crem, cnote)");
	tx.executeSql("CREATE TABLE IF NOT EXISTS assignments(" +
					"aid INTEGER PRIMARY KEY AUTOINCREMENT, " +
					"cid INTEGER NOT NULL, " +
					"adesc TEXT NOT NULL, " +
					"adue, atime, aocc, arem, " +
					"anote TEXT, " +
					"FOREIGN KEY (cid) REFERENCES courses (cid))");
	tx.executeSql("CREATE TABLE IF NOT EXISTS notes(nid INTEGER PRIMARY KEY AUTOINCREMENT, ndesc TEXT NOT NULL, ndue, ntime, nrem, nocc)");
}

function displayListing (location, results) {
	var output = '';
	output += 'Displaying '+ results.rows.length + ' Item(s)';
	$(location).html(output);
}
//Don't think I need this specific function... keep for reference though.
function renderEntries(tx, results) {
	var i;
	for (i=0; i<results.rows.length; i++) {
		alert(results.rows.item(i).cid);
	}
}
function clearAssignmentFormData() {
	$("#assignDesc").attr('value', 'HW');
	$("#assignCourse").removeAttr('value');
	$("#assignDateDue").removeAttr('value');
	$("#assignTimeDue").removeAttr('value');
	$("#assignOccurance").removeAttr('value');
	$("#assignReminder").removeAttr('value');
	$("#assignInfo").removeAttr('value');
}
function clearCourseFormData() {
	$("#courseName").attr('value', 'My Course');
    $("#courseLoc").removeAttr('value');
    $("#defaultDateDue").removeAttr('value');
    $("#defaultTimeDue").removeAttr('value');
    $("#defaultReminder").removeAttr('value');
    $("#courseNote").removeAttr('value');
}
function clearNoteFormData() {
	$('#noteDesc').html('Miscellaneous');
	$('#noteDateDue').removeAttr('value');
	$('#noteTimeDue').removeAttr('value');
	$('#noteReminder').removeAttr('value');
	$('#noteOccurance').removeAttr('value');
}
function populateAssignmentForm (tx, results) {
	$("#assignDesc").attr('value', results.rows.item(0).adesc);
	$("#assignCourse").attr('value', results.rows.item(0).cid);
	$("#assignDateDue").attr('value', results.rows.item(0).adue);
	$("#assignTimeDue").attr('value', results.rows.item(0).atime);
	$("#assignOccurance").attr('value', results.rows.item(0).aocc);
	$("#assignReminder").attr('value', results.rows.item(0).arem);
	$("#assignInfo").attr('value', results.rows.item(0).anote);
}
function populateCourseForm (tx, results) {
	$("#courseName").attr('value', results.rows.item(0).cname);
    $("#courseLoc").attr('value', results.rows.item(0).cloc);
    $("#defaultDateDue").attr('value', results.rows.item(0).cdue);
    $("#defaultTimeDue").attr('value', results.rows.item(0).ctime);
    $("#defaultReminder").attr('value', results.rows.item(0).crem);
    $("#courseNote").attr('value', results.rows.item(0).cnote);
}
function populateNoteForm (tx, results) {
	$('#noteDesc').html(results.rows.item(0).ndesc);
	$('#noteDateDue').attr('value', results.rows.item(0).ndue);
	$('#noteTimeDue').attr('value', results.rows.item(0).ntime);
	$('#noteReminder').attr('value', results.rows.item(0).nrem);
	$('#noteOccurance').attr('value', results.rows.item(0).nocc);
}
function editAssignment (assignment) {
	db.transaction (function (tx) {
		tx.executeSql('SELECT * FROM assignments JOIN courses ON assignments.cid = courses.cid', [], populateAssignmentForm, dbQueryError);
	}, dbErrorHandler);
	$('a[data-icon=delete]').show();
}
function editCourse (course) {
	db.transaction (function (tx) {
		tx.executeSql('SELECT * FROM courses WHERE cid = ' + course.id, [], populateCourseForm, dbQueryError);
	}, dbErrorHandler);
	$('a[data-icon=delete]').show();
}
function editNote (note) {
	db.transaction (function (tx) {
		tx.executeSql('SELECT * FROM notes', [], populateNoteForm, dbQueryError);
	}, dbErrorHandler);
	$('a[data-icon=delete]').show();
}
function populateAssignments (tx, results) {
	displayListing('#assignmentsDisplay', results);
	assignmentCount = results.rows.length;
	var i, output = '';
	if (results.rows.length === 0) {
		output = '<h3>No Current Assignments</h3>';
	} else {
		for (i=0; i<results.rows.length; i++) {			
			output += '<li><a href="#addAssignment" data-role="button" id="'+ results.rows.item(i).aid +'" onclick="editAssignment(this);">'+ results.rows.item(i).adesc + ' - ' + 
						results.rows.item(i).cname + '</a></li>';
		}
	}
	$('#assignmentData').html(output).listview('refresh');
}
function populateCourses (tx, results) {
	displayListing('#coursesDisplay', results);
	courseCount = results.rows.length;
	var i, output = '';
	if (results.rows.length === 0) {
		output = '<h3>No Current Courses</h3>';
	} else {
		for (i=0; i<results.rows.length; i++) {
			output += '<li><a href="#addCourse" data-role="button" id="'+ results.rows.item(i).cid +'" onclick="editCourse(this);">'+ results.rows.item(i).cname +'</a></li>';
		}
	}
	$('#courseData').html(output).listview('refresh');
}
function gotoAssignments (assignment) {
	//$.mobile.changePage("#addAssignment");
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM courses WHERE cid = " + assignment.id, [], function (tx, results) {
			$('#showClass').html('Add New Assignment - ' + results.rows.item(0).cname);
			$('#assignCourse').attr('value', results.rows.item(0).cid);
		}, dbQueryError);
	}, dbErrorHandler);
	//alert(assignment.getAttribute("data"));  //<-- this works, providing there is a 'data' attribute to the tag!
}
function populateChooseCourses (tx, results) {
	var i, output = '';
	if (results.rows.length === 0) {
		output = '<h3>No Current Courses</h3>';
	} else {
		for (i=0; i<results.rows.length; i++) {
			output += '<li><a href="#addAssignment" data-role="button" id="'+ results.rows.item(i).cid +'" onclick="gotoAssignments(this);">'+ results.rows.item(i).cname +'</a></li>';
		}
	}
	$('#chooseCourseData').html(output).listview('refresh');
}
function populateNotes (tx, results) {
	displayListing('#notesDisplay', results);
	noteCount = results.rows.length;
	var output = '',
	i, count;
	count = results.rows.length;
	if (count === 0) {
		output = '<h3>No Current Notes</h3>';
	} else {
		for (i=0; i<results.rows.length; i++) {
			output += '<li><a href="#addnote" data-role="button" id="'+ results.rows.item(i).nid +'" onclick="editNote(this);">'+ results.rows.item(i).ndesc +'</a></li>';
		}
	}
	$('#noteData').html(output).listview('refresh');
}
function getDisplays() {
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM assignments JOIN courses ON assignments.cid = courses.cid", [], populateAssignments, dbQueryError);
		tx.executeSql("SELECT * FROM courses", [], populateCourses, dbQueryError);
		tx.executeSql("SELECT * FROM courses", [], populateChooseCourses, dbQueryError);
		tx.executeSql("SELECT * FROM notes", [], populateNotes, dbQueryError);
	}, dbErrorHandler);
}
function setupDB() {
	//window.deleteFile("ezbrzy");
	db = window.openDatabase("ezbrzy2","1.0","EzBrzy_Database",1000000);
	db.transaction(setupTable, dbErrorHandler);
}
function onDeviceReady() {
	setupDB();
	getDisplays();
	getById('#saveAssignment').addEventListener("click",saveAssignment);
	getById('#saveCourse').addEventListener("click",saveCourse);
	getById('#saveNote').addEventListener("click",saveNote);
	$('a[data-icon=delete]').hide();
	
	$("#editAssignmentForm").live("submit",function(e) {
		data = {desc:$("#assignDesc").val(),
				courseId:$("#assignCourse").val(),
				due:$("#assignDateDue").val(),
				time:$("#assignTimeDue").val(),
				occ:$("#assignOccurance").val(),
				rem:$("#assignReminder").val(),
				note:$("#assignInfo").val()
        };
        //reset all the values
		clearAssignmentFormData();
        $('#editAssignmentForm').each (function(){this.reset();});
	});
	$("#addCourseForm").live("submit",function(e) {
        data = {name:$("#courseName").val(), 
                loc:$("#courseLoc").val(),
                due:$("#defaultDateDue").val(),
                time:$("#defaultTimeDue").val(),
                rem:$("#defaultReminder").val(),
                note:$("#courseNote").val()
        };
        //reset all the values
        clearCourseFormData();
        $('#addCourseForm').each (function(){this.reset();});
	});
	$('#addNoteForm').live('submit', function (e) {
		data = {desc:$('#noteDesc').val(),
				due:$('#noteDateDue').val(),
				time:$('#noteTimeDue').val(),
				rem:$('#noteReminder').val(),
				occ:$('#noteOccurance').val()
		};
		//reset all the values
		clearNoteFormData();
		$('#addNoteForm').each (function(){this.reset();});
	});
	
	$('.mainPage').live('pagebeforeshow', getDisplays);
	$('#chooseCourse').live('pagebeforeshow', getDisplays);
	
	$('.historyBack').live('tap',function() {
		$('#editAssignmentForm').each (function(){ this.reset(); });
		$('#addCourseForm').each (function(){this.reset();});
		$('#addNoteForm').each (function(){this.reset();});
		$('a[data-icon=delete]').hide();
		clearAssignmentFormData();
		clearCourseFormData();
		clearNoteFormData();
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
			display: 'modal',
			mode: 'scroller',
			dateOrder: 'mmD ddyy'
		});
		$('#assignDateDue').click( function() {
			$('.dateScroller').scroller('show');
			return false;
		});
		$('#noteDateDue').click(function(){
			$('.dateScroller').scroller('show'); 
			return false;
		});
		$('#defaultDateDue').click(function(){
			$('.dateScroller').scroller('show'); 
			return false;
		});
	});
	
	//time picker function
	$(function(){
	    $('.timeScroller').scroller({
	        preset: 'time',
	        theme: 'default',
	        display: 'modal',
	        mode: 'scroller'
	    });
	    
	    $('#assignTimeDue').click(function(){
	        $('.timeScroller').scroller('show'); 
	        return false;
	    });
	    $('#noteTimeDue').click(function(){
	        $('.timeScroller').scroller('show'); 
	        return false;
	    });
	    $('#defaultTimeDue').click(function(){
	        $('.timeScroller').scroller('show'); 
	        return false;
	    });    
	});
	
	//occurance picker
	$(function(){
	    $('.occurScroller').scroller({
	        preset: 'select',
	        theme: 'default',
	        display: 'modal',
	        mode: 'scroller',
	        inputClass: 'i-txt'
	    });
	    $('#aOccurance').click(function(){
	        $('.occurScroller').scroller('show'); 
	        return false;
	    });
	    $('#nOccurance').click(function(){
	        $('.occurScroller').scroller('show'); 
	        return false;
	    }); 
	
	});
	
//function for setting default values
	
	$(function() {
	    $('.defaults')
		.focus(function() {
			var $this = $(this);
			if (!$this.data('default')) { 
				$this.data('default', $this.val());}
			if ($this.val() === $this.data('default')) {
				$this.val('')
				.css('color', '#ffffff');
			}
		})
		.blur(function() {
			var $this = $(this);
			if ($this.val() === '') {
				$(this).val($this.data('default'))
				.css('color', '#999999');
			}
		})
		.css('color', '#999999');
	});
	
//the delete button

	$("#yesDelete").click(function(){alert("delete has been selected");});

	$("#noDelete").click(function(){
		history.back();
		return false;
	});
}

function init() {
    document.addEventListener("deviceready", onDeviceReady, true);
}
