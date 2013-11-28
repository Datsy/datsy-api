// var db = require('./soda-js');
var http = require('http');
var url = require('url');
var helper = require('../helper/MongoDB_CSV_helperFunctions.js')
var csvToPostgres = require('../helper/csvtopostgres.js');
var 
var fileName = "SFGovEarthquakes";
var filePath = './' +fileName +'.csv';
var logFilePath = './sfGovlog.csv';

exports.SFgov = function(filePath) {
  // setInterval(function() {
    var jsonReq = http.request(options, function (res) {
      var data = '';
      res.on('data', function (chunk) {
        data += chunk;
        console.log('receiving');

      });
      res.on('end', function () {
        writeNewData(filePath, data);
        writeNewData(logFilePath, filepath, JSON.stringify(data));
        console.log('end');
      });
    });
    
    jsonReq.on('error', function (e) {
      console.log(e.message);
    });

    jsonReq.end();
  // }, 65000);
};

var options = {
  host: 'soda.demo.socrata.com',
  path: "/resource/earthquakes.json?$where=datetime > '2012-8-10'",
  method: 'GET',
  'X-App-Token': 'Fy3jzg1i4UIZGGHjPHKXIe0mZ',
  contentType: 'application/json'
};

var writeNewData = function(data) {
  fs.createWriteStream(fileName);
  helpers.getAllKeys(data);
}

exports.SFgov();