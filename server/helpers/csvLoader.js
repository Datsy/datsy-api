var fs = require('fs'),
    q = require('q'),
    binaryCSV = require('binary-csv'),
    config = require('../../config.js'),
    Sequelize = require('sequelize');

var csv = {};


/**
 * After initializing the paths to the csv and metadata files, creates the
 * database table and loads the csv file
 */

csv.file = '';
csv.model = {};

csv.saveDataset = function(path, metadata, Models, cb) {
  if (!path) {
    return;
  }

  this.path = path;
  this.datastore = Models.datastore;
  this.metadata = metadata;
  this.columnNames = [];
  this.createModel();
  this.cb = cb;
};


/**
 * Read the csv file and save each line as a row in the newly created database
 * table
 */

csv.saveData = function() {
  var parser = binaryCSV(),//must be defined here for the scope!
      self = this,
      count = 0;

  fs.createReadStream(this.path).pipe(parser)
    .on('data', function(line) {
      if (count > 0) {
        line = line.toString().split(',');
        console.log(line);
        var obj = {};
        for (var i = 0; i < line.length; i++) {
          obj[self.columnNames[i]] = line[i];
        }

        new Sequelize.Utils.QueryChainer()
          .add(self.Table.create(obj))
          .run()
          .success(function() { console.log('Success!'); })
          .error(function(err) { console.log(err, obj); });
      }

      count++;
    })
    .on('error', function(err) {
      console.log('csv.saveData(): ', err);
    })
    .on('end', function(){
      console.log('csv.saveData(): ENDED!');
      self.cb();
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
    var column = this.metadata.columns[i],
        type;

    switch (column.datatype) {
      case 'String':
        type = Sequelize.STRING;
        break;

      case 'Date':
        type = Sequelize.DATE;
        break;

      case 'Number':
        type = Sequelize.INTEGER;
        break;

      default:
        type = Sequelize.STRING;
        break;
    }

    model[column.name] = {type: type};
    this.columnNames.push(column.name);
  }

  self = this;
  this.Table = this.datastore.define(this.metadata.table_name, model);
  this.Table.sync().success(function() {
      self.saveData();
  });
};


module.exports = csv;
