//since the csv is a big file, the pipe works but the http.request() res.on method is not working
var http = require('http');

var fs = require('fs');
var databaseName = 'ParkingMeters1';
var fileName = "../sfGov/"+ databaseName + ".json";
var pathUrl = '/api/views/7egw-qt89/rows.json?accessType=DOWNLOAD';
var url = 'http://data.sfgov.org' + pathUrl; 

exports.dataDownloader = function(url,fileName,cb) {
  console.log('aha');
  args = arguments;
  var jsonReq = http.get(url, function(res){
    console.log('start Downloading');
    var csv = fs.createWriteStream(fileName);
    res.pipe(csv);
    res.on('end', function(){
      console.log('Downloaded', fileName);
      if (cb && args.length >= 3) {cb();}
    });
  });

  jsonReq.on('error', function (e) {
    console.log(e.message);
  });

};

// exports.dataDownloader(url,fileName);
// exports.SFgovCSV(pathUrl, fileName);