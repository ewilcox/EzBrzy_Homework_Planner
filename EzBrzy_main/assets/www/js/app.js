var db, data, assignmentCount, courseCount, noteCount;

function dbErrorHandler(err) { alert("DB Error : " + err.message + "\n\nCode=" + err.code); }
function getById(id) { return document.querySelector(id); }
function dbSuccessCB() { alert("db.transaction success"); }		// generic callback, still needed?  probably take this out.
function dbQueryError(err) { alert("DB Query Error: " + err.message); }

function saveAssignment() {  // took (data,cb) out of parameter list
	$('#editAssignmentForm').submit();
//	db.transaction(function(tx) {
//		var id = assignmentCount+1,
//			name = "test",
//			loc = "none",
//			due = "some date",
//			time = "some time",
//			rem = "none",
//			note = "none";
//		tx.executeSql('INSERT INTO courses (cid, cname, cloc, cdue, ctime, crem, cnote) VALUES (?,?,?,?,?,?,?)',[id,name,loc,due,time,rem,note]);
//	}, dbErrorHandler, dbSuccessCB);
	
	// old function, originally used as a framework for above code
//    if(data.title === "") { data.title = "[No Title]"; }
//    db.transaction(function(tx) {
//        if(data.id === "") { tx.executeSql("insert into notes(title,body,updated) values(?,?,?)",[data.title,data.body, new Date()]); }
//        else { tx.executeSql("update notes set title=?, body=?, updated=? where id=?",[data.title,data.body, new Date(), data.id]); }
//    }, dbErrorHandler,dbSuccessCB);
//    alert(data.title);
    //getEntries();
}
function saveCourse() {
	$('#addCourseForm').submit();
	db.transaction (function (tx) {
		tx.executeSql('INSERT INTO courses (cid, cname, cloc, cdue, ctime, crem, cnote) VALUES (?,?,?,?,?,?,?)',
				[courseCount+1,data.name,data.loc,data.due,data.time,data.rem,data.note]);
	}, dbErrorHandler);
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
function populateAssignments (tx, results) {
	displayListing('#assignmentsDisplay', results);
	//fill in output and .html to index.html correct location
}
function populateCourses (tx, results) {
	displayListing('#coursesDisplay', results);
	var output = '',
		i;
	for (i=0; i<results.rows.length; i++) {
		alert(results.rows.item(i).cid);
	}
	
}
function populateNotes (tx, results) {
	displayListing('#notesDisplay', results);
	//fill in output and .html to index.html correct location
}
function getDisplays() {
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM assignments", [], populateAssignments, dbQueryError);
		tx.executeSql("SELECT * FROM courses", [], populateCourses, dbQueryError);
		tx.executeSql("SELECT * FROM notes", [], populateNotes, dbQueryError);
	}, dbErrorHandler);
}
function setupDB() {
	db = window.openDatabase("ezbrzy","1.0","EzBrzy Database",1000000);
	db.transaction(setupTable, dbErrorHandler);
}
//this function will go away --  use saveAssignment instead
function doSave() {
	$('#editAssignmentForm').submit();
	//saveAssignment();
	
	//alert(data.title);  //seems to display data in form correctly.
	//alert($('#assignDesc').val());  //<--- this working
}
function onDeviceReady() {
	setupDB();
	getDisplays();
	getById('#saveAssignment').addEventListener("click",saveAssignment);
	getById('#saveCourse').addEventListener("click",saveCourse);
	
	$("#editAssignmentForm").live("submit",function(e) {
        data = {desc:$("#assignDesc").val(), 
                due:$("#assignDateDue").val(),
                time:$("#assignTimeDue").val()
        };
	});
	$("#addCourseForm").live("submit",function(e) {
        data = {name:$("#courseName").val(), 
                loc:$("#courseLoc").val(),
                due:$("#defaultDateDue").val(),
                time:$("#defaultTimeDue").val(),
                rem:$("#defaultReminder").val(),
                note:$("#courseNote").val()
        };
	});
	
	$('.mainPage').live('pageshow', function () {
		getDisplays();
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
	
	//function for default values
	
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

}

function init() {
    document.addEventListener("deviceready", onDeviceReady, true);
}
