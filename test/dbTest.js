var q = require('q');
var Schema = require('jugglingdb').Schema;
var schema = new Schema('postgres', {
  database: 'woonketwong',
  username: 'woonketwong'
});

// The first argument to schema.define is the table
// and schema name. Do not use any capital letter 
// in the table name because the database create table
// in low case letters.
var Computercup6 = schema.define("computercup6", {
  name: {type: String},
  email: {type: String},
});

// The schema.autoupdate function is asynchronous
// If you start saving to a table before it is created, 
// postgres throws error.
// Therefore, I created this updateSchema function with 
// q and promise to make sure accesses to table
// doesn't happen until it is created 
var updateSchema = function(){
  var deferred = q.defer();
  console.log("updating schema");
  
  schema.autoupdate(function(msg){
    console.log("*** db schema update is done", msg)
    deferred.resolve('deferred resolved!!');
  });
  
  return deferred.promise;
}

// call updateSchema, and write to the table
updateSchema().then(function(){
  var computercup6 = new Computercup6({
      name: "William6",
      email: "William@hotmail.com"
  });

  computercup6.save(function (err) {
    if (err) {
      console.log("ERROR in writing to table!!!");
      console.log("ERROR:",err);
    }
    console.log("**end**");
  });
})

