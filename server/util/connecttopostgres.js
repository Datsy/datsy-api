var pg = require('pg');

var conString = "postgres://masterofdata:gj1h23gnbfsjdhfg234234kjhskdfjhsdfKJHsdf234@137.135.14.92/postgres";

// postgres@datsypostgres:

var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('CREATE TABLE DEPARTMENT(ID INT PRIMARY KEY      NOT NULL, DEPT           CHAR(50) NOT NULL);', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log('created table');
    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
    client.end();
  });
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].theTime);
    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
    client.end();
  });
});