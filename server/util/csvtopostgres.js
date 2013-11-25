var pg = require('pg');
var fs = require('fs');

var credentials = require('./dbconfig.json').db;
var conString = "postgres://"+credentials.user+":" +credentials.password+ "@" + credentials.localhost + "/" + credentials.dbname;
var client = new pg.Client(conString);
var dir='./rawcsv/';

var rowlimit = 500;
var num_row = 0;
var table = {};

var readFolder = function () {
  fs.readdir(dir,function(err,files){
    if (err) throw err;
    files.forEach(function(file){
      //file is a string containing the file name
      if (file.substring(file.length - 3) === 'csv')  {
        readOne(dir+file);
      }
    });
  });
};
var readOne = function (filepath) {
    var data = fs.readFileSync('./rawcsv/2013-3rd-quarterfull.csv', 'utf8');
    var array = data.split('\n');
    table.tablename = array[0];
    table.col_names = array[1].split(',');
    table.col_types = array[2].split(',');
    table.col_values = array.slice(3);
    table.num_col = table.col_names.length;
    table.num_row = table.col_values.length;
    createQString();
};
var createQString = function() {
  var createQS = 'CREATE TABLE IF NOT EXISTS '+ table.tablename +' (';//ID INT PRIMARY KEY NOT NULL
  for (var i = 0; i < table.num_col; i++) {
    createQS += table.col_names[i] + ' ' + table.col_types[i] + ' NOT NULL';
    if (i < table.num_col - 1) {createQS += ',';}
  }
  createQS += ');';
  createDB(createQS);
};


var createDB = function (createQS, insertQS) {
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query(createQS, function(err, result) {
      if(err) { return console.error('error with creation', err);}
      console.log('created table');
      insertDB(848000 + 500);
    });
  });
};

var insertDB = function (startRow) {
  if (startRow >= table.num_row) {
    client.end();
    return;
  }

  var insertQS = '';
  insertQS = 'INSERT INTO ' + table.tablename+ ' (' + table.col_names.toString() + ')' + ' VALUES ';
  if (startRow + rowlimit >= table.num_row) {
    rowlimit = table.num_row - startRow;
  }
  for (var i = startRow; i < startRow + rowlimit; i++) {
    insertQS += ' (\'';
    insertQS += table.col_values[i].replace(/[^A-Za-z\s\d,&://]/g, '').split(',').join('\',\'');
    insertQS += '\')';
    if (i < startRow + rowlimit - 1) {
      insertQS += ',';
    }
  }
  insertQS += ';';

  fs.writeFile('./output.txt', insertQS, function() {});
  client.query(insertQS, function(err, result) {
    if (err) { return console.error('error with insertion', err);}
    console.log('inserted data into starting from ' + startRow);
    insertDB(startRow + rowlimit);
    if (startRow + rowlimit >= table.num_row) {
      console.log('done!!');
      client.end();
    }
  });
}

readOne();


