var pg = require('pg');
var fs = require('fs');
var saveMetadata = require('../../server/models/metadataModel.js')().saveDataset;
// var generateMetadata = require('');
var credentials = require('./dbconfig.json').db;

// modify this only!!edit this to change file
var dir = '../USstock/sampledata/';  
var rowsLeft;
var table;

var onReadDir = function(err, files) {
  var conString = "postgres://"+credentials.user+":" +credentials.password+ "@" + credentials.localhost + "/" + credentials.dbname;
  var client = new pg.Client(conString);

  var fIndx = 0;
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    getTableAndQueries(client, files[fIndx],controller);
    var intervalID = setInterval(function(){
      if (rowsLeft === 0) {
        fIndx += 1;
        getTableAndQueries(client, files[fIndx]);
      }
      if (fIndx === files.length) {
        client.end();
        clearInterval(intervalID);
      }
    }, 100);
  });
};

var getTableAndQueries = function(client,file,controller) {
  table = getTableInfo(file);
  rowsLeft = table.num_row;
  insertIntoPSQL(client, table);
  metadata = 3;
  // generateMetadata(table);
};

var getTableInfo = function(file) {
  if (file.substring(file.length - 3) !== 'csv') {return;}
  filepath = dir + file;
  console.log('reading this file into postgres: ', filepath);
  var data = fs.readFileSync(filepath, 'utf8');
  var array = data.split('\n');
  var table = {};
  table.tablename = getTableName(array[0]).tableName;
  table.tablename = getTableName(array[0]).stockName;
  table.col_names = array[1].split(',');
  table.col_types = array[2].split(',');
  table.col_values = array.slice(3);
  table.num_col = table.col_names.length;
  table.num_row = table.col_values.length;
  return table;
};

var getTableName = function(string) {
  var sep = string.indexOf('ticker');
  var obj = {
    tableName: string.slice(sep),
    stockName: string.slice(0, sep-2).split('_')[1]
  };
  obj.tags = obj.stockName.split(' ');
  return obj;
};

fs.readdir(dir, onReadDir);
