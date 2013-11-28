var pg = require('pg');
var fs = require('fs');

var credentials = require('./dbconfig.json').db;
var events = require('events').EventEmitter;
console.log(events);
// var dir='./rawcsv/';
var rowlimit = 100;
var num_row = 0;

// modify this only!!
var dir = '../USstock/USstockHistory167Mb_output/'; //edit this to change file

// var readFolder = function () {
//   console.log(dir);
//   fs.readdir(dir, onReadDir);
// };
// var onReadDir = function(err, files) {
//   if (err) {console.log('error', err);}
//   var conString = "postgres://"+credentials.user+":" +credentials.password+ "@" + credentials.localhost + "/" + credentials.dbname;
//   var client = new pg.Client(conString);


// }
// function(err,files) {
//     console.log(files.length);
//     setIntervals(function(){

//     })
//     if (err) throw err;
//     allFiles = files; 
//     // readOne(files, index);
//     for (var i = 0; i < files.length; i++) {
//       (function(file, i) {
//         setTimeout(function() {
//           if (file.substring(file.length - 3) === 'csv') {
//             console.log('reading',i,'from',file);
//             readOne(dir+file);
//           }
//         }, 3000 * i);
//       }(files[i], i));
//     }
//   });
// };

// var readOne = function (filepath) {
//     // filepath = dir + files[i];
//     console.log(filepath);
//     fs.readFile(filepath, 'utf8', function(err, data){
//       if (err) {console.log('error in readFile', err);}
//       var array = data.split('\n');
//       console.log('data',data);
//       table.tablename = array[0];
//       table.col_names = array[1].split(',');
//       table.col_types = array[2].split(',');
//       table.col_values = array.slice(3);
//       table.num_col = table.col_names.length;
//       table.num_row = table.col_values.length;
//       console.log(table.num_col);
//       console.log(table.num_row);
//       createQString(table);
//     });
// };

// var createQString = function() {
//   var createQS = 'CREATE TABLE IF NOT EXISTS '+ table.tablename +' (';//ID INT PRIMARY KEY NOT NULL
//   for (var i = 0; i < table.num_col; i++) {
//     createQS += table.col_names[i] + ' ' + table.col_types[i];
//     if (i < table.num_col - 1) {createQS += ',';}
//   }
//   createQS += ');';
//   createDB(createQS);
//   console.log(createQS,'createQS');
// };

// var createDB = function (createQS, insertQS) {
//   client.connect(function(err) {
//     if(err) {
//       return console.error('could not connect to postgres', err);
//     }
//     client.query(createQS, function(err, result) {
//       if(err) { return console.error('error with creation', err);}
//       console.log('created table');
//       insertDB(0);
//     });
//   });
// };

// var insertDB = function (startRow) {
//   console.log('insert starts');
//   if (startRow >= table.num_row) {
//     client.end();
//     return;
//   }
//   var temp = [];

//   var insertQS = '';
//   insertQS = 'INSERT INTO ' + table.tablename+ ' (' + table.col_names.toString() + ')' + ' VALUES ';
//   if (startRow + rowlimit >= table.num_row) {
//     rowlimit = table.num_row - startRow;
//   }
//   for (var i = startRow; i < startRow + rowlimit; i++) {
//     insertQS += ' (\'';
//     insertQS += table.col_values[i].replace(/[^A-Za-z\s\d,&:\.\-//]/g, '').split(',').join('\',\'');
//     insertQS += '\')';
// //for insertion into Postgres, must use "null", but not 'null'

//     if (i < startRow + rowlimit - 1) {
//       insertQS += ',';
//     }
//   }
//   // insertQS = insertQS.replace(/\'null\'/g,'null');
//   insertQS += ';';

//   // fs.writeFile('./output.txt', insertQS, function() {});
//   client.query(insertQS, function(err, result) {
//     if (err) { return console.error('error with insertion', err);}
//     console.log('inserted data into starting from ' + startRow);
//     insertDB(startRow + rowlimit);
//     if (startRow + rowlimit >= table.num_row) {
//       console.log('done!!');
//       client.end();
//       console.log(new Date().getTime());
//     }
//   });
// };

// var readNext = function() {
//   console.log(index,allFiles);
//   index += 1;
//   if (index < allFiles.length) {
//     readOne(allFiles, index);
//   }
// };
//       // console.log(new Date().getTime());
// readFolder();

// exports.readOne = readOne;


