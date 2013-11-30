var metadataModel = function(schema) {

  // Namespace for the Metadata tables / relationships

  var Metadata = {};

  //  Define the table schemas

  Metadata.Dataset = schema.define('datasetmeta', {
    table_name: {type: String, unique: true},
    user_id: {type: Number},
    url: {type: String},
    title: {type: String},
    description: {type: String},
    author: {type: String},
    created_at: {type: Date},
    row_count: {type: Number},
    col_count: {type: Number}
  });

  Metadata.Tag = schema.define('datasettag', {
    label: {type: String, unique: true}
  });

  Metadata.DataColumn = schema.define('datacolumnmeta', {
    name: {type: String},
    datatype: {type: String},
    description: {type: String}
  });

  // Create the table relationships

  Metadata.Dataset.hasAndBelongsToMany(Metadata.Tag, {as: 'datasettag', foreignKey: 'tag_id'});
  Metadata.Dataset.hasMany(Metadata.DataColumn, {as: 'datacolumnmeta', foreignKey: 'dataset_id'});


  //
  // Define helper functions
  //


  // Saves a JSON object into the database

  Metadata.saveDataset = function(jsonMetadata) {

    var dataset         = new this.Dataset();
    dataset.table_name  = jsonMetadata.table_name;
    dataset.user_id     = jsonMetadata.userID;
    dataset.url         = jsonMetadata.url;
    dataset.name        = jsonMetadata.name;
    dataset.title       = jsonMetadata.title;
    dataset.description = this.transformForPostgres(jsonMetadata.description);
    dataset.author      = jsonMetadata.author;
    dataset.col_count   = jsonMetadata.col_count;
    dataset.row_count   = jsonMetadata.row_count;
    dataset.created_at  = jsonMetadata.created_at;

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
    var cb = function(err, data) {
      if (err) {
        console.log(err);
      } else {
        return data;
      }
    };

    for(var i = 0; i < jsonMetadata.columns.length; i++) {
      var column = jsonMetadata.columns[i];
      dataset.datacolumnmeta.create({
        name: column.name,
        datatype: column.datatype,
        description: column.description
      }, cb);
    }
  };


  // Return new lines from string

  Metadata.transformForPostgres = function(string) {
    return string.replace("\n", " ");
  };


  return Metadata;
};

module.exports = metadataModel;

