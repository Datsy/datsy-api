var fs = require('fs'),
    q = require('q'),
    binaryCSV = require('binary-csv'),
    parser = binaryCSV();


var csv = {};

/**
 * After initializing the paths to the csv and metadata files, creates the
 * database table and loads the csv file
 */

csv.file = '';
csv.metadata = '';
csv.schema;
csv.columnNames = [];
csv.model = {};

csv.saveDataset = function(path, schema, metadata) {
  if (!path) {
    return;
  }

  this.path = path;
  this.metadata = metadata;
  this.schema = schema;
  this.createModel();
};


/**
 * Read the csv file and save each line as a row in the newly created database
 * table
 */

csv.saveData = function() {
  var self = this, count = 0;;
  fs.createReadStream(this.path).pipe(parser)
    .on('data', function(line) {
      if (count > 0) {
        line = line.toString().split(',');

        var obj = {};
        for (var i = 0; i < line.length; i++) {
          obj[self.columnNames[i]] = line[i];
        }

        self.Table.create(obj);
        } else {
          count++;
        }
    });

//  sequelize.query("COPY capital_bikeshares(duration, start_date, start_station, start_terminal, end_date, end_station, end_terminal, bike, subscriber_type) FROM '" + this.file + "' WITH DELIMITER ',';");
};


/**
 * Create the database query and execute the command
 */

csv.insert = function(lines) {
  var rows = [];
  for (var i = 0; i < lines.length; i++) {
    var attrs = {};
    for (var j = 0; j < this.columnNames.length; j++) {
      attrs[this.columnNames[j]] = lines[i][j];
    }
    rows.push(attrs);
  }

  this.Table.bulkCreate(rows)
    .success(function() {
      console.log('Success!');
    })
    .error(function(err) {
     throw err;
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
