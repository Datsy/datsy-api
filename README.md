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
- [ ] Search by `type=dataset` (i.e., `../search?term=Bike&type=title`)
- [ ] Search with multiple terms for `tag` and `title` types
- [ ] Retrieve list of all `tags` (i.e., `../tags`)
- [ ] *Development Purposes Only:* Retrieve joined sample data (i.e. `../dev`)

