var initModel = function(app){
  var Models = {};
  var q = require('q');
  var config = require('../../config.js');
  var dbSetting = app? config[app.get('env')].database : config.production.database;
  var dbStore = app? config[app.get('env')].datastore : config.production.datastore;

  // console.log(dbSetting,'dbSetting');
  // var setting = require('setting');
  var Schema = require('jugglingdb').Schema;
  var schema = new Schema('postgres', {
    username: dbSetting.user,
    password: dbSetting.password,
    host: dbSetting.host,
    database: dbSetting.dbname
  });

  // Datastore schema
  var datastore = new Schema('postgres', {
    username: dbStore.user,
    password: dbStore.password,
    host: dbStore.host,
    database: dbStore.dbname
  });

  var User = require('./userModel.js')(schema);
  var EmailToken = require('./emailTokenModel.js')(schema);

  // var Tablecolumnmeta = require('./userTableMeta/tablecolumnmeta.js')(schema);
  // var Tablemeta = require('./userTableMeta/tablemeta.js')(schema);
  // var Tabletag = require('./userTableMeta/tabletag.js')(schema);

  // Create the table relationships
  // Tablemeta.hasAndBelongsToMany(Tabletag, {as: 'tag', foreignKey: 'dataset_id'});
  // Tablemeta.hasMany(Tablecolumn, {as: 'datacolumn', foreignKey: 'dataset_id'});

  var Metadata = require('./metadataModel.js')(schema);

  Models = {
    User: User,
    EmailToken: EmailToken,
    Metadata: Metadata
  };

  var updateSchema = function(){
    var deferred = q.defer();
    console.log("updating schema");

    schema.autoupdate(function(msg){
      console.log("*** db schema update completed");
      deferred.resolve('deferred resolved!!');
    });

    return deferred.promise;
  };

  updateSchema().then(function(){
  });

  return {
    Models: Models,
    schema: datastore
  };
};

module.exports = initModel;
