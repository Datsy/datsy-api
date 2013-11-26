var csvToDatabase = function(filepath){

  console.log("***Hello");
  var pg = require('pg');
  console.log("***Hello2");
  var fs = require('fs');
  console.log("***Hello3");
  var credentials = require('../../dbconfig.json').db;
  console.log("***credentials user",credentials.user);
  console.log("***credentials password",credentials.password);
  console.log("***credentials localhost",credentials.localhost);
  var conString = "postgres://"+credentials.user+":" +credentials.password+ "@" + credentials.localhost + "/" + credentials.dbname;
  var client = new pg.Client(conString);
  var rowlimit = 500;
  var num_row = 0;
  var table = {};

  console.log("In csvToDatabase");

  var readOne = function (filepath) {
      console.log("readOne1", filepath);
      var data = fs.readFileSync(filepath, 'utf8');
      console.log("readOne2");
      var array = data.split('\n');
      console.log("readOne3");
      table.tablename = array[0];
      console.log("readOne4");
      table.col_names = array[1].split(',');
      table.col_types = array[2].split(',');
      table.col_values = array.slice(3);
      table.num_col = table.col_names.length;
      table.num_row = table.col_values.length;
      console.log("readOne2");
      createQString();
  };

  var createQString = function() {
    console.log("creating string");
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
      console.log("creating db");
      client.query(createQS, function(err, result) {
        if(err) { return console.error('error with creation', err);}
        console.log('created table');
        // insertDB(848000 + 500);
        insertDB(0);
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

    // fs.writeFile('./output.txt', insertQS, function() {});
    client.query(insertQS, function(err, result) {
      if (err) { return console.error('error with insertion', err);}
      console.log('inserted data into starting from ' + startRow);
      insertDB(startRow + rowlimit);
      if (startRow + rowlimit >= table.num_row) {
        console.log('done!!');
        client.end();
      };
    });
  };

  readOne(filepath);
};

module.exports = csvToDatabase; 


