var request = require('request');
var cheerio = require('cheerio');
var srtParser = require('./srtParse.js');
var AdmZip = require('adm-zip');
var fs = require("fs");
var rsync = require("sync-request");

var subtitleWorldPrimaryIndex = "http://movie.subtitlesworld.com/lists";

function build_AlphabeticalLists () {
	request(subtitleWorldPrimaryIndex,function(err,response,body){
		if(err) {
			return console.log("ERROR IN THE INITIAL REQ TO subtitlesworld");
		}
		var $ = cheerio.load(body);
		var aTags = $('a');
		for(var tag in aTags){
			if(aTags[tag].attribs){
				if(aTags[tag].attribs.href) {
					if(aTags[tag].attribs.href.includes("lists-")){
						var motherListUrl = aTags[tag].attribs.href;
						parse_AlphabeticalList(motherListUrl);
					}
				}
			}	
		}
	});
}

function parse_AlphabeticalList (url) { //takes a url that returns a page containing a list of films starting with a given letter.
	request(url,function(err,response,body){
		if(err) return console.log("ERROR IN THE parse_AlphabeticalList");
		$ = cheerio.load(body);
		var aTags = $("div.mvtitle a");
		for(var tag in aTags){
			if(aTags[tag].attribs){
				if(aTags[tag].attribs.href){
					retrieveSubFile(aTags[tag].attribs.href);	
				}
			}
		}
	});
}

function retrieveSubFile (url) {
	url = "http://movie.subtitlesworld.com/2/a-bridge-too-far"
	request(url,function(err,response,body){
		if(err) return console.log("ERROR IN THE retrieveSubFile");
		$ = cheerio.load(body);
		var aTags = $("a.download_episode");

		for(var tag in aTags) {
			if(aTags[tag].attribs) {
				if(aTags[tag].attribs.href && aTags[tag].attribs.name) {
					if(aTags[tag].attribs.name === "English" || aTags[tag].attribs.name === "english") {
						var thing = rsync("GET",aTags[tag].attribs.href); //<- makes synchronous http call
						var zip = new AdmZip(thing.body);
						var zipEntries = zip.getEntries();
						var newSrtFile=srtParser(zip.readAsText(zipEntries[0]));
						console.log(newSrtFile) // <- yo shit dawg
					}
				}
			}
		}

	});
}
// retrieveSubFile()
// build_AlphabeticalLists();