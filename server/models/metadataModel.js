var metadataModel = function(schema) {

  // Namespace for the Metadata tables / relationships

  var Metadata = {};

  //  Define the table schemas

  Metadata.Dataset = schema.define('dataset', {
    tableName: {type: String},
    url: {type: String},
    title: {type: String},
    description: {type: String},
    author: {type: String},
    date_added: {type: Date},
    row_count: {type: Number},
    col_count: {type: Number}
  });


  Metadata.Tag = schema.define('tag', {
    label: {type: String}
  });


  Metadata.DataColumn = schema.define('datacolumn', {
    name: {type: String, length: 45},
    datatype: {type: String, length: 45},
    description: {type: Schema.Text}
  });


  // Create the table relationships

  Metadata.DDataset.hasAndBelongsToMany(Metadata.Tag, {as: 'tag', foreignKey: 'dataset_id'});

  Metadata.Dataset.hasMany(Metadata.DataColumn, {as: 'datacolumn', foreignKey: 'dataset_id'});


  // define helper functions


  Metadata.prototype.saveDatasetInDb = function(jsonMetadata) {
    
    var dataset         = new Dataset();
    dataset.url         = jsonMetadata.url;
    dataset.name        = jsonMetadata.name;
    dataset.title       = jsonMetadata.title;
    dataset.description = transformForPostgres(jsonMetadata.description);
    dataset.author      = jsonMetadata.author;
    dataset.user_id     = jsonMetadata.user_id;
    dataset.numcols     = jsonMetadata.numcols;
    
    dataset.save(function(err, dataset) {
      if(err) {
        console.log(err);
      } else {
        saveDatasetColumnsInDb(dataset);  
      }
    });
  },

  Metadata.prototype.saveDatasetInDbFromFile = function(filepath) {
    var json = require(filepath);
    saveDatasetInDb(json);
  },

  Metadata.prototype.saveDatasetColumnsInDb = function(dataset) {
    for(var i = 0; i < dataset.columns.length; i++) {
      var column = dataset.columns[i];
      DatasetColumns.create({
        table_id: dataset.id,
        colName: column.name,
        colDatatype: column.datatype,
        colMeaning: column.meaning
      }, function(err, data) {
        if(err) {
          console.log(err);
        } else {
          return data;
        }
      });
    }
  },

  Metadata.prototype.getColumnsByDatatype = function(datatypeString) {
    return DatasetColumns.all({colDatatype: datatypeString}, function(err, DatasetColumns){
      if(err) {
        console.log(err);
      } else {
        return DatasetColumns;
      }
    });
  },

  Metadata.prototype.getDatasetsByTagName = function(tagName) {
    // tagName -> array of Datasets
    var tag = getTagByName(tagName);
    return DataTags.all({where: {id: tag.id, dataCategory: 'set'}}, function(err, DatasetIds){
      if(err) {
        console.log(err);
      } else {
        return Datasets.all({id: DatasetIds});
      }
    });
  },

  Metadata.prototype.getColumnsByTagName = function(tagName) {
    var tag = getTagByName(tagName);
    var tagId = tag.id;
    return DataTags.all({where: {id: tagId, dataCategory: 'column'}}, function(err, ColumnIds){
      if(err) {
        console.log(err);
      } else {
        return DatasetColumns.all({id: ColumnIds});
      }
    });
  },
  
  Metadata.prototype.getTagByName = function(tagName) {
    return Tags.findOne({where: {label: tagName}});
  }

  /*
    Helpers
  */
  Metadata.prototype.transformForPostgres = function(string) {
    return string.replace("\n", " ");
  }

  return Metadata;
};

  module.exports = metadataModel;

