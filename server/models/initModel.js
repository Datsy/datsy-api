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
    database: dbSetting.dbname,
    debug: true
  });


  var Sequelize = require('sequelize');
  var sequelize = new Sequelize(dbSetting.dbname, dbSetting.user, dbSetting.password, {
    host: dbSetting.host,
    dialect: 'postgres'
  });

  // Datastore schema
/*
  var datastore = new Schema('postgres', {
    username: dbStore.user,
    password: dbStore.password,
    host: dbStore.host,
    database: dbStore.dbname,
    debug: true
  });
*/

  var User = require('./userModel.js')(schema);
  var EmailToken = require('./emailTokenModel.js')(schema);
  //var Metadata = require('./metadataModel.js')(schema);

  Models = {
    User: User,
    EmailToken: EmailToken,
   // Metadata: Metadata
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
    schema: schema
  };
};

module.exports = initModel;
