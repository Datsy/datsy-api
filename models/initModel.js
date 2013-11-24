var initModel = function(){
  var Models = {};
  var q = require('q');
	var Schema = require('jugglingdb').Schema;
	var schema = new Schema('postgres', {
	  database: 'datsy',
	  username: 'woonketwong'
	  //port: 5432,
	  //hostname: "localhost",
	}); //port number depends on your configuration

	var JobApplicant = require('./jobApplicantModel.js')(schema);
	var EmailToken = require('./emailTokenModel.js')(schema);
  Models = {
  	JobApplicant: JobApplicant,
    EmailToken: EmailToken          
  };

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
  
  return Models;
}

module.exports = initModel;