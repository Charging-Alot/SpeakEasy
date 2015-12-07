var fs = require('fs');

module.exports = function (data) {

  data = data.replace(/\r/g, '');
  var regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
  data = data.split(regex);
  data.shift();
  var items = [];
  for (var i = 0; i < data.length; i += 4) {
  	var posText = data[i + 3].trim().replace('\n',' ').replace('\-','');
  	if(posText.includes("(") || posText.includes(")") || posText.includes("]") || posText.includes("[")|| posText.includes("*") || posText.includes("<") || posText.includes(">") || posText.includes("=") || posText.includes("#")) continue; //taking this out because their found in some sort of meta data attrs in srt files. Suck it.
    items.push({
        id: data[i].trim(),
        text: posText
    });	
  }
  return items;
}
// console.log(__dirname)

fs.readFile(__dirname+'/../srtFiles/testy.srt','utf-8', function (err, data) {
  if (err) {
    throw err; 
  }
  buildFile(module.exports(data));
  // console.log(module.exports(data))
});

var appendFile = __dirname+'/../srtFiles/testTextFile.txt';

function buildFile(dataArr){
  var nextLine = '';
  for(var i = 0; i < dataArr.length;i++){
    // var curArrLine = dataArr[i].text.replace("...",".");
    var curArrLine = dataArr[i].text.replace("...",".").replace("-","");
    if(curArrLine.substr(curArrLine.length-1) === "." || curArrLine.substr(curArrLine.length-1) === "!" || curArrLine.substr(curArrLine.length-1) === "?") {
      fs.appendFileSync(appendFile,((nextLine + " " + curArrLine) + '\n'));
      nextLine='';
    }else{
      nextLine = nextLine + " " + curArrLine;
    }
  }
}


// var testFile = [

// {text:"Hello"},
// {text:"I am a line"},
// {text:"and I continue til here."},
// {text:"We are two lines."},
// {text:"We are two lines."},
// ]

// buildFile(testFile)