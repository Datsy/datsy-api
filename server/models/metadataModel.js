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


  return Metadata;
};

  module.exports = metadataModel;

