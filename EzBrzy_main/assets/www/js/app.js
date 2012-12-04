var db, data, assignmentCount, courseCount, noteCount, courseMatch;

function dbErrorHandler(err) { alert("DB Error : " + err.message + "\n\nCode=" + err.code); }
function getById(id) { return document.querySelector(id); }
function dbSuccessCB() { alert("db.transaction success"); }
function dbQueryError(err) { alert("DB Query Error: " + err.message); }
function dbQueryLinkError (err) { alert("Delete Related Assignments before you can delete the course!"); }
function backToEditNotes() { $.mobile.changePage('#addnote'); }
function backToEditCourses() { $.mobile.changePage('#addCourse'); }
function bactToEditAssignments() { $.mobile.changePage('#addAssignment'); }

function saveAssignment() {
	var $update = $('#assignUpdate').attr('value');
	$form=$('#editAssignmentForm');
	$form.validate({
		  rules: {
			  assignDesc: {
		      required: false,
		      maxlength: 50,
		      regex: /^[A-Za-z\s\d@|^_+*!.,:~`?=%-]+$/
		    },
		      assignDateDue:{
		      maxlength: 10
		    },
		      assignTimeDue:{
		      maxlength: 10
		    },
		      assignInfo:{
		      maxlength: 100,
		      regex: /^[A-Za-z\s\d@|^_+*!.,:~`?=%-]+$/ 
		      }
		  }
	});
	if($form.valid()){
	   $form.submit();
		db.transaction(function(tx) {
			if ($update === 'false') {
				tx.executeSql('INSERT INTO assignments (cid, adesc, adue, atime, aocc, arem, anote) VALUES (?,?,?,?,?,?,?)',
						[data.courseId, data.desc, data.due, data.time, data.occ, data.rem, data.note]);
			} else {
				tx.executeSql('UPDATE assignments SET cid=?, adesc=?, adue=?, atime=?, aocc=?, arem=?, anote=? WHERE aid=?',
						[data.courseId, data.desc, data.due, data.time, data.occ, data.rem, data.note, data.id]);
			}
		}, dbErrorHandler);
		$('a[data-icon=delete]').hide();
	}else{
		navigator.notification.alert(
				'Please use only valid characters.',	// message
				bactToEditAssignments,					// callback
				'Invalid Characters',	// title
				'Ok'					// buttonName
		);	
	}
}
function saveCourse() {
	var $update = $('#courseUpdate').attr('value');
	$form=$('#addCourseForm');
	$form.validate({
		  rules: {
			  courseName: {
		      required: false,
		      maxlength: 25,
		      regex: /^[A-Za-z\s\d@|^_+*!.,:~`?=%-]+$/
		    },
		      courseLoc:{
		      maxlength: 50,
		      regex: /^[A-Za-z\s\d@|^_+*!.,:~`?=%-]+$/   	
		    },
		      defaultDateDue:{
		      maxlength: 10
		    },
		      defaultTimeDue:{
		      maxlength: 10
		    },
		      courseNote:{
		      maxlength: 100,
		      regex: /^[A-Za-z\s\d@|^_+*!.,:~`?=%-]+$/ 
		      }
		  }
	});
	if($form.valid()){
		$form.submit();
		db.transaction (function (tx) {
			if ($update === 'false') {
				tx.executeSql('INSERT INTO courses (cname, cloc, cdue, ctime, crem, cnote) VALUES (?,?,?,?,?,?)',
						[data.name, data.loc, data.due, data.time, data.rem, data.note]);
			} else {
				tx.executeSql('UPDATE courses SET cname=?, cloc=?, cdue=?, ctime=?, crem=?, cnote=? WHERE cid=?',
						[data.name, data.loc, data.due, data.time, data.rem, data.note, data.id]);
			}
		}, dbErrorHandler);
		$('a[data-icon=delete]').hide();
	}else{
		navigator.notification.alert(
				'Please use only valid characters.',	// message
				backToEditCourses,					// callback
				'Invalid Characters',	// title
				'Ok'					// buttonName
		);	
	}
}
function saveNote() {
	var $update = $('#noteUpdate').attr('value');
	$form = $('#addNoteForm');
	$form.validate({
		  rules: {
			  noteDesc: {
		      required: false,
		      maxlength: 100,
		      regex: /^[A-Za-z\s\d@|^_+*!.,:~`?=%-]+$/
		    },
		    noteDateDue:{maxlength: 10},
		    noteTimeDue:{maxlength: 10}
		  }
	});
//	alert("Valid: " + $("#addNoteForm").valid());
	if ($form.valid()) {
		$form.submit();
		db.transaction (function (tx) {
			if ($update === 'false') {
				tx.executeSql('INSERT INTO notes (ndesc, ndue, ntime, nrem, nocc) VALUES (?,?,?,?,?)',
						[data.desc, data.due, data.time, data.rem, data.occ]);
			} else {
				tx.executeSql('UPDATE notes SET ndesc=?, ndue=?, ntime=?, nrem=?, nocc=? WHERE nid=?',
						[data.desc, data.due, data.time, data.rem, data.occ, data.id]);
			}
		}, dbErrorHandler);
		$('a[data-icon=delete]').hide();
	} else {
		navigator.notification.alert(
				'Please use only valid characters.',	// message
				backToEditNotes,					// callback
				'Invalid Characters',	// title
				'Ok'					// buttonName
		);
	}
}
function showDelete() {
	$('a[data-icon=delete]').show();
}
function setupTable(tx) {
	//tx.executeSql("DROP TABLE IF EXISTS assignments");
	//tx.executeSql("DROP TABLE IF EXISTS courses");
	//tx.executeSql("DROP TABLE IF EXISTS notes");
	//tx.executeSql('PRAGMA foreign_keys = ON;');    Throws 'not authorized' error
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
//Don't need this function... keep for reference though.
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
	$("#assignInfo").removeAttr('value');
	$delete = $(".yesDelete");
	$delete.removeAttr('value');
	$delete.removeAttr('src');
	$('#assignUpdate').attr('value', 'false');
}
function clearCourseFormData() {
	$("#courseName").attr('value', 'My Course');
    $("#courseLoc").removeAttr('value');
    $("#defaultDateDue").removeAttr('value');
    $("#defaultTimeDue").removeAttr('value');
    $("#courseNote").removeAttr('value');
	$delete = $(".yesDelete");
	$delete.removeAttr('value');
	$delete.removeAttr('src');
	$('#courseUpdate').attr('value', 'false');
}
function clearNoteFormData() {
	$('#noteDesc').html('Miscellaneous');
	$('#noteDateDue').removeAttr('value');
	$('#noteTimeDue').removeAttr('value');
	$delete = $(".yesDelete");
	$delete.removeAttr('value');
	$delete.removeAttr('src');
	$('#noteUpdate').attr('value', 'false');
}
function populateAssignmentForm (tx, results) {
	$(".yesDelete").attr({ 
		  src: "assignment",
		  value: results.rows.item(0).aid
		});
	$('#showClass').html('Assignment - ' + results.rows.item(0).cname);
	$("#assignDesc").attr('value', results.rows.item(0).adesc);
	$("#assignCourse").attr('value', results.rows.item(0).cid);
	$("#assignDateDue").attr('value', results.rows.item(0).adue);
	$("#assignTimeDue").attr('value', results.rows.item(0).atime);
	$("#assignInfo").attr('value', results.rows.item(0).anote);
	$('#assignUpdate').attr('value', results.rows.item(0).aid);
}
function populateCourseForm (tx, results) {
	$(".yesDelete").attr({ 
		  src: "course",
		  value: results.rows.item(0).cid
		});
	$('#showCourse').html('Course - ' + results.rows.item(0).cname);
	$("#courseName").attr('value', results.rows.item(0).cname);
    $("#courseLoc").attr('value', results.rows.item(0).cloc);
    $("#defaultDateDue").attr('value', results.rows.item(0).cdue);
    $("#defaultTimeDue").attr('value', results.rows.item(0).ctime);
    $("#courseNote").attr('value', results.rows.item(0).cnote);
    $('#courseUpdate').attr('value', results.rows.item(0).cid);
}
function populateNoteForm (tx, results) {
	$(".yesDelete").attr({ 
		  src: "note",
		  value: results.rows.item(0).nid
		});
	$('#showNote').html('Edit Note');
	$('#noteDesc').html(results.rows.item(0).ndesc);
	$('#noteDateDue').attr('value', results.rows.item(0).ndue);
	$('#noteTimeDue').attr('value', results.rows.item(0).ntime);
	$('#noteUpdate').attr('value', results.rows.item(0).nid);
}
function editAssignment (assignment) {
	db.transaction (function (tx) {
		tx.executeSql('SELECT * FROM assignments JOIN courses ON assignments.cid = courses.cid WHERE aid = ' + assignment.id, [], populateAssignmentForm, dbQueryError);
	}, dbErrorHandler, showDelete);
}
function editCourse (course) {
	db.transaction (function (tx) {
		tx.executeSql('SELECT * FROM courses WHERE cid = ' + course.id, [], populateCourseForm, dbQueryError);
	}, dbErrorHandler, showDelete);
}
function editNote (note) {
	db.transaction (function (tx) {
		tx.executeSql('SELECT * FROM notes WHERE nid = ' + note.id, [], populateNoteForm, dbQueryError);
	}, dbErrorHandler, showDelete);
}
function populateAssignments (tx, results) {
	displayListing('#assignmentsDisplay', results);
	assignmentCount = results.rows.length;
	var i, output = '';
	if (results.rows.length === 0) {
		output = '<h3>No Current Assignments</h3>';
	} else {
		for (i=0; i<results.rows.length; i++) {			
			output += '<li><a href="#addAssignment" data-role="button" id="'+ results.rows.item(i).aid +'" onclick="editAssignment(this);">'+ results.rows.item(i).cname + ' - ' + 
			results.rows.item(i).adesc + '</a></li>';
		}
	}
	$('#assignmentData:visible').html(output).listview('refresh');
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
	$('#courseData:visible').html(output).listview('refresh');
}
function gotoAssignments (assignment) {
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM courses WHERE cid = " + assignment.id, [], function (tx, results) {
			$('#showClass').html('Assignment - ' + results.rows.item(0).cname);
			$('#assignCourse').attr('value', results.rows.item(0).cid);
			$('#assignDateDue').attr('value', results.rows.item(0).cdue);
			$('#assignTimeDue').attr('value', results.rows.item(0).ctime);
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
	$('#chooseCourseData:visible').html(output).listview('refresh');
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
	$('#noteData:visible').html(output).listview('refresh');
}
function deleteNote(id) {
	db.transaction(function(tx) {
		tx.executeSql('DELETE FROM notes WHERE nid=?', [id], null, dbQueryError);
	});
	$.mobile.changePage('#notes');
	clearNoteFormData();
}
function deleteAlert (tx, results) {
	if (results.rows.length > 0) {
		navigator.notification.alert(
				'Delete course assignments first!',	// message
				null,				// callback
				'Delete Error',		// title
				'Ok'				// buttonName
		);
	} else {
		tx.executeSql('DELETE FROM courses WHERE cid=?', [courseMatch], null, dbQueryLinkError);
	}
}
function deleteCourse(id) {
	courseMatch = id;
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM assignments JOIN courses ON assignments.cid = courses.cid WHERE courses.cid=?',[id], deleteAlert, dbQueryError);
	}, dbErrorHandler);
	$.mobile.changePage('#courses');
	clearCourseFormData();
}
function deleteAssignment(id) {
	db.transaction(function(tx) {
		tx.executeSql('DELETE FROM assignments WHERE aid=?', [id], null, dbQueryError);
	});
	$.mobile.changePage('#assignments');
	clearAssignmentFormData();
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
	db = window.openDatabase("ezbrzy","1.0","EzBrzy_Database",1000000);
	db.transaction(setupTable, dbErrorHandler);
}
function clearData() {
	clearAssignmentFormData();
	clearCourseFormData();
	clearNoteFormData();
	$('#editAssignmentForm').each (function(){ this.reset(); });
	$('#addCourseForm').each (function(){this.reset();});
	$('#addNoteForm').each (function(){this.reset();});
	$('a[data-icon=delete]').hide();
	navigator.app.backHistory();
}
function onDeviceReady() {
	setupDB();
	getDisplays();
	getById('#saveAssignment').addEventListener("click",saveAssignment);
	getById('#saveCourse').addEventListener("click",saveCourse);
	getById('#saveNote').addEventListener("click",saveNote);
	document.addEventListener("backbutton", clearData, false);
	$('a[data-icon=delete]').hide();
	
	$("#editAssignmentForm").live("submit",function(e) {
		data = {desc:$("#assignDesc").val(),
				courseId:$("#assignCourse").val(),
				due:$("#assignDateDue").val(),
				time:$("#assignTimeDue").val(),
				note:$("#assignInfo").val(),
				id:$('#assignUpdate').val()
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
                note:$("#courseNote").val(),
                id:$('#courseUpdate').val()
        };
        //reset all the values
        clearCourseFormData();
        $('#addCourseForm').each (function(){this.reset();});
	});
	$('#addNoteForm').live('submit', function (e) {
		data = {desc:$('#noteDesc').val(),
				due:$('#noteDateDue').val(),
				time:$('#noteTimeDue').val(),
				id:$('#noteUpdate').val()
		};
		//reset all the values
		clearNoteFormData();
		$('#addNoteForm').each (function(){this.reset();});
	});
	
	$('.mainPage').live('pageshow', getDisplays);
	$('#chooseCourse').live('pagebeforeshow', getDisplays);
	
	$('.clearForm').live('click', function() {
		clearAssignmentFormData();
		clearCourseFormData();
		clearNoteFormData();
		$('#editAssignmentForm').each (function(){ this.reset(); });
		$('#addCourseForm').each (function(){this.reset();});
		$('#addNoteForm').each (function(){this.reset();});
		$('a[data-icon=delete]').hide();
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
	$.validator.addMethod(
		    "regex",
		    function(value, element, regexp) {
		        var check = false;
		        var re = new RegExp(regexp);
		        return this.optional(element) || re.test(value);
		    },
		    "No special Characters allowed (' ' \" # $ & ( ) _ / < > { } )"
		);
	
//the delete button
	$(".yesDelete").click(function() {
		if (this.getAttribute('src')==='note') { deleteNote(this.value); }
		else if (this.getAttribute('src')==='course') { deleteCourse(this.value); }
		else if (this.getAttribute('src')==='assignment') { deleteAssignment(this.value); }
		else { alert('Error \nDelete not bound to any data!'); }
	});

	$(".noDelete").click(function(){
		history.back();
		return false;
	});
}

function init() {
    document.addEventListener("deviceready", onDeviceReady, true);
}
