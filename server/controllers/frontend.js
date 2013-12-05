// Global require, module

var passwordHash = require('password-hash'),
    crypto = require('crypto'),
    q = require('q'),
    fs = require('fs'),
    csv = require('csv'),
    csvToDatabase = require('../helpers/csvToDatabase.js'),
    csvLoader = require('../helpers/csvLoader.js'),
    hat = require('hat'),
    mailer = require('../helpers/sendEmail.js'),
    middleware = require('../middleware/middleware.js'),
    binaryCSV = require('binary-csv'),
    User,
    Metadata,
    EmailToken,
    schema,
    frontendControllers;
var Schema = require('jugglingdb').Schema;

var updateSchema = function(){
    var deferred = q.defer();
    console.log("updating schema");

    schema.autoupdate(function(msg){
      console.log("*** db schema update completed");
      deferred.resolve('deferred resolved!!');
    });

    return deferred.promise;
};

frontendControllers = {
  'init': function(Models, dataSchema) {
    User = Models.User;
    Metadata = Models.Metadata;
    EmailToken = Models.EmailToken;
    schema = dataSchema;
  },

  'index': function(req, res) {
    if (!middleware.isAuth(req)) {
      res.render('index');
    } else {
      res.render('index', {
        isAuthenticated: true,
        user: {
          username: req.user.name
        }
      });
    }
  },

  'login': function(req, res) {
    res.render('login');
  },

  'about': function(req, res) {
    if (!middleware.isAuth(req)) {
      res.render('about');
    } else {
      res.render('about', {
        isAuthenticated: true,
        user: {
          username: req.user.name
        }
      });
    }
  },

  'newdataset': function(req, res) {
    res.render('newdataset', {
      isAuthenticated: true,
      haveFile: false,
      user: {
        username: req.user.name
      }
    });
  },

  'profile': function(req, res) {
      req.session.passport.userType = "user";

      Metadata.Dataset.all({where: {user_id: req.user.id}}, function(err, datasets) {
        if (err) {
          res.writeHead(500);
          res.end("500 Internal Server Error error:", err);
        } else {

          User.all({where:{password: req.user.password}}, function(err, result) {
            if (err) {
              res.writeHead(500);
              res.end("500 Internal Server Error error:", err);
            } else {
              var view_count = 0;
              for (var i = 0; i < datasets.length; i++) {
                view_count += +datasets[i].view_count;
              }
              res.render('profile', {
                datasets: datasets,
                view_count: view_count,
                apiKey: req.user.apikey,
                isAuthenticated: true,
                user: {
                  username: req.user.name
                }
              });
            }
          });
        }
      });
  },

  'loginFail': function(req, res) {
    console.log('login fail route');
    res.writeHead(200);
    res.end('fail');
  },

  'userSignupVerify': function(req, res) {
    EmailToken.findOne({where: {token: req.params.token}},
      function (err, result) {
        if (err) {
          console.log("ERROR - userSignupVerify aborted!!");
        }

        if (result === null){ //no email token found
          console.log("ERROR - no email token found!!");
          res.writeHead(404);
          res.end();
        } else{
          var apiKey = hat(bits=128, base=16);
          var newUser = new User({
            name: result.name,
            email: result.email,
            password: result.password,
            account: "user",
            apikey: apiKey
          });

          User.findOne({where: {email: newUser.email}},
            function (err, result) {
              if (err) {
                console.log("ERROR - creating (userSignupVerify) user aborted!!");
                console.log("ERROR:",err);
              }

              if (result === null) { // create user
                newUser.save(function (err, data) {
                  if (err) console.log("ERR!!! - ",err);
                  res.render('login');
                });
              } else {
                console.log('That user exists: ', result);
                res.writeHead(500);
                res.end("500 Internal Server Error - user existed, could not create account");
              }
          });
        }
    });
  },

  'signup': function(req, res) {
    var newEmailToken = new EmailToken({
      name: req.body.name,
      email: req.body.email,
      password: passwordHash.generate(req.body.password),
      phone: req.body.phone,
      token: ''
    });
    var token;

    function createToken(){
      var deferred = q.defer();
      crypto.randomBytes(20, function(ex, buf) {
        token = buf.toString('hex');
        deferred.resolve('deferred resolved!!');
      });
      return deferred.promise;
    }

    createToken().then(function(){

      newEmailToken.token = token;
      newEmailToken.save(function (err) {
        if (err) {
          console.log("ERROR in saving new email token!!!");
          console.log("ERROR:",err);
        }
      var deferred = q.defer();
        var confirmationLink = req.protocol + "://" + req.get('host') + req.url + "/" + newEmailToken.token;
        var locals = {
          email: newEmailToken.email,
          subject: 'Verify your Datsy account',
          name: newEmailToken.name,
          confirmationLink: confirmationLink
        };
        mailer.sendOne('registrationVerif', locals, function(err, responseStatus, html, text){
          if (err){
            console.log("ERROR in sending registration verification email to user!!!");
            console.log("ERR MSG:", err);
          } else {
            console.log("Registration verification email sent successfully to:", locals.email);
          }
        });

        res.render('verifyEmail');
      });
    });
  },

  'checkEmailIfExists': function(req,res) {

    User.findOne({email: req.query.email}, 'email',
      function (err, result) {
        if (err) {
          console.log("ERROR - checkEmailIfExists aborted!!");
        }
        if (result === null) {
          res.writeHead(200);
          res.end("true");
        } else{
          res.writeHead(204);
          res.end("false");
        }
    });
  },

  'userReadInfo': function(req, res) {
    var userModel = User;
    var newUser = new user(req.body);

    userModel.findOne({name: newUser.name, email: newUser.email}, 'name email',
      function (err, result) {
        if (err) {
          console.log("ERROR - read user info aborted!!");
        }
        if (result !== null) {
          // console.log("*****DATA*****",data);
          res.writeHead(200);
          res.end(result);
        }
    });
  },

  'uploadFile': function(req, res) {
    var csvPath = req.files.uploadFile.path,
        parser = binaryCSV(),
        count = 0,
        columns;

    var stream = fs.createReadStream(csvPath).pipe(parser)
      .on('data', function(line) {
        if (count === 0) {
          columns = line.toString().split(',');
          count++;
        } else {
          count++
        }
      })
      .on('close', function() {
        res.render('newdataset', {
          isAuthenticated: true,
          columns: columns,
          path: csvPath,
          count: count,
          file: req.files.uploadFile.name,
          user: {
            username: req.user.name
          }
        });
      });
  },

  'saveDataset': function(req, res) {

    // Construct metadata JSON object

    var tableMetaData = {
      user_id: req.user.id,
      title: req.body.dataset_title,
      description: req.body.dataset_description,
      author: req.body.dataset_author,
      url: req.body.dataset_url,
      created_at: (new Date()).toUTCString(),
      last_accessed: (new Date()).toUTCString(),
      row_count: req.body.count,
      view_count: 0,
      stars: 0
    };

    tableMetaData.table_name = tableMetaData.title.replace(/ /g, '_').toLowerCase();
    tableMetaData.tags = req.body.dataset_tags.split(',');

    // Save the selected CSV file to the server

    var csvPath = req.body.uploadFile;

    tableMetaData.columns = [];
    for (key in req.body) {
      if (req.body.hasOwnProperty(key) && key.match('column_')) {
        tableMetaData.columns.push({
          name: key.split('column_')[1],
          description: key.split('column_')[1],
          datatype: req.body[key]
        });
      }
    }

    // Set the col_count

    tableMetaData.col_count = tableMetaData.columns.length;

    // Save to the datastore

    csvLoader.saveDataset(csvPath, schema, tableMetaData);

    // Save the metadata

    Metadata.saveDataset(tableMetaData);

    // Read table meta data

    Metadata.Dataset.all({where:{user_id: req.user.id}}, function(err, datasets) {
      if (err) {
        res.writeHead(500);
        res.end("500 Internal Server Error error:", err);
      } else {
        if (!middleware.isAuth(req)) {
          res.render('index');
        } else {
          res.render('profile', {
            datasets: datasets,
            isAuthenticated: true,
            apiKey: req.user.apikey,
            user: {
              username: req.user.name
            }
          });
        }
      }
    });
 },

 'generateApiKey': function(req, res) {
    var apiKey = hat(bits=128, base=16);

    User.findOne({where:{password: req.user.password}}, function(err, user) {
        if (err) {
          console.log("ERROR in saving API key!");
          res.writeHead(500);
          res.end("500 Internal Server Error error:", err);
        } else {
          user.apikey = apiKey;
          User.upsert(user, function (err, data) {
            if (err){
              console.log('** ERROR in updating user API key **');
              console.log("ERR!!! - ",err);
            } else{
              console.log('** user update with API key is successful ** ');
            }

            return;
          });
        }
    });
  },

  'userTableMetaData': function(req, res) {
    console.log("In userTableMetaData");
    res.writeHead(200);
    res.end();
  },

  'apiSearchMeta': function(req, res){
    var schema2 = new Schema('postgres', {
      username: "masterofdata",
      password: "gj1h23gnbfsjdhfg234234kjhskdfjhsdfKJHsdf234",
      host: "137.135.14.92",
      database: "datsydata"
    });

    Tag = schema2.define('datasettag', {
      label: {type: String, unique: true}
    });

    Dataset = schema2.define('datasetmeta', {
      table_name: {type: String, unique: true},
      user_id: {type: Number},
      url: {type: String},
      title: {type: String},
      description: {type: String},
      author: {type: String},
      created_at: {type: Date},
      last_access: {type: Date},
      view_count: {type: Number},
      star_count: {type: Number},
      row_count: {type: Number},
      col_count: {type: Number}, 
      last_viewed:{type: Date},
      view_count:{type: Number},
      token: {type: String}
    });

    Dataset.hasAndBelongsToMany(Tag, {as: 'datasettag', foreignKey: 'tag_id'});
    Tag.hasAndBelongsToMany(Dataset, {as: 'dataset', foreignKey: 'datasettag_id'});

    console.log("In apiSearchMeta");
    console.log("Query String parameters:", req.query.tag);

    if(req.query.tag === undefined){
      // 2) GET search/meta
      // - return all tables meta data
      Dataset.all(function(err, data){
        if(err) {
          res.send("(custom message) - 500 Internal Server Error error:", err);
        } else {
          console.log("Successfully retrieved all table meta.");
          res.send(data);
        }
      });
    } else {
      // 3) GET search/meta?tag=<tagname>&tag=<tagname>
      // - return meta data of tables associated with these <tagname>s.

      // dataset associated with each tag
      taggedData = [];
      // copy req.query.tag into queryTag
      var queryTag = [];
      if ( Array.isArray(req.query.tag) ){
        for (var i = 0; i < req.query.tag.length; i++){
          queryTag[i] = req.query.tag[i];
        }
      } else {
        queryTag.push(req.query.tag);
      }
     
      console.log("queryTag:", queryTag);
      for (var i = 0; i < queryTag.length; i++){
        Tag.all({where: {label: queryTag[i]}},
          function(err, data){
            console.log("Tag info:", data);
            if (data.length !== 0){
              var thisTag = new Tag({id:data[0].id});
              thisTag.dataset(function(err, data){
                console.log("Dataset Found:", data);
                taggedData.push(data);
              });
            } else {
              // to facilitate the return of an empty array 
              // in the following code
              taggedData.push([]);
            }
          }
        );
      }
   
      var doneId = setInterval(function(){
            console.log("taggedData.length:", taggedData.length);
            if (taggedData.length === queryTag.length){
              console.log("****Done:", taggedData);
              clearInterval(doneId);
              var result = filterTaggedData();
              res.send(result);
            }
          }
          ,500
      );

      var filterTaggedData = function(){
        var counter = {};
        var tableMeta = {};
        var result = [];
        for (var i = 0; i < taggedData.length; i++){
          for (var j = 0; j < taggedData[i].length; j++){
            if (taggedData[i][j] !== null){
              if (counter.hasOwnProperty(taggedData[i][j].id)){
                counter[taggedData[i][j].id] += 1;
              } else {
                tableMeta[taggedData[i][j].id] = taggedData[i][j];
                counter[taggedData[i][j].id] = 1;
              }
            }
          }        
        }
        console.log("counter:", counter);  
        for(var key in counter){
          if (counter[key] === taggedData.length){
            result.push(tableMeta[key]);
          }
        }
        console.log("result:", result);
        return result;
      };
    }
  },

  'apiSearchTags': function(req, res){
    var schema2 = new Schema('postgres', {
      username: "masterofdata",
      password: "gj1h23gnbfsjdhfg234234kjhskdfjhsdfKJHsdf234",
      host: "137.135.14.92",
      database: "datsydata"
    });

    Tag = schema2.define('datasettag', {
      label: {type: String, unique: true}
    });

    Dataset = schema2.define('datasetmeta', {
      table_name: {type: String, unique: true},
      user_id: {type: Number},
      url: {type: String},
      title: {type: String},
      description: {type: String},
      author: {type: String},
      created_at: {type: Date},
      last_access: {type: Date},
      view_count: {type: Number},
      star_count: {type: Number},
      row_count: {type: Number},
      col_count: {type: Number}, 
      last_viewed:{type: Date},
      view_count:{type: Number},
      token: {type: String}
    });

    Dataset.hasAndBelongsToMany(Tag, {as: 'datasettag', foreignKey: 'tag_id'});
    Tag.hasAndBelongsToMany(Dataset, {as: 'dataset', foreignKey: 'datasettag_id'});

    console.log("Retrieving all tags...");
    var result = {
      tag: [],
      total: 0
    };
    Tag.all(function(err, data){
      if(err) {
        res.send("500 Internal Server Error error:", err);
      } else {
        console.log("Successfully retrieved all tags.");
        var i,j,tag, dataLeft = data.length, obj = {};

        for(i = 0; i < data.length; i++) {
          result.tag.push(data[i].label);
          tag = new Tag({id:data[i].id});
          tag.dataset(function(err,dataset) {
            for(j = 0; j < dataset.length; j ++) {
              seenId = dataset[j].id;
              if (!obj[seenId]) {
                obj[seenId] = true;
              }
            }
            dataLeft --;
          });
        }
        var intervalID = setInterval(function(){
          if (dataLeft === 0) {
            result.total = Object.keys(obj).length;
            res.send(result);
            clearInterval(intervalID);
          }
        }, 100);
      }
    });
  }, 

  'apiSearchTable': function(req, res){
    var metaDataResult = {};
    var finalMetaDataResult = {};
    var resultLength = 0;
    var expectedResultLength = undefined;
    var rowNumber;
    var filterColumn = [];

    if (req.query.name !== undefined){
      // setup number of row to return
      if (req.query.row === undefined){
        // if row is not specified, default to this
        rowNumber = 5;    
      } else if (req.query.row === "ALL"){
        // this will read all rows
        rowNumber = '';
      } else {
        rowNumber = req.query.row;
      }

      // set up column type to return
      if (req.query.column === undefined){
        // if column is not specified, default to an empty array
        filterColumn = [];
      } else {
        if (typeof req.query.column === "string"){
          console.log("******Is STRING!!!!!");
          filterColumn.push(req.query.column);
        } else {
          console.log("******Is NOT STRING!!!!!");
          filterColumn = req.query.column;
        }
      }

      var result = Metadata.Dataset.all({where:{table_name: req.query.name}}, function(err, data){
        console.log("Here1");
        expectedResultLength = data.length;
        resultLength = data.length;
        console.log("*****Search Result:", data);
        console.log("Here2");
        for (var i = 0; i < data.length; i++){
          metaDataResult[data[i].id] = {tableMeta: data[i]};
          // metaDataResult.push(metaData);
          console.log("metaDataResult:", metaDataResult);
          console.log("Metadata.Dataset start searching");
          var j = i;

          (function(j){
              console.log("---->>>before JJJJ", j);

            Metadata.DataColumn.all({where:{dataset_id:data[0].id}}, function(err, data){
              console.log("Here3");
              console.log("---->>>JJJJ", j);
              console.log("*****Data column:", data);
              var columnDefines = {};
              var currentDatasetId = data[j].dataset_id;
              for(var i = 0; i < data.length; i++){
                columnDefines[data[i].name.toLowerCase()] = {type: data[i].datatype};
              }
              console.log("---Column Defines:", columnDefines);
              console.log("metaDataResult[data[j].dataset_id]:",metaDataResult[currentDatasetId]["tableMeta"]);
              console.log("---table name:", metaDataResult[currentDatasetId]["tableMeta"]["table_name"]);
              var thisTable = schema.define(metaDataResult[currentDatasetId]["tableMeta"]["table_name"],columnDefines);

              updateSchema().then(function(){
                thisTable.all({limit:rowNumber}, function(err, data){
                  console.log("--->Table SEARCHED!!", data);
                  console.log("---->>>JJJJ", j);
                  console.log("----->>>>>data[j].id", data[j].id);
                  metaDataResult[currentDatasetId]["row"] = data;
                  if (filterColumn.length != 0){
                    metaDataResult[currentDatasetId]["row"] = filterDatabaseColumn(metaDataResult[currentDatasetId]["row"], filterColumn);
                  };
                  finalMetaDataResult["Result"] = metaDataResult[currentDatasetId];
                  console.log("Final metaDataResult:", finalMetaDataResult);
                  res.send(finalMetaDataResult);
                });
              });
            })
          })(j);
        }
      });

      var doneId = setInterval(function(){
          console.log("resultLength", resultLength);
          console.log("dataFoundLength", expectedResultLength);
          if (resultLength === expectedResultLength){
            console.log("****Done");
            clearInterval(doneId);
          }
        }
        ,3000
      );
    } else {
      var message = "ERROR: the query string, 'name' is not found in the endpoint request";
      res.send(message); 
    }

    var filterDatabaseColumn = function(rowResult, filter){
      console.log("** Filter Column filter:", filter);
      var newRowResult = [];
      var tempRow = {};
      for (var i = 0; i < rowResult.length; i++){
        for (var j = 0; j < filter.length; j++){
            console.log("** current filter:", filter);
            console.log("** current row:", rowResult[i]);
            console.log("** current match:", Object.prototype.hasOwnProperty.call(rowResult[i], 'category'));
          if (rowResult[i][filter[j]] !== undefined){
            console.log("** matched:", filter[j]);
            tempRow[filter[j]] = rowResult[i][filter[j]];
          }
        }
        newRowResult.push(tempRow);
        tempRow = {};
      }
      return newRowResult;
    }
  }
};


module.exports = frontendControllers;

