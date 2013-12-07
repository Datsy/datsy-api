// Global requires

var passwordHash = require('password-hash'),
    crypto = require('crypto'),
    q = require('q'),
    fs = require('fs'),
    csvLoader = require('../helpers/csvLoader.js'),
    hat = require('hat'),
    mailer = require('../helpers/sendEmail.js'),
    middleware = require('../middleware/middleware.js'),
    binaryCSV = require('binary-csv');




var frontendControllers = {
  'index': function(req, res) {
    if (!middleware.isAuth(req)) {
      res.render('index');
    } else {
      res.render('index', {
        isAuthenticated: true,
        user: {
          username: req.user[0].name
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
          username: req.user[0].name
        }
      });
    }
  },


  'newdataset': function(req, res) {
    res.render('newdataset', {
      isAuthenticated: true,
      haveFile: false,
      user: {
        username: req.user[0].name
      }
    });
  },


  'profile': function(req, res) {
    req.session.passport.userType = "user";

    Dataset.findAll({
      where: {user_id: req.user[0].id}
    }).success(function(datasets) {
      console.log('found datasets');
      User.findAll({
        where:{password: req.user[0].password}
      }).success(function(user) {
        res.render('profile', {
          datasets: datasets,
          apiKey: user[0].api_key,
          isAuthenticated: true,
          user: {
            username: user[0].name
          }
        });
      });
    });
  },


  'loginFail': function(req, res) {
    console.log('login fail route');
    res.writeHead(200);
    res.end('fail');
  },


  'userSignupVerify': function(req, res) {

    EmailToken.find({
      where: {token: req.params.token}
    }).success(function(emailtoken) {
        if (emailtoken) {
          var apiKey = hat(bits=128, base=16);

          User.create({
            name: emailtoken.name,
            email: emailtoken.email,
            password: emailtoken.password,
            account: "user",
            api_key: apiKey
          }).success(function(user) {
             console.log('success!');
             res.render('login');
          });
        } else{
          res.writeHead(404);
          res.end();
        }
    });
  },


  'signup': function(req, res) {
    var token;
    crypto.randomBytes(20, function(ex, buf) {
      token = buf.toString('hex');

      EmailToken.create({
        name: req.body.name,
        email: req.body.email,
        password: passwordHash.generate(req.body.password),
        token: token
      }).success(function(emailtoken) {
        var confirmationLink = req.protocol + "://" +
            req.get('host') + req.url + "/" + emailtoken.token;

        var locals = {
          email: emailtoken.email,
          subject: 'Verify your Datsy account',
          name: emailtoken.name,
          confirmationLink: confirmationLink
        };

        mailer.sendOne('registrationVerif', locals, function(err, responseStatus, html, text) {
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
            username: req.user[0].name
          }
        });
      });
  },


  'saveDataset': function(req, res) {

    // Construct metadata JSON object

    var metadata = {
      table_name: req.body.dataset_title.replace(/ /g, '_').toLowerCase(),
      url: req.body.dataset_url,
      title: req.body.dataset_title,
      description: req.body.dataset_description,
      author: req.body.dataset_author,
      created_at: (new Date()).toUTCString(),
      view_count: 0,
      star_count: 0,
      row_count: req.body.count,
      col_count: 0,
      user_id: req.user[0].id
    };

    metadata.tags = req.body.dataset_tags.split(',');

    metadata.columns = [];
    for (key in req.body) {
      if (req.body.hasOwnProperty(key) && key.match('column_')) {
        metadata.columns.push({
          name: key.split('column_')[1],
          description: key.split('column_')[1],
          datatype: req.body[key]
        });
      }
    }

    metadata.col_count = metadata.columns.length;


    // Save to the datastore

/*
    var csvPath = req.body.uploadFile;
    csvLoader.saveDataset(csvPath, schema, metadata);
*/


    // Save the metadata

    models.saveDataset(metadata, function() {

      // Redirect to '/profile' with updated dataset object

      Dataset.findAll({
        where:{user_id: req.user[0].id}
      }).success(function(datasets) {
        if (!middleware.isAuth(req)) {
          res.render('index');
        } else {
          res.render('profile', {
            datasets: datasets,
            isAuthenticated: true,
            apiKey: req.user[0].api_key,
            user: {
              username: req.user[0].name
            }
          });
        }
      });
    });
 },

  'userTableMetaData': function(req, res) {
    console.log("In userTableMetaData");
    res.writeHead(200);
    res.end();
  },

  'apiSearchMeta': function(req, res){
    console.log("In apiSearchMeta");
    console.log("Query String parameters:", req.query.tag);

    if(req.query.tag === undefined){
      // 2) GET search/meta
      // - return all tables meta data
      Metadata.Dataset.all(function(err, data){
        if(err) {
          res.send("500 Internal Server Error error:", err);
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
        Metadata.Tag.all({where: {label: queryTag[i]}},
          function(err, data){
            console.log("Tag info:", data);
            if (data.length !== 0){
              var thisTag = new Metadata.Tag({id:data[0].id});
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
    console.log("Retrieving all tags...");
    var result = [];
    Metadata.Tag.all(function(err, data){
      if(err) {
        res.send("500 Internal Server Error error:", err);
      } else {
        console.log("Successfully retrieved all tags.");
        for(var i = 0; i < data.length; i++){
          result.push(data[i].label);
        }
        res.send(result);
      }
    });
  }
};



module.exports = function(Models) {
    User = Models.User;
    Dataset = Models.Dataset;
    Tag = Models.Tag;
    Column = Models.Column;
    EmailToken = Models.EmailToken;
    models = Models;
    schema = Models.sequelize;

    return frontendControllers;
}
