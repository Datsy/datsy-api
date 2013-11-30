// var pg = require('pg');
// var _und = require("underscore/underscore-min");
var Factual = require('factual-api');
var fs = require('fs');
// var csv = require('csv');
var helper = require('../helper/MongoDB_CSV_helperFunctions.js');
var getAllKeys = helper.getAllKeys;
var checkCSVFolder = helper.checkCSVFolder;
var checkKeys = helper.checkKeys;
var factual = new Factual(process.env.FACTUAL_ACCESS_KEY, process.env.FACTUAL_SECRET_KEY);

// setTimeout for each task per hour, create a csv file per hour
//set Timeout for each task in an hour.
// alocate different geo points??? how is that set up?
//for each object, write them into one line of txt.

var dataBaseName = "LocationDemographics";
var csvFolder = __dirname + '/'+ dataBaseName +'csv/'; //the string is the csvFolder name
var timeStamp = new Date().toISOString();
timeStamp = timeStamp.replace(/:/g, '-').split('.')[0];
var fileName = csvFolder +  timeStamp + dataBaseName + '.csv';
var totalKeys = [];

var factualReq = function(lat, longt, cb, msg) {
  lat = +lat.toFixed(2);
  longt = +longt.toFixed(2);
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
  var dataTypes = 'FLOAT8,FLOAT8,';
  var floatType = 'FLOAT4,';
  for (var i = 0; i < 100; i ++) {
    dataTypes += floatType;
  }
  dataTypes +='FLOAT4';

  factualReq(latitude, longitude, function(res) {
    var retrievedKeys = getAllKeys(res.data.demographics)[0];
    var keys = 'latitude,longitude,' + retrievedKeys.join(',');
    if (retrievedKeys.length === 101) {totalKeys = retrievedKeys;}
    else {
      console.log('the start point data is not complete');
      return;
    }

    var vals = getAllKeys(res.data.demographics)[1];
    var data = latitude + ',' + longitude + ',' + vals.join(',') + '\n';
    var toWrite = dataBaseName+'\n' + keys + '\n'+ dataTypes + '\n' + data;

    writeIntoCSV(toWrite, latitude, longitude, step, vals[1]);
  }, 'in initialize');
};

var writeIntoCSV = function(datatobeWritten, latitude, longitude, step, prevData) {
  currentCSV.write(datatobeWritten);
  setTimeout(function(){
    retrieveDataAfterInitialize(latitude + step, longitude, step, prevData);
    }, 500);
};

var calBorder = {
  NorthLat : 40,
  SouthLat : 36,
  EastLong : -120,
  WestLong : -123.8
};
var counter = 0;

var startPoint = {
  latitude : 40,
  longitude : -122.45
};
var retrieveDataAfterInitialize = function(latitude, longitude, step, prevData) {
  //if latitude exceed border, restart from center+step*count, and scan again
  if (latitude < calBorder.SouthLat) {
    counter ++;
    setTimeout(function() {
      retrieveDataAfterInitialize(startPoint.latitude, startPoint.longitude + counter*step, step, prevData);
      console.log('hit the south latitude range');
    }, 500);
    return;
  }
  //stop this scan, tofix, should have set up the next scan!
  if (longitude < calBorder.WestLong) {
    currentCSV.end();
    //remember to remove the last '\n'
    console.log('hit the West longitude range');
    return;
  }

  factualReq(latitude, longitude, function(res) {
    var vals = checkKeys(getAllKeys(res.data.demographics), totalKeys);
    var currentCheck = vals[1];//a value to check if the nextScan is overlapping with previous coordination
    if (vals && prevData !== currentCheck) {
      var data = latitude + ',' + longitude + ',' + vals.join(',') + '\n';
      writeIntoCSV(data, latitude + step, longitude, step, currentCheck);
      // console.log(getAllKeys(res.data.demographics)[0].length,'a',getAllKeys(res.data.demographics)[1].length, 'vals');
    } else {
      setTimeout(function() {
        retrieveDataAfterInitialize(latitude + step, longitude, step, currentCheck);
        console.log(latitude + step, longitude,'duplicating previous data, skip');
      }, 500);
    }      
  }, 'in retrieveDataAfterInitialize, count = ' + counter +';latitude,' + latitude +'logitude:'+longitude+'step'+step+'prevData'+prevData);

};

//make a dir if the csvfolder dose not exist
checkCSVFolder(csvFolder);

var currentCSV = fs.createWriteStream(fileName);
initialize(startPoint.latitude,startPoint.longitude, -0.05);

