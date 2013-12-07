var Sequelize = require('sequelize');
var sequelize = new Sequelize('datsydb', 'bhc', '123', {
    dialect: 'postgres'
});


/**
 *  Define the table schemas
 */

var Models = {

 Dataset: sequelize.define('Dataset', {
    table_name: {type: Sequelize.STRING, unique: true},
    url: {type: Sequelize.STRING},
    title: {type: Sequelize.STRING},
    description: {type: Sequelize.STRING},
    author: {type: Sequelize.STRING},
    created_at: {type: Sequelize.DATE},
    view_count: {type: Sequelize.INTEGER, defaultValue: 0},
    star_count: {type: Sequelize.INTEGER, defaultValue: 0},
    row_count: {type: Sequelize.INTEGER},
    col_count: {type: Sequelize.INTEGER},
    user_id: {type: Sequelize.INTEGER}
  }),


  Tag: sequelize.define('Tag', {
    label: {type: Sequelize.STRING, unique: true}
  }),


  Column: sequelize.define('Column', {
    name: {type: Sequelize.STRING},
    datatype: {type: Sequelize.STRING},
    description: {type: Sequelize.STRING}
  }),


  User: sequelize.define('User', {
    name: {type: Sequelize.STRING},
    email: {type: Sequelize.STRING},
    password: {type: Sequelize.STRING},
    api_key: {type: Sequelize.STRING},
    account: {type: Sequelize.STRING}
  }),


  EmailToken: sequelize.define('EmailToken', {
    name: {type: Sequelize.STRING},
    email: {type: Sequelize.STRING},
    password: {type: Sequelize.STRING},
    token: {type: Sequelize.STRING}
  })
};


/**
 *  Define the model relationships
 */

Models.Dataset.hasMany(Models.Column);
Models.Dataset.hasMany(Models.Tag);
Models.Tag.hasMany(Models.Dataset);


/**
 *  Create all of the models defined above
 */

sequelize.sync();


/**
 * Define helper functions
 */

Models.saveDataset = function(json, cb) {
  var self = this;

  this.Dataset.create({
    table_name: json.table_name,
    title: json.title,
    col_count: json.col_count,
    row_count: json.row_count,
    user_id: json.user_id,
    url: json.url,
    title: json.title,
    description: json.description,
    author: json.author,
    created_at: json.created_at
  })
  .success(function(dataset) {

      var addAssociation = function(columns, i) {
        var column = columns[i];
        var d = (new Date()).toISOString();
        sequelize.query('INSERT INTO "Columns" ("name", "datatype", "description", ' +
            '"createdAt", "updatedAt", "DatasetId") VALUES (' + column.name + ', ' +
            column.datatype + ', ' + column.description + ', ' + d + ', ' + d +
            ', ' + dataset.id + ')')
        .success(function(row) {
          console.log('i: ', i, '  length: ', columns.length);
          if (i < columns.length) {
            addAssociation(columns, i+1);
          } else {
            cb();
          }
        });

/*
        var column = self.Column.build(columns[i]);
        dataset.addColumn(column).success(function(obj) {
         console.log('i: ', i, '  length: ', columns.length);
              if (i < columns.length) {
                addAssociation(columns, i+1);
              } else {
                cb();
              }
        }).error(function(err) { console.log(err); });
*/
      };

      addAssociation(json.columns, 0);
/*
        // Turn tags into {label: ___} objects

        var tagArray = self.tagObjects(json.tags);

        self.Tag.bulkCreate(tagArray).success(function(tags) {
          dataset.setTags(tags).success(function() {
            console.log('All Done!');
          }).error(function(err) {console.log(err);});
        }).error(function(err) {console.log(err);});
      }).error(function(err) {console.log(err);});
*/
  }).error(function(err) {console.log(err);});
};


Models.tagObjects = function(tags) {
  var obj = [];
  for (var i = 0; i < tags.length; i++) {
    obj.push({
      label: tags[i]
    });
  }

  return obj;
};


Models.sequelize = sequelize;



module.exports = Models;

