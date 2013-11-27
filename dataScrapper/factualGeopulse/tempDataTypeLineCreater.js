// var pg = require('pg');
// var _und = require("underscore/underscore-min");
var Factual = require('factual-api');
var fs = require('fs');
// var csv = require('csv');
var helper = require('../helper/MongoDB_CSV_helperFunctions.js');
var getAllKeys = helper.getAllKeys;
var checkCSVFolder = helper.checkCSVFolder;

// setTimeout for each task per hour, create a csv file per hour
//set Timeout for each task in an hour.
// alocate different geo points??? how is that set up?
//for each object, write them into one line of txt.

var dataBaseName = "LocationDemographics";
var csvFolder = __dirname + '/'+ dataBaseName +'csv/'; //the string is the csvFolder name
var timeStamp = new Date().toISOString();
timeStamp = timeStamp.replace(/:/g, '-').split('.')[0];
var fileName = csvFolder +  timeStamp + dataBaseName + '.csv';
//make a dir if the csvfolder dose not exist
var dataTypes = 'FLOAT8,FLOAT8,';
var floatType = 'FLOAT4,';
for (var i = 0; i < 96; i ++) {
  dataTypes += floatType;
}
dataTypes +='FLOAT4';


var initialize = function(latitude,longitude, step) {
    var toWrite = dataBaseName+'\n'+ dataTypes + '\n';
    currentCSV.write(toWrite);
};


var currentCSV = fs.createWriteStream(fileName);
initialize();

