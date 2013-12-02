var Tablemeta = function(schema){
  var Tablemeta = schema.define("tablemeta", {
    table_id: {type: String, unique: true},
    user_id: {type: Number},
    url: {type: String},
    title: {type: String},
    description: {type: String},
    author: {type: String},
    created_at: {type: Date},
    row_count: {type: Number},
    col_count: {type: Number}
  });

  return Tablemeta;
};

module.exports = Tablemeta;
