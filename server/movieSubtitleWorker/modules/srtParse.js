var fs=require('fs');

module.exports = {
	parseTheDamnFile: function (data) {

    data = data.replace(/\r/g, '');
    var regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
    data = data.split(regex);
    data.shift();
    var items = [];
    for (var i = 0; i < data.length; i += 4) {
    	var posText = data[i + 3].trim().replace('\n',' ').replace('\-','');
    	if(posText.includes("*") || posText.includes("<") || posText.includes(">") || posText.includes("=") || posText.includes("#")) continue; //taking this out because their found in some sort of meta data attrs in srt files. Suck it.
      items.push({
          id: data[i].trim(),
          text: posText
      });	
    }
    return items;
	}
	
}
