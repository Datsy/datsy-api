var Schema = require('jugglingdb').Schema,
    User,
    Metadata,
    EmailToken,
    schema,
    Tag,
    Dataset,
    DataColumn,
    EventEmitter = require('events').EventEmitter;

var apiControllers = {
  'init': function(Models) {
    User = Models.User;
    Metadata = Models.Metadata;
    EmailToken = Models.EmailToken;
    console.log('init apiMeta search');
  },

  restartSchema: function(){
    schema = new Schema('postgres', {
      username: "masterofdata",
      password: "gj1h23gnbfsjdhfg234234kjhskdfjhsdfKJHsdf234",
      host: "137.135.14.92",
      database: "datsydata"
    });

    Tag = schema.define('datasettag', {
      label: {type: String, unique: true}
    });

    Dataset = schema.define('datasetmeta', {
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

    DataColumn = schema.define('datacolumnmeta', {
      name: {type: String},
      datatype: {type: String},
      description: {type: String}
    });

    Dataset.hasAndBelongsToMany(Tag, {as: 'datasettag', foreignKey: 'tag_id'});
    Tag.hasAndBelongsToMany(Dataset, {as: 'dataset', foreignKey: 'datasettag_id'});
    Dataset.hasMany(DataColumn, {as: 'datacolumnmeta', foreignKey: 'dataset_id'});

  },

  getAllMeta: function(req, res) {
    var controller = new EventEmitter();

    Dataset.all(function(err, data){
      if(err) {
        res.send("(custom message) - 500 Internal Server Error error:", err);
      } else {
        console.log("Successfully retrieved all table meta.");
        apiControllers.addColumn(data, controller);
      }
    });

    controller.on('addColumn',function(result){
      res.send(result);
    });
  },

  getSomeMeta: function(queryTag,req,res) {
    var taggedData = [];
    var tagsLeft = queryTag.length;
    var controller = new EventEmitter();
    for (var i = 0; i < queryTag.length; i++){
      Tag.all({where: {label: queryTag[i]}},
        function(err, data){
          console.log("Tag info:", data);
          if (data.length === 0) {
            res.send(taggedData);
            return;
          }
          var thisTag = new Tag({id:data[0].id});
          thisTag.dataset(function(err, data){
            console.log("Dataset Found:", data);
            taggedData.push(data);
            tagsLeft --;

            var doneId = setInterval(function(){
              console.log("taggedData.length:", taggedData.length);
              if (tagsLeft === 0){
                console.log("****Done:", taggedData);
                clearInterval(doneId);
                var result = filterTaggedData();
                apiControllers.addColumn(result, controller);
              }
            },500);
          });

        }
      );
    }
 
    controller.on('addColumn',function(result){
      console.log('column added, ready to send result');
      res.send(result);
    });

    var filterTaggedData = function(){
      var counter = {};//object that track how many meta
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
      // console.log("counter:", counter);  
      for(var key in counter){
        if (counter[key] === taggedData.length){
          result.push(tableMeta[key]);
        }
      }
      // console.log("result:", result);
      return result;
    };
  },

  addColumn: function(rawMetas, controller) {
    console.log('in add Column**************');
    if (rawMetas.length === 0) {
       controller.emit("addColumn",rawMetas);
    }
    var j = 0;
    for (var i = 0; i < rawMetas.length; i ++) {
      DataColumn.all({where:{dataset_id: rawMetas[i].id}}, function(err,data) {
        rawMetas[j]['columns'] = rawMetas[j]['columns'] || [];
        for (var k = 0; k < data.length; k ++) {
          rawMetas[j]['columns'][k] = {
            name: data[k]['name'],
            description: data[k]['description'],
            data_type: data[k]['datatype']
          };
        }
        j++;
        if (j >= rawMetas.length) { controller.emit("addColumn",rawMetas);}
      });
    }
  }

};

module.exports = apiControllers;
