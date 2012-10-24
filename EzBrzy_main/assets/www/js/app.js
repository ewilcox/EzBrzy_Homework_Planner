var fileSystem,
	dbShell;

function onDeviceReady() {

    //request the persistent file system
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSSuccess, onError);
  }

function init() {
    document.addEventListener("deviceready", onDeviceReady, true);
}

//generic getById
function getById(id) {
    return document.querySelector(id);
}
//generic content logger
function logit(s) {
    getById("#content").innerHTML = s;
}

//generic error handler
function onError(e) {
    alert("Error: "+e.toString());
	//getById("#content").innerHTML = "<h2>Error</h2>"+e.toString();
 }

function doDeleteFile(e) {
    fileSystem.root.getFile("test.txt", {create:true}, function(f) {
        f.remove(function() {
            logit("File removed<p/>");
        });
    }, onError);
}

function metadataFile(m) {
    logit("File was last modified "+m.modificationTime+"<p/>");    
}

function doMetadataFile(e) {
    fileSystem.root.getFile("test.txt", {create:true}, function(f) {
        f.getMetadata(metadataFile,onError);
    }, onError);
}

function readFile(f) {
    reader = new FileReader();
    reader.onloadend = function(e) {
        console.log("go to end");
        logit("<pre>" + e.target.result + "</pre><p/>");
    }
    reader.readAsText(f);
}

function doReadFile(e) {
    fileSystem.root.getFile("test.txt", {create:true}, readFile, onError);
}

function appendFile(f) {
    f.createWriter(function(writerOb) {
        writerOb.onwrite=function() {
            logit("Done writing to file.<p/>");
        }
        //go to the end of the file...
        writerOb.seek(writerOb.length);
        writerOb.write("Test at "+new Date().toString() + "\n");
    })
}

function doAppendFile(e) {
    fileSystem.root.getFile("test.txt", {create:true}, appendFile, onError);
}

function gotFiles(entries) {
    var s = "";
    for(var i=0,len=entries.length; i<len; i++) {
        //entry objects include: isFile, isDirectory, name, fullPath
        s+= entries[i].fullPath;
        if (entries[i].isFile) {
            s += " [F]";
        }
        else {
            s += " [D]";
        }
        s += " ";
        
    }
    s+="<p/>";
    logit(s);
}

function doDirectoryListing(e) {
    //get a directory reader from our FS
    var dirReader = fileSystem.root.createReader();

    dirReader.readEntries(gotFiles,onError);        
}

function alertData(f){
	f.createWriter(function(writerOb) {
       writerOb.onwrite=function() {
            alert("Wrote to the file!");
       }
        //go to the end of the file...
       writerOb.seek(writerOb.length);
       writerOb.write("I wrote some new test data!\n");
   })
}

function doAlertData(e) {
		fileSystem.root.getFile("test.txt", {create:true}, alertData, onError);
}
function doSaveNote() {
	fileSystem.root.getFile("notes.txt", {create:true}, saveNote, onError);
}
function saveNote(f) {
	var ref = "#";
    f.createWriter(function(writerOb) {
        writerOb.onwrite=function() {
        	doReadNotes();
        }
        //go to the end of the file...
        writerOb.seek(writerOb.length);
        writerOb.write('<li><a href="' + ref + '">Test at ' + new Date().toString() + '</a></li>');
    })
}
function doDeleteNotes(e) {
    fileSystem.root.getFile("notes.txt", {create:true}, function(f) {
        f.remove(function() {
            doReadNotes();
            alert("Notes file deleted");
        });
    }, onError);
}
function doReadNotes() {
	fileSystem.root.getFile("notes.txt", {create:true}, readNote, onError);
}
function readNote(f) {
    reader = new FileReader();
    reader.onloadend = function(e) {
        logNote("<pre>" + e.target.result + "</pre>");
    }
    reader.readAsText(f);
}
function logNote(data) {
	//var output = '<li>' + data + '</li>';
    $('#noteContent ul').html(data).listview('refresh');
	//this works too-->//getById("#noteContent ul").innerHTML = data;
}
function doLog(data) {
	//console.log(data);
}
function renderEntries(tx,results) {
	//doLog("render entries");
	var $content = $('#assignmentContent'),
		id = results.rows.item(i).id,
		title = results.rows.item(i).title;
	if (results.rows.length == 0) { $content.html('<p>You do not have any notes currently</p>'); }
	else {
		var s = '';
		for (var i=0; i<results.rows.length; i++) {
			s += '<li><a href="#addAssignment" data-role="button" data-transition="none" data-direction="reverse">' + id + " - " + title + '</a></li>';
//			s += "<li><a href='edit.html?id="+results.rows.item(i).id + "'>" + results.rows.item(i).title + "</a></li>"; //pick up here!!
		}
		$content.html(s)
			.listview('refresh');
	}
}
function saveAssignment(note,cb) {
    if(note.title == "") note.title = "[No Title]";
    dbShell.transaction(function(tx) {
        if(note.id == "") tx.executeSql("insert into notes(title,body,updated) values(?,?,?)",[note.title,note.body, new Date()]);
        else tx.executeSql("update notes set title=?, body=?, updated=? where id=?",[note.title,note.body, new Date(), note.id]);
    }, dbErrorHandler,cb);
    getEntries();
}
function getEntries() {
	dbShell.transaction(function(tx) {
		tx.executeSql("select id, title, body, updated from notes order by updated desc",[],renderEntries,dbErrorHandler);
	}, dbErrorHandler);
}
function dbErrorHandler(err) {
	alert("DB Error : " + err.message + "\n\nCode=" + err.code);
}
function setupTable(tx) {
	tx.executeSql("CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY,title,body,updated)");
	alert("setup table done");
}
function onFSSuccess(fs) {
    fileSystem = fs;
	displayListing();
	//writeData();
	getById("#saveNote").addEventListener("touchstart",doSaveNote);
	getById("#deleteNotes").addEventListener("touchstart",doDeleteNotes);
	getById('#saveAssignment').addEventListener("touchstart",saveAssignment);
	
    dbShell = window.openDatabase("ezbrzy_db","1.0","EzBrzy Database",1000000);
    dbShell.transaction(setupTable,dbErrorHandler,getEntries);
/*	
    getById("#dirListingButton").addEventListener("touchstart",doDirectoryListing);            
    getById("#addFileButton").addEventListener("touchstart",doAppendFile);            
    getById("#readFileButton").addEventListener("touchstart",doReadFile);            
    getById("#metadataFileButton").addEventListener("touchstart",doMetadataFile);            
    getById("#deleteFileButton").addEventListener("touchstart",doDeleteFile);            
    getById("#addAlertData").addEventListener("touchstart",doAlertData);
    
    logit( "Got the file system: "+fileSystem.name +" " +
                                    "root entry name is "+fileSystem.root.name + "<p/>")    
    doDirectoryListing();
*/
}

function writeData() {
	var output="";
	for (i=0; i<20; i++) output += "<p>test data ... "+ i + "</p>";
	$("#testData").html(output);
}

// TODO: calculate numbers!
function displayListing() {
	var outputAssign='', outputCourses='', outputNotes='', 
		numAssignments = 0, numCourses=0, numNotes=0;
	outputAssign += 'Displaying '+ numAssignments + ' Assignment(s)';
	outputCourses += 'Displaying '+ numCourses + ' Course(s)';
	outputNotes += 'Displaying '+ numNotes + ' Note(s)';
	$('#assignmentsDisplay').html(outputAssign);
	$('#coursesDisplay').html(outputCourses);
	$('#notesDisplay').html(outputNotes);
	doReadNotes();
	// Not working --> //$('#noteContent ul li').listview('refresh');
	//try {
	//    $('#noteContent ul').listview('refresh');
	//} catch(e) {
	//     $('#noteContent ul').listview();
	//}
}