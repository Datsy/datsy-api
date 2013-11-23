var pg = require('pg');
var fs = require('fs');

var conString = "postgres://masterofdata:gj1h23gnbfsjdhfg234234kjhskdfjhsdfKJHsdf234@137.135.14.92/postgres";
var client = new pg.Client(conString);
var dir='./rawcsv/';

var insertDB = function (createQS, insertQS) {
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // client.query('DROP TABLE IF EXISTS ' + tablename + ';', function(err, result) {
    //   if(err) { return console.error('error with creation', err);}
    //   console.log('created table' + tablename);
    // });
    client.query(createQS, function(err, result) {
      if(err) { return console.error('error with creation', err);}
      console.log('created table');
    });

    client.query(insertQS, function(err, result) {
      if(err) { return console.error('error with insertion', err);}
      console.log('inserted data into');
      client.end();
    });
  });
};


var processFile = function(tablename, col_names, col_types, col_values) {

  var num_col = col_names.length;
  var createQS = 'CREATE TABLE IF NOT EXISTS '+ tablename +' (';//ID INT PRIMARY KEY NOT NULL
  var insertQS = 'INSERT INTO ' + tablename+ ' (' + col_names.toString() + ')' + ' VALUES '

  for (var i = 0; i < num_col; i++) {
    createQS += col_names[i] + ' ' + col_types[i] + ' NOT NULL';
    if (i < num_col - 1) {createQS += ',';}
  }
  var num_row = col_values.length;

  for (var i = 0; i < num_row; i++) {
    insertQS += ' (\'';
    insertQS += col_values[i].split(',').join('\',\'');
    insertQS += '\')';
    if (i < num_row - 1) {
      insertQS += ',';
    }
  }

  createQS += ');';
  insertQS += ';';
  
    
  // console.log('create ', createQS);
  // console.log('insert ', insertQS);
  insertDB(createQS, insertQS);
};


var readOne = function (filepath) {
  console.log(filepath);
  // fs.readFile('./rawcsv/cat_rawdata.txt', {encoding:'utf8'},function(err, data) {
  fs.readFile(filepath, {encoding:'utf8'},function(err, data) {
    if (err) {
      throw err;
    }
    var array = data.split('\n');
    var tablename = array[0];
    var col_names = array[1].split(',');
    var col_types = array[2].split(',');
    var col_values = array.slice(3);

    // Invoke the next step here however you like
    processFile(tablename, col_names, col_types, col_values);          // Or put the next step in a function and invoke it
  });
};


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
readFolder();


