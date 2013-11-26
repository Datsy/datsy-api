// var pg = require('pg');
// var _und = require("underscore/underscore-min");
var Factual = require('factual-api');
var fs = require('fs');
// var csv = require('csv');
var helper = require('./MongoDB_CSV_helperFunctions.js');
var getAllKeys = helper.getAllKeys;
var checkCSVFolder = helper.checkCSVFolder;
var checkKeys = helper.checkKeys;
var factual = new Factual(process.env.FACTUAL_ACCESS_KEY, process.env.FACTUAL_SECRET_KEY);

// setTimeout for each task per hour, create a csv file per hour
//set Timeout for each task in an hour.
// alocate different geo points??? how is that set up?
//for each object, write them into one line of txt.

//set the first Line of file
var dataBaseName = "LocationDemographics";

//set the second Line of file;
var dataTypes = 'FLOAT8,FLOAT8,';
var floatType = 'FLOAT4,';
for (var i = 0; i < 96; i ++) {
  dataTypes += floatType;
}
dataTypes +='FLOAT4';

//set the folderName 
var csvFolder = __dirname + '/'+ dataBaseName +'csv/'; //the string is the csvFolder name


var directions = ["SouthEast", "NorthWest","SouthWest"];
var i = 0;

var main = function() {
//set csv filename and timeStamp
  var timeStamp = new Date().toISOString();
  timeStamp = timeStamp.replace(/:/g, '-').split('.')[0];
  var fileName = csvFolder +  timeStamp + dataBaseName + directions[i]+'.csv';
  //make a dir if the csvfolder dose not exist
  checkCSVFolder(csvFolder);
  //init write file stream
  var currentCSV = fs.createWriteStream(fileName);
  initialize(midPoint.latitude, midPoint.longitude, 0.05);
};


var factualReq = function(lat, longt, cb, msg) {
  factual.get('/places/geopulse', {geo:{"$point":[lat,longt]}},function(err, res) {
    if (err || !res || !res.data) {
      if (err) {console.log('error', err, msg);}
      else {console.log('errorMsg', msg);}
    } else {
      cb(res);
    }
  });
};


var initialize = function(latitude,longitude, step) {
  factualReq(latitude, longitude, function(res) {
    var keys = 'latitude,longitude,' + getAllKeys(res.data.demographics)[0].join(',') + '\n';
console.log(keys.split(',').length, 'keys');
    currentCSV.write(dataBaseName+'\n' + keys + dataTypes + '\n');
    setTimeout(function(){
      retrieveDataAfterInitialize(latitude, longitude, step, prevData);
    }, 500);
    // writeIntoCSV(keys, latitude, longitude, step);
  }, 'in initialize');
};

var USborder = {
  NorthLat : 49.38447,
  SouthLat : 24.52083,
  EastLong : -66.95,
  WestLong : -124.76667
};

var midPoint = {
  latitude : Math.floor((USborder.NorthLat + USborder.SouthLat)/2),
  longitude : Math.floor((USborder.EastLong + USborder.WestLong)/2)
};

var counter = 0;

var retrieveDataAfterInitialize = function(latitude, longitude, step, prevData) {
  //if latitude exceed border, restart from center+step*count, and scan again
  if (latitude > USborder.NorthLat) {
    counter ++;
    setTimeout(function() {
      retrieveDataAfterInitialize(midPoint.latitude, midPoint.longitude + counter*step, step, prevData);
    }, 500);
    return;
  }
  //stop this scan, ideally, should have set up the next scan!
  if (longitude > USborder.EastLong) {
    currentCSV.end();
    return;
  }

  factualReq(latitude, longitude, function(res) {
    var vals = getAllKeys(res.data.demographics)[1];
console.log(vals.split(',').length, 'vals');

    var currentCheck = vals[1];//a value to check if the nextScan is overlapping with previous coordination
    if (vals && prevData !== currentCheck) {
      var data = latitude + ',' + longitude + ',' + vals.join(',') + '\n';
      writeIntoCSV(data, latitude + step, longitude, step, currentCheck);
    } else {
      setTimeout(function() {
        retrieveDataAfterInitialize(latitude + step, longitude, step, currentCheck);
      }, 500);
    }      
  }, 'in retrieveDataAfterInitialize, count = ' + counter +';latitude,' + latitude +'logitude:'+longitude+'step'+step+'prevData'+prevData);

};




