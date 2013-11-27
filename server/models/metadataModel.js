var metadataModel = function(schema) {

  // Namespace for the Metadata tables / relationships

  var Metadata = {};

  //  Define the table schemas

  Metadata.Dataset = schema.define('dataset', {
    table_name: {type: String, unique: true},
    url: {type: String},
    title: {type: String, length: 45},
    description: {type: String},
    author: {type: String, length: 45},
    date_added: {type: Date},
    row_count: {type: Number},
    col_count: {type: Number}
  });


  Metadata.Tag = schema.define('tag', {
    label: {type: String, length: 45}
  });


  Metadata.DataColumn = schema.define('datacolumn', {
    name: {type: String, length: 45},
    datatype: {type: String, length: 45},
    description: {type: String}
  });


  // Create the table relationships

  Metadata.Dataset.hasAndBelongsToMany(Metadata.Tag, {as: 'tag', foreignKey: 'dataset_id'});

  Metadata.Dataset.hasMany(Metadata.DataColumn, {as: 'datacolumn', foreignKey: 'dataset_id'});


  //
  // Define helper functions
  //


  // Saves a JSON object into the database

  Metadata.saveDataset = function(jsonMetadata) {

    var dataset         = new this.Dataset();
    dataset.url         = jsonMetadata.url;
    dataset.name        = jsonMetadata.name;
    dataset.title       = jsonMetadata.title;
    dataset.description = this.transformForPostgres(jsonMetadata.description);
    dataset.author      = jsonMetadata.author;
    dataset.user_id     = jsonMetadata.user_id;
    dataset.numcols     = jsonMetadata.numcols;

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
        description: column.meaning
      }, function(err, data) {
        if(err) {
          console.log(err);
        } else {
          return data;
        }
      });
    }
  };


  // Gets all columns containing a certain datatype

  Metadata.getColumnsByDatatype = function(datatypeString, cb) {
    return this.DataColumn.all({where: {datatype: datatypeString}}, cb);
  };


  // Gets all datasets with a certain tag

  Metadata.getDatasetsByTagName = function(tagName) {
    // tagName -> array of Datasets
    var tag = getTagByName(tagName);
    return DataTags.all({where: {id: tag.id, dataCategory: 'set'}}, function(err, DatasetIds){
      if(err) {
        console.log(err);
      } else {
        return Datasets.all({id: DatasetIds});
      }
    });
  };


  // Gets all columns with a certain tag

  Metadata.getColumnsByTagName = function(tagName) {
    var tag = getTagByName(tagName);
    var tagId = tag.id;
    return DataTags.all({where: {id: tagId, dataCategory: 'column'}}, function(err, ColumnIds){
      if(err) {
        console.log(err);
      } else {
        return DatasetColumns.all({id: ColumnIds});
      }
    });
  };


  // Returns the tab object for a given name

  Metadata.getTagByName = function(tagName) {
    return Tags.findOne({where: {label: tagName}});
  }

  // Return new lines from string

  Metadata.transformForPostgres = function(string) {
    return string.replace("\n", " ");
  }


  return Metadata;
};

  module.exports = metadataModel;

