//since the csv is a big file, the pipe works but the http.request() res.on method is not working
var http = require('http');

var fs = require('fs');
var databaseName = 'ParkingMeters';
var fileName = "./"+ databaseName + ".csv";
var url = 'http://data.sfgov.org/api/views/7egw-qt89/rows.csv';
exports.SFgov = function(url,fileName) {
    var jsonReq = http.get(url, function(res){
      var csv = fs.createWriteStream(fileName);
      res.pipe(csv);
      res.on('end', function(){
        console.log('Downloaded');
      });
    });

    jsonReq.on('error', function (e) {
      console.log(e.message);
    });

};

exports.SFgov(url, fileName);