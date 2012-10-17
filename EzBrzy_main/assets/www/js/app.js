var fileSystem;

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
    getById("#content").innerHTML = "<h2>Error</h2>"+e.toString();
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

function onFSSuccess(fs) {
	writeData();
/*	
    fileSystem = fs;
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