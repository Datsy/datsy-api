var Tablecolumnmeta = function(schema){
  var Tablecolumnmeta = schema.define("tablecolumnmeta", {
    name: {type: "String", length: 45},
    datatype: {type: "String", length: 45},
    description: {type: "Text"}
  });

  return Tablecolumnmeta;
}

module.exports = Tablecolumnmeta;