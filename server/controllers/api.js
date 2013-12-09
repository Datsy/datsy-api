var User, Dataset, Tag, Column,
    models, schema, datastore,
    apiControllers;

apiControllers = {

  /**
   * Function:  getTags()
   *
   * Retreives the number of datasets associated with all of the tags in the query
   * set and a list of all tags associated with this subset of datasets. Note
   * an empty query set will retreive the full list of tags and count the entire
   * number of datasets in the datastore.
   */

  'getTags': function(req, res) {

    // Helper function to get the number of datasets associated with a set of tags

    var createResult = function(res, datasets, queryTags) {

      var result = {};
      result.tag = [];
      result.total = 0;


      // Count the datasets that are associated with all queried tags

      var datasetIds = [];

      for (var j = 0; j < datasets.length; j++) {
        if (datasets[j].tags.length === queryTags.length) {
          result.total++;
          datasetIds.push(datasets[j].id);
        }
      }


      // Save all unique tags that are in the resulting datasets

      Dataset.findAll({
        where: { id: datasetIds },
        include: [Tag],
        attributes: ['Datasets.id', 'Tags.label']
      }).success(function(datasets) {

        var seen = {};

        for (var j = 0; j < datasets.length; j++) {
          var dataset = datasets[j];
          for (var k = 0; k < dataset.tags.length; k++) {
            var tag = dataset.tags[k];
            if(!seen[tag.label]) {
              seen[tag.label] = true;
              result.tag.push(tag.label);
            }
          }
        }

        res.send(result);
      });

    };


    // Retrieve dataset count and list of all tags associated with the subset of
    // datasets that match one or more of the queried tags (or all if no tags
    // are specified)

    if (!req.query.tag) {

      var result = {};
      result.tag = [];
      result.total = 0;

      // No tags specified, so get all tags and count all datasets

      Tag.findAll({
        attributes: ['label']
      }).success(function(tags) {
        for (var i = 0; i < tags.length; i++) {
          result.tag.push(tags[i].label);
        }

        Dataset.count().success(function(datasets) {
          result.total = datasets;
          res.send(result);
        });
      });

    } else {

      // One or more tags specified, so get only those that match at least one

      if (typeof req.query.tag === 'string') {
        req.query.tag = req.query.tag.toLowerCase();
        req.query.tag = [ req.query.tag ];
      } else {
        for (var j = 0; j < req.query.tag.length; j++) {
          req.query.tag[j] = req.query.tag[j].toLowerCase();
        }
      }

      Dataset.findAll({
        include: [Tag],
        where: { 'Tags.label': req.query.tag }
      }).success(function(datasets) {
        createResult(res, datasets, req.query.tag);
      });

     }
   },


   /**
    *  Function:  getMetadata()
    *
    *  Returns the metadata for all tables that are associated with a set of tags.
    *  Note an empty tag query set will result in the return of the metadata for
    *  all datasets in the datastore.
    */

    'getMetadata': function(req, res) {

      var createResult = function(req, datasets) {
        var result = [];

        for (var i = 0; i < datasets.length; i++) {

          var dataset = datasets[i];

          result.push({
            table_name: dataset.table_name,
            url: dataset.url,
            title: dataset.title,
            description: dataset.description,
            author: dataset.author,
            view_count: dataset.view_count,
            star_count: dataset.star_count,
            row_count: dataset.row_count,
            col_count: dataset.col_count,
            user_id: dataset.user_id,
            columns: []
          });

          for (var j = 0; j < datasets[i].columns.length; j++) {

            var column = datasets[i].columns[j];

            result[i].columns.push({
              name: column.name,
              description: column.description,
              data_type: column.datatype
            });
          }
        }

        res.send(result);
      };


      if (!req.query.tag) {

        Dataset.findAll({
         include: [Column]
        }).success(function(datasets) {
           createResult(res, datasets);
        }).error(function(err) { console.log('getMetadata: ', err); });

      } else {

        // One or more tags specified, so get only those datasets that match at
        // least one

        if (typeof req.query.tag === 'string') {
          req.query.tag = req.query.tag.toLowerCase();
          req.query.tag = [ req.query.tag ];
        } else {
          for (var j = 0; j < req.query.tag.length; j++) {
            req.query.tag[j] = req.query.tag[j].toLowerCase();
          }
        }

        Dataset.findAll({
          include: [Tag],
          where: { 'Tags.label': req.query.tag }
        }).success(function(datasets) {

          // Count the datasets that are associated with all queried tags

          var datasetIds = [];

          for (var i = 0; i < datasets.length; i++) {

            var dataset = datasets[i];

            for (var j = 0; j < dataset.tags.length; j++) {
              if (datasets[i].tags.length === req.query.tag.length) {
                datasetIds.push(datasets[i].id);
              }
            }
          }

          Dataset.findAll({
            where: { id: datasetIds },
            include: [Column]
          }).success(function(datasets) {
            createResult(res, datasets, req.query.tag);
          }).error(function(err) { console.log('getMetadata: ', err); });

        }).error(function(err) { console.log('getMetadata: ', err); });
      }
    },


    /**
     *
     */

    'getTable': function(req, res) {

      var createResult = function(res, dataset, rows, selectedColumns) {

        // TODO: Refactor the organization of this response so that it isn't
        //       result.Result.tableMeta...

        var result = {
          'Result': {
            'tableMeta': {},
            'row': []
          }
        };

        result.Result.tableMeta['table_name'] = dataset.table_name;
        result.Result.tableMeta['url'] = dataset.url;
        result.Result.tableMeta['title'] = dataset.title;
        result.Result.tableMeta['description'] = dataset.description;
        result.Result.tableMeta['author'] = dataset.author;
        result.Result.tableMeta['view_count'] = dataset.view_count;
        result.Result.tableMeta['star_count'] = dataset.star_count;
        result.Result.tableMeta['row_count'] = dataset.row_count;
        result.Result.tableMeta['col_count'] = dataset.col_count;
        result.Result.tableMeta['user_id'] = dataset.user_id;
        result.Result.tableMeta['columns'] = [];

        for (var j = 0; j < dataset.columns.length; j++) {

          var column = dataset.columns[j];

          result.Result.tableMeta.columns.push({
            name: column.name,
            description: column.description,
            data_type: column.datatype
          });
        }

        for (var k = 0; k < rows.length; k++) {

          var row = rows[k];
          result.Result.row.push({});

          for (var m = 0; m < dataset.columns.length; m++) {
            var column = dataset.columns[m];

            if (selectedColumns) {
              if (selectedColumns.indexOf(column.name) !== -1) {
                result.Result.row[k][column.name] = row[column.name];
              }
            } else {
              result.Result.row[k][column.name] = row[column.name];
            }
          }
        }

        task.updateAttributes({
          view_count: dataset.view_count + 1
        }).success(function() {
          res.send(result);
        });
      };


      if (!req.query.name) {

        // No table name specified

        res.send('Error: A table name must be provided');


      // YES: table name
      // NO: row, column

      } else if (req.query.name && !req.query.row && !req.query.column) {

        Dataset.find({
          where: { table_name: req.query.name },
          include: [Column]
        }).success(function(dataset) {
          datastore.query('SELECT * FROM ' + req.query.name + 's ORDER BY "Date" LIMIT 5;')
            .success(function(data) {
              createResult(res, dataset, data);
            });
        });


      // YES: table name, row
      // NO: column

      } else if (req.query.name && req.query.row && !req.query.column) {

        Dataset.find({
          where: { table_name: req.query.name },
          include: [Column]
        }).success(function(dataset) {
          if (req.query.row === 'ALL') {
            datastore.query('SELECT * FROM ' + req.query.name + 's ORDER BY "Date";')
              .success(function(data) {
                createResult(res, dataset, data);
              });
          } else {
            datastore.query('SELECT * FROM ' + req.query.name + 's ORDER BY "Date" LIMIT ' + req.query.row + ';')
              .success(function(data) {
                createResult(res, dataset, data);
              });
          }
        });


      // YES: table name, row, column
      // NO:

      } else if (req.query.name && req.query.row && req.query.column) {

        Dataset.find({
          where: { table_name: req.query.name },
          include: [Column]
        }).success(function(dataset) {

          if (req.query.row === 'ALL') {
            datastore.query('SELECT * FROM ' + req.query.name + 's ORDER BY "Date";')
              .success(function(data) {
                if (typeof req.query.column === 'string') {
                  req.query.column = [ req.query.column ];
                }

                createResult(res, dataset, data, req.query.column);
            });
          } else {
            datastore.query('SELECT * FROM ' + req.query.name + 's ORDER BY "Date" LIMIT ' + req.query.row + ';')
              .success(function(data) {
                if (typeof req.query.column === 'string') {
                  req.query.column = [ req.query.column ];
                }

                createResult(res, dataset, data, req.query.column);
            });
          }
        });


      // YES: table name, column
      // NO: row

      } else if (req.query.name && !req.query.row && req.query.column) {

        Dataset.find({
          where: { table_name: req.query.name },
          include: [Column]
        }).success(function(dataset) {
          datastore.query('SELECT * FROM ' + req.query.name + 's ORDER BY "Date" LIMIT 5;')
            .success(function(data) {
              if (typeof req.query.column === 'string') {
                req.query.column = [ req.query.column ];
              }

              createResult(res, dataset, data, req.query.column);
            });
        });

      }
    }
};

module.exports = function(Models) {
  User = Models.User;
  Dataset = Models.Dataset;
  Tag = Models.Tag;
  Column = Models.Column;
  models = Models;
  schema = Models.sequelize;
  datastore = Models.datastore;

  return apiControllers;
};






/*
      // Get the number of datasets that are associated with the queried tags

      var whereOptions = '';
      for (var i = 0; i < queriedTags.length; i++) {
        if (i === queriedTags.length-1) {
          whereOptions += '"TagId"=' + queriedTags[i].id;
        } else {
          whereOptions += '"TagId"=' + queriedTags[i].id + ' OR ';
        }
      }

      schema.query('SELECT count(*) FROM "DatasetsTags" WHERE ' + whereOptions + ';')
        .success(function(tagCount) {
          result.total = parseInt(tagCount[0].count);
          res.send(result);
        });
*/
