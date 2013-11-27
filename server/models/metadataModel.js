var metadataModel = function(schema) {

  // Namespace for the Metadata tables / relationships

  var Metadata = {};

  //  Define the table schemas

  Metadata.Dataset = schema.define('dataset', {
    table_name: {type: String, unique: true},
    url: {type: String},
    title: {type: String},
    description: {type: String},
    author: {type: String},
    date_added: {type: Date},
    row_count: {type: Number},
    col_count: {type: Number}
  });


  Metadata.Tag = schema.define('tag', {
    label: {type: String, unique: true}
  });


  Metadata.DataColumn = schema.define('datacolumn', {
    name: {type: String},
    datatype: {type: String},
    description: {type: String}
  });


  // Create the table relationships

  Metadata.Dataset.hasAndBelongsToMany(Metadata.Tag, {as: 'tag', foreignKey: 'tag_id'});

  Metadata.Dataset.hasMany(Metadata.DataColumn, {as: 'datacolumn', foreignKey: 'dataset_id'});


  //
  // Define helper functions
  //


  // Saves a JSON object into the database

  Metadata.saveDataset = function(jsonMetadata) {

    var dataset         = new this.Dataset();
    dataset.table_name  = jsonMetadata.table_name;
    dataset.url         = jsonMetadata.url;
    dataset.name        = jsonMetadata.name;
    dataset.title       = jsonMetadata.title;
    dataset.description = this.transformForPostgres(jsonMetadata.description);
    dataset.author      = jsonMetadata.author;
    dataset.col_count   = jsonMetadata.num_cols;
    dataset.date_added  = jsonMetadata.date_added;

    var self = this;
    dataset.save(function(err, dataset) {
      if(err) {
        console.log(err);
      } else {
        self.saveColumns(dataset, jsonMetadata);
      }
    });
  };


  // Reads a JSON file from the disk

  Metadata.readJSONFile = function(filepath) {
    var json = require(filepath);
    this.saveDataset(json);
  };


  // Saves column data to the database

  Metadata.saveColumns = function(dataset, jsonMetadata) {
    for(var i = 0; i < jsonMetadata.columns.length; i++) {
      var column = jsonMetadata.columns[i];
      dataset.datacolumn.create({
        name: column.name,
        datatype: column.datatype,
        description: column.description
      }, function(err, data) {
        if(err) {
          console.log(err);
        } else {
          return data;
        }
      });
    }
  };


  // Return new lines from string

  Metadata.transformForPostgres = function(string) {
    return string.replace("\n", " ");
  }


  return Metadata;
};

module.exports = metadataModel;

