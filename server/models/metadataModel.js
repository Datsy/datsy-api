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

Models.saveDataset = function(json) {
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

    // Bulk create columns

    self.Column.bulkCreate(json.columns).success(function(columns) {
      dataset.setColumns(columns).success(function() {

        // Turn tags into {label: ___} objects

        var tagArray = self.tagObjects(json.tags);

        self.Tag.bulkCreate(tagArray).success(function(tags) {
          dataset.setTags(tags).success(function() {
            console.log('All Done!');
          }).error(function(err) {console.log(err);});
        }).error(function(err) {console.log(err);});
      }).error(function(err) {console.log(err);});
    }).error(function(err) {console.log(err);});
  }).error(function(err) {console.log(err);});;
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

