var credentials = require('./config/dbconfig.json').db;
var Schema = require('jugglingdb').Schema;
var schema = new Schema('postgres', {
  database: 'metadata1',
  username: credentials.user,
  host: credentials.localhost,
  password: credentials.password
});

var Dataset = schema.define('dataset', {
  url: { type: String, length: 255 },
  name: { type: String, length: 255 },
  title: { type: String, length: 255 },
  description: { type: Schema.Text },
  author: { type: String, length: 255 },
  date_added: { type: Date, default: function() { return new Date; } },
  numrows: { type: Number },
  numcols: { type: Number }
});

var DatasetColumns = schema.define('datasetcolumns', {
  table_id: { type: Number },
  col_name: { type: String, length: 45 },
  col_datatype: { type: String, length: 45 },
  col_meaning: { type: Schema.Text }
});

var Tags = schema.define('tags', {
  label: { type: String, length: 45 }
});

var DataTags = schema.define('datatags', {
  data_category: { type: String, length: 15 },
  data_id: { type: Number },
  tag_id: { type: Number }
});
  
// Dataset.hasMany(DatasetColumns, {as: 'column', foreignKey: 'tableId' });
ALTER TABLE datasetcolumns
ADD FOREIGN KEY (table_id) 
REFERENCES public.department(dnumber)
// DatasetColumns.belongsTo(Dataset, {as: 'dataset', foreignKey: 'tableId'});

// Tags.hasMany(DataTags, {as: 'datatag', foreignKey: 'tagId'});
// DataTags.hasOne(Tags, {as: 'tag', foreignKey: 'tagId'});

schema.autoupdate(function(msg){
  console.log("*** db schema update is done", msg);
  // Dataset.create({url: 'laladifjsdljf45452'});
    // var dbset = new Dataset({
    //   url: 'blah'
    // });

    // dbset.save(function(err) {
    //   if (err) console.log('there is a major erro!!');
    // });
  });
