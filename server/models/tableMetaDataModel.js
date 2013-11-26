var TableMetaDataModel = function(schema){
  var TableMetaData = schema.define("tablemetadata", {
    name: {type: String},
    description: {type: String},
    author: {type: String},
    rowcount: {type: Number},
    attributes: {type: String}
  })

  return TableMetaData;
}

module.exports = TableMetaDataModel;