var Tablemeta = function(schema){
  var Tablemeta = schema.define("tablemeta", {
    name: {type: "String"},
    url: {type: "String"},
    description: {type: "String"},
    author: {type: "String"},
    created_at: {type: "Date"},
    row_count: {type: "Number"},
    col_count: {type: "Number"}
  });

  return Tablemeta;
};

module.exports = Tablemeta;
