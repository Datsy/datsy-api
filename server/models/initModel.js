var initModel = function(){
  var Models = {};
  var q = require('q');
  // var setting = require('setting');
  var Schema = require('jugglingdb').Schema;
  var schema = new Schema('postgres', {
	database: 'datsy'
	// username: 'woonketwong'
	  //port: 5432,
	  //hostname: "localhost",
  }); //port number depends on your configuration

  var User = require('./userModel.js')(schema);
  var EmailToken = require('./emailTokenModel.js')(schema);
  // var Tablecolumnmeta = require('./userTableMeta/tablecolumnmeta.js')(schema);
  // var Tablemeta = require('./userTableMeta/tablemeta.js')(schema);
  // var Tabletag = require('./userTableMeta/tabletag.js')(schema);

  // Create the table relationships
  // Tablemeta.hasAndBelongsToMany(Tabletag, {as: 'tag', foreignKey: 'dataset_id'});
  // Tablemeta.hasMany(Tablecolumn, {as: 'datacolumn', foreignKey: 'dataset_id'});

	var updateSchema = function(){
	  var deferred = q.defer();
	  console.log("updating schema");
	  
	  schema.autoupdate(function(msg){
	    console.log("*** db schema update completed")
	    deferred.resolve('deferred resolved!!');
	  });
	  
	  return deferred.promise;
	};

	updateSchema().then(function(){
	});

  Models = {
  	User: User,
    EmailToken: EmailToken
  };

  return Models;
}

module.exports = initModel;