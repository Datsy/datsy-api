var fs = require('fs'),
    q = require('q'),
    binaryCSV = require('binary-csv'),
    parser = binaryCSV(),
    config = require('../../config.js');


var csv = {};

/**
 * After initializing the paths to the csv and metadata files, creates the
 * database table and loads the csv file
 */

csv.file = '';
csv.metadata = '';
csv.columnNames = [];
csv.model = {};
csv.schema;
csv.row_count;

csv.saveDataset = function(path, schema, metadata) {
  if (!path) {
    return;
  }

  this.path = path;
  this.schema = schema;
  this.metadata = metadata;
  this.createModel();
};


/**
 * Read the csv file and save each line as a row in the newly created database
 * table
 */

csv.saveData = function() {
  this.row_count = 0;

  var self = this;
  fs.createReadStream(this.path).pipe(parser)
    .on('data', function(line) {
      if (self.count > 0) {
        line = line.toString().split(',');

        var obj = {};
        for (var i = 0; i < line.length; i++) {
          obj[self.columnNames[i]] = line[i];
        }

        self.row_count++;

        self.Table.create(obj);
      } else {
        self.row_count++;
      }
    });
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

  var self = this;
  var createTable = function() {
    var deferred = q.defer();
    self.schema.autoupdate(function(err) {
      deferred.resolve();
    });

    return deferred.promise;
  };

  createTable()
    .then(function() {
      self.saveData();
    });
};


module.exports = csv;
