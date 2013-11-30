var pg = require('pg');
var fs = require('fs');

var credentials = require('./dbconfig.json').db;
var conString = "postgres://"+credentials.user+":" +credentials.password+ "@" + credentials.localhost + "/" + credentials.dbname;
var client = new pg.Client(conString);
// var dir='./rawcsv/';
var rowlimit = 500;
var num_row = 0;
var table = {};

// modify this only!!
var filepath = '../USstockHistory167Mb_output/stockdata.csv'; //edit this to change file
// var readFolder = function () {
//   fs.readdir(dir,function(err,files){
//     if (err) throw err;
//     files.forEach(function(file){
//       //file is a string containing the file name
//       if (file.substring(file.length - 3) === 'csv')  {
//         readOne(dir+file);
//       }
//     });
//   });
// };
var readOne = function (filepath) {
    var data = fs.readFileSync(filepath, 'utf8');
    var array = data.split('\n');
    table.tablename = array[0];
    table.col_names = array[1].split(',');
    table.col_types = array[2].split(',');
    table.col_values = array.slice(3);
    table.num_col = table.col_names.length;
    table.num_row = table.col_values.length;
    console.log(table.num_col);
    console.log(table.num_row);
    createQString();
};
var createQString = function() {
  var createQS = 'CREATE TABLE IF NOT EXISTS '+ table.tablename +' (';//ID INT PRIMARY KEY NOT NULL
  for (var i = 0; i < table.num_col; i++) {
    createQS += table.col_names[i] + ' ' + table.col_types[i];
    if (i < table.num_col - 1) {createQS += ',';}
  }
  createQS += ');';
  createDB(createQS);
  console.log(createQS);
};


var createDB = function (createQS, insertQS) {
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query(createQS, function(err, result) {
      if(err) { return console.error('error with creation', err);}
      console.log('created table');
      insertDB(0);
    });
  });
};

var insertDB = function (startRow) {
  console.log('insert starts');
  if (startRow >= table.num_row) {
    client.end();
    return;
  }
  var temp = [];

  var insertQS = '';
  insertQS = 'INSERT INTO ' + table.tablename+ ' (' + table.col_names.toString() + ')' + ' VALUES ';
  if (startRow + rowlimit >= table.num_row) {
    rowlimit = table.num_row - startRow;
  }
  for (var i = startRow; i < startRow + rowlimit; i++) {
    insertQS += ' (\'';
    insertQS += table.col_values[i].replace(/[^A-Za-z\s\d,&:\.\-//]/g, '').split(',').join('\',\'');
    insertQS += '\')';
//for insertion into Postgres, must use "null", but not 'null'

    // insertQS += ' (;
    // var arr = table.col_values[i].replace(/[^A-Za-z\s\d,&:.\-//]/g, '').split(',');
    // for (var j = 0; j < arr.length; j ++) {
    //   if (arr[j] === '') {
    //     insertQS += "null";
    //   } else {
    //     insertQS += "'" +arr[j] +"'";
    //   }
    //   if (j < arr.length -1) {
    //     insertQS += ',';
    //   }
    // }
    // temp.push(arr.length);
//    insertQS += ')';

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
    insertDB(startRow + rowlimit);
    if (startRow + rowlimit >= table.num_row) {
      console.log('done!!');
      client.end();
    }
  });
}

exports.readOne = readOne;


