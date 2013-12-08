var fs = require('fs'),
    q = require('q'),
    binaryCSV = require('binary-csv'),
    config = require('../../config.js');
    // Writable = require('stream').Writable;


var csv = {};

/**
 * After initializing the paths to the csv and metadata files, creates the
 * database table and loads the csv file
 */

csv.file = '';
csv.metadata = '';
csv.columnNames = [];
csv.model = {};

csv.saveDataset = function(path, schema, metadata,controller) {
  if (!path) {
    return;
  }

  this.path = path;
  this.schema = schema;
  this.metadata = metadata;
  this.controller = controller;
  this.createModel();
};


/**
 * Read the csv file and save each line as a row in the newly created database
 * table
 */

csv.saveData = function() {
  var parser = binaryCSV(),//must be defined here for the scope!
      self = this,
      count = 0;
  console.log("In saveData");
  fs.createReadStream(this.path).pipe(parser)
    .on('data', function(line) {
      if (count > 0) {
        line = line.toString().split(',');
        var obj = {};
        for (var i = 0; i < line.length; i++) {
          obj[self.columnNames[i]] = line[i];
        }

        self.Table.create(obj);
        count++;

      } else {
        count++;
      }
    })
    .on('error', function(err) {
      console.log('cannot read csv', err);
    })
    .on('end', function(){
      console.log(self.controller,'on end');

      if (self.controller) {
        self.controller.emit('csvSaved');
      }
    });
  console.log('start piping');
};


/**
 * Read the metadata JSON file, which is used to create the database column
 * names and data types
 */

csv.readMetadata = function(file) {
  var data;

  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {}

  return data;
};


/**
 * Create the database table and start reading the csv file once the table has
 * successfully been created (the "promise" any writes before table is ready)
 */

csv.createModel = function() {
  if (!this.metadata) {
    throw "csvLoader:  Metadata object must not be empty";
  }

  var model = {};
  for (var i = 0; i < this.metadata.columns.length; i++) {
    var col = this.metadata.columns[i],
        type;

    switch (col.datatype) {
      case 'String':
        type = String;
        break;

      case 'Date':
        type = Date;
        break;

      case 'Number':
        type = Number;
        break;

      default:
        type = String;
        break;
    }

    model[col.name] = {type: type};
    this.columnNames.push(col.name);
  }

  this.Table = this.schema.define(this.metadata.table_name, model);
  console.log("Woon Ket - after create table schema");

  var self = this;
  var createTable = function() {
    var deferred = q.defer();
    self.schema.autoupdate(function() {
      deferred.resolve();
    });
    console.log('autoupdating')
    return deferred.promise;
  };

  createTable()
    .then(function() {
    console.log('done autoupdating')

      self.saveData();
    });
};


module.exports = csv;
