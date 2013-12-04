var pg = require('pg');
var fs = require('fs');
var saveMetadata = require('../../server/models/initModel.js')().Metadata;
// var generateMetadata = require('');
var credentials = require('./dbconfig.json').db;
var EventEmitter = require('events').EventEmitter;

// modify this only!!edit this to change file
var dir = '../USstock/sampledata/';
var tableMetaData={};
var rowsLeft;

var onReadDir = function(err, files) {
  var conString = "postgres://"+credentials.user+":" +credentials.password+ "@" + credentials.localhost + "/" + credentials.dbname;
  var client = new pg.Client(conString);
  var controller = new EventEmitter();

  var fIndx = 0;
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    getTableAndQueries(client, files[fIndx]);
    console.log('get table and queries!!!!');
    var intervalID = setInterval(function(){
      if (rowsLeft === 0) {
        fIndx += 1;
        console.log('the are xxx in the directory! ', fIndx);
        if (fIndx < files.length) {
          getTableAndQueries(client, files[fIndx]);
        }
      }
      if (fIndx === files.length) {
        client.end();
        console.log('end client');
        clearInterval(intervalID);
      }
    }, 100);
  });
};

var getTableAndQueries = function(client,file) {
  if (file.substring(file.length - 3) !== 'csv') {
    rowsLeft = 0;
    return;
  }
  var table = getTableInfo(file);

  rowsLeft = table.num_row;
  insertIntoPSQL(client, table);

  // generateMetadata(table);
};

var getTableInfo = function(file) {
  filepath = dir + file;
  console.log('reading this file into postgres: ', filepath);
  var data = fs.readFileSync(filepath, 'utf8');
  var array = data.split('\r\n');
  var table = {};
  var extra = getTableName(array[0]);
  table.tablename = extra.tableName;
  table.col_names = array[1].split(',');
  table.col_types = array[2].split(',');
  table.col_values = array.slice(3);
  table.num_col = table.col_names.length;
  table.num_row = table.col_values.length;
  populatemetadatatable(table, extra);
  return table;
};

// //  "columns": [
//     {
//       "name": "magnitude",
//       "description": "Magnitude of earthquake",
//       "datatype": "number",//s,n,d
//     },
var populatemetadatatable = function(table, extra) {
  tableMetaData = {
    user_id: 1,
    title: extra.stockName,
    description: extra.tableName.replace(/_/g, ' ') + ' ' + extra.stockName,
    author: 'NYSE',
    url: 'http://cs.brown.edu/~pavlo/stocks/history.tar.gz',
    row_count: table.num_row, 
    col_count: table.num_col, //hardcoded for now
    created_at: (new Date()).toUTCString(),
    table_name: extra.tableName,
    tags: extra.tags,
    columns:[]
  };
  var col_data = {};
  for (var i = 0; i < table.num_col; i++) {
    col_data.name = table.col_names[i];
    col_data.description = table.col_names[i];
    col_data.datatype = table.col_types[i];
    tableMetaData.columns.push(col_data);
  }
};

//StockName_Agilent Technologies Inc.__ticker_A__startDate_1999-11-18__endDate_2006-12-29__eod
var getTableName = function(string) {
  var sep = string.indexOf('ticker');
  var obj = {
    tableName: string.slice(sep),
    stockName: JSON.stringify(string.slice(0, sep-2).split('_')[1])
  };
  obj.tags = [obj.stockName.replace(/ /g,'_')];
  var tagsArr = obj.tableName.split('__');
  for (var i = 0; i < tagsArr.length; i ++) {
    var subTag = tagsArr[i].split('_');
    for (var j = 0; j < subTag.length; j ++) {
      obj.tags.push(subTag[j]);
    }
  }
  obj.tableName = obj.tableName.replace(/\-/g, '_');

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

    saveMetadata.saveDataset(tableMetaData);
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
    if (err) { return console.error('error with   insertion', err);}
    console.log('inserted data into starting from ' + startRow);
    return insertDB(startRow + rowlimit, table, client);
  });
};

fs.readdir(dir, onReadDir);
