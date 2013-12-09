var Sequelize = require('sequelize');
/*
var sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASS, {
  host: process.env.HOST,
  port: 5432,
  dialect: 'postgres',
  pool: { maxConnection: 3, maxIdleTime: 10 }
});


var datastore = new Sequelize(process.env.DATASTORE, process.env.USER, process.env.PASS , {
  host: process.env.HOST,
  port: 5432,
  dialect: 'postgres',
  pool: { maxConnection: 3, maxIdleTime: 10 }
});
*/

var sequelize = new Sequelize('datsydata', 'masterofdata', 'gj1h23gnbfsjdhfg234234kjhskdfjhsdfKJHsdf234', {
  host: '137.135.14.92',
  port: 5432,
  dialect: 'postgres',
  pool: { maxConnection: 3, maxIdleTime: 10 }
});


var datastore = new Sequelize('postgres', 'masterofdata', 'gj1h23gnbfsjdhfg234234kjhskdfjhsdfKJHsdf234', {
  host: '137.135.14.92',
  port: 5432,
  dialect: 'postgres',
  pool: { maxConnection: 3, maxIdleTime: 10 }
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
    description: json.description,
    author: json.author,
    created_at: json.created_at
  })
  .success(function(dataset) {
    var d = (new Date()).toISOString(),
        column,
        tag,
        str;


    // Recursively insert the columns

    var addColumns = function(columns, i) {
      column = columns[i];

      str = 'INSERT INTO "Columns" ("name", "datatype", "description", ' +
        '"createdAt", "updatedAt", "DatasetId") VALUES (\'' + column.name + '\', \'' +
        column.datatype + '\', \'' + column.description + '\', \'' + d + '\', \'' + d +
        '\', \'' + dataset.id + '\')';

      sequelize.query(str)
        .success(function(row) {
          console.log('i: ', i, '  length: ', columns.length);
          if (i < columns.length - 1) {
            addColumns(columns, i+1);
          } else {
            addTags(json.tags, 0);  // Create tags
          }
        });
    };


    // Recursively insert the columns

    var addTags = function(tags, i) {
      tag = tags[i];

      self.Tag.findAll({
        where: { label: tag }
      }).success(function(result) {

        if (result.length === 0) {

          // Tag does not exist, create it

          self.Tag.create({ label: tag })
            .success(function(newTag) {
              dataset.addTag(newTag)
                .success(function() {
                  console.log('New Tag: i = ', i, ',  length = ', tags.length, '  tag = ', newTag, '\n\n');
                  if (i < tags.length - 1) {
                    addTags(tags, i+1);
                  } else {
                    cb();
                  }
                }).error(function(err) { console.log('addTags: ', err); });
            }).error(function(err) { console.log('addTags: ', err); });

        } else {

          // Tag exists, associate it with this dataset

          dataset.addTag(result[0])
            .success(function(associatedTag) {
              console.log('Existing Tag: i = ', i, ',  length = ', tags.length, '  tag = ',associatedTag, '\n\n');
              if (i < tags.length - 1) {
                addTags(tags, i+1);
              } else {
                cb();
              }
            }).error(function(err) { console.log('addTags: ', err); });
        }
      }).error(function(err) { console.log('addTags: ', err); });
    };


    // Kickoff the process by creating columns first

    addColumns(json.columns, 0);

  }).error(function(err) {console.log(err);});
};


// Pass around the db connections

Models.sequelize = sequelize;
Models.datastore = datastore;


module.exports = Models;

