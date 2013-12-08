Datsy-API [![Build Status](https://travis-ci.org/Datsy/datsy-api.png?branch=master)](https://travis-ci.org/Datsy/datsy-api)
=============

Datsy-API is a free, open and simple API to access and explore an ever growing
number of data sets.

Running Grunt
-------

When you run `grunt` from the command line, the following will happen after each
file save:
* lint your changes and display any errors
* run all unit tests within `test/` and display any errors

Run `grunt dev` to do the following:
* connect to a development PostgreSQL database on `localhost`
* run nodemon with the `--debug` setting

Run `grunt prod` to do the following:
* connect to a production PostgreSQL database based on the information in the config file
* run nodemon with the `--debug` setting


API Endpoints
-------

### All Tags Endpoint
Returns object with two fields:
- tag: array of all tags in the database
- total: number of tables that have tags

###### Usage
```
GET /search/tag
```
###### Response
```
{
  tag: ["san francisco", "technology", "stock", "weather", "fitbit", "ufo"],
  total: <total number of table relating to the tags>
}
```

### Get All Metadata
Returns metadata for all tables, including column metadata.

###### Usage
```
GET search/meta
```
###### Response
```
{}
```

### Search Endpoint

###### Parameters
| Name     | Required    | Description                                    |
| -------- | ----------- | ---------------------------------------------- |
| `term`   | Required    | TODO                                           |
| `type`   | Required    | Possible values are `tag` and `title`.         |


###### Example
```
http://...../search?term=Bike+Share&type=tag
```

###### Response
```
// TODO: Insert sample response based on the example above.
```
<br />
<br />

**Task List:**
- [ ] Search by `type=tag` (i.e., `../search?term=Bike&type=tag`)
- [ ] Search by `type=title` (i.e., `../search?term=Bike&type=title`)
- [ ] Search with multiple terms for `tag` and `title` types
- [ ] Retrieve list of all `tags` (i.e., `../tags`)
- [ ] *Development Purposes Only:* Retrieve joined sample data (i.e. `../dev`)

