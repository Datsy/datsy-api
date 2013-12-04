var pg = require('pg');
var fs = require('fs');
var saveMetadata = require('../../server/models/metadataModel.js')().saveDataset;
// var generateMetadata = require('');
var credentials = require('./dbconfig.json').db;
var EventEmitter = require('events').EventEmitter;

// modify this only!!edit this to change file
// var filepath = '../sfGov/Map__Crime_Incidents_-_Previous_Three_Months.csv'; //edit this to change file
var dir = '../sfGov/';

console.log(dir,'dir');
console.log(__dirname + '../..');
console.log(saveMetadata,'function');
// var dir = '../USstock/USstockHistory167Mb_output_diffTableName/'; 
var rowsLeft;
var table;

var onReadDir = function(err, files) {
  var conString = "postgres://"+credentials.user+":" +credentials.password+ "@" + credentials.localhost + "/" + credentials.dbname;
  var client = new pg.Client(conString);
  var controller = new EventEmitter();

  controller.on('writeIntoMetaData',function(table){
    console.log(table,'table');
    // model.saveDataset(table);
  });

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
  controller.emit('writeIntoMetaData', metadata);
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

var insertIntoPSQL = function(client, table) {
  var createQS = createQString(table);
  client.query(createQS, function(err, result) {
    if(err) { return console.error('error with creation', err);}
    console.log('created table');
    insertDB(0, table, client);
  });
};

var createQString = function(table) {
  var createQS = 'CREATE TABLE IF NOT EXISTS '+ table.tablename +' (';//ID INT PRIMARY KEY NOT NULL
  for (var i = 0; i < table.num_col; i++) {
    createQS += table.col_names[i] + ' ' + table.col_types[i];
    if (i < table.num_col - 1) {createQS += ',';}
  }
  createQS += ');';
  return createQS;
};

var insertDB = function (startRow, table, client) {
  var rowlimit = table.num_row > 500 ? 500 : table.num_row;
  if (startRow + rowlimit >= table.num_row) {
    rowlimit = table.num_row - startRow;
  }

  if (startRow >= table.num_row) {
    console.log('end of insertDB recursion');
    rowsLeft = 0;
    return;
  }
  
  var insertQS = '';
  insertQS = 'INSERT INTO ' + table.tablename+ ' (' + table.col_names.toString() + ')' + ' VALUES ';
  for (var i = startRow; i < startRow + rowlimit; i++) {
    insertQS += ' (\'';
    insertQS += table.col_values[i].replace(/[^A-Za-z\s\d,&:\.\-//]/g, '').split(',').join('\',\'');
    insertQS += '\')';
    //for insertion into Postgres, must use "null", but not 'null'
    if (i < startRow + rowlimit - 1) {
      insertQS += ',';
    }
  }
  // insertQS = insertQS.replace(/\'null\'/g,'null');
  insertQS += ';';

  // fs.writeFile('./output.txt', insertQS, function() {});
  client.query(insertQS, function(err, result) {
    if (err) { return console.error('error with insertion', err);}
    console.log('inserted data into starting from ' + startRow);
    return insertDB(startRow + rowlimit, table, client);
  });
};

fs.readdir(dir, onReadDir);
