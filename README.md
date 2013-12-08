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
### 1. Tag Search Endpoint

###### Parameters
| Name     | Required    | Description                                    |
| -------- | ----------- | ---------------------------------------------- |
| `tag `   | Optional    | The tags to be searched for                    |


###### 1.1 Usage: get all tags
```
GET /search/tag
```
Returns object with two fields:
- tag: array of all tags attached to tables
- total: total number of tables relating to the tags

###### Response
```
{
  tag: ["san francisco", "technology", "stock", "weather", "fitbit", "ufo"],
  total: 9
}
```
###### 1.2 Usage: search using tags
- Queries can contain one or more <code>tagname</code>s;
- Punctuation is removed from the search.

```
GET /search/tag?tag=<tagname>
GET /search/tag?tag=<tagname>&tag=<anotherTagname>
```
Returns object with two fields:
- total: return the total number of tables that contains the tag;
- tag: return all the tags in the tables;

Response to:
```
http://datsy-dev.azurewebsites.net/search/tag?tag=san+francisco
```
Returned:
```
{
  "tag": [
    "daily",
    "san francisco",
    "weather",
    "temperature",
    "fitbit",
    "health",
    "exercise",
    "fitness",
    "public policy",
    "lobbying",
    "lobbyists"
  ],
  "total": 3
}
```
Response to:
```
http://datsy-dev.azurewebsites.net/search/tag?tag=San+Francisco&tag=lobbying
```
Returned:
```
{
  "tag": [
    "san francisco",
    "public policy",
    "lobbying",
    "lobbyists"
  ],
  "total": 1
}
```

### 2. Metadata Search Endpoint
Returns metadata for all tables, including column metadata.

###### Parameters
| Name     | Required    | Description                                    |
| -------- | ----------- | ---------------------------------------------- |
| `tag `   | Optional    | The tags to be searched for                    |


###### 2.1 Usage: get metadata for all tables
```
GET search/meta
```
###### Response
Returns an array of JSON objects, each representing the metadata for a table in the database. MetaData object also include column information.

Response to:
```
http://datsy-dev.azurewebsites.net/search/meta
```

Returned:

```
[
  {
    "table_name": "samsung_stock",
    "user_id": 5,
    "url": "www.yahoo.com",
    "title": "samsung stock",
    "description": "samsung stock data",
    "author": "Yahoo finance",
    "created_at": "2013-12-06T22:22:49.000Z",
    "last_access": null,
    "view_count": null,
    "star_count": null,
    "row_count": 786,
    "col_count": 7,
    "last_viewed": null,
    "token": null,
    "id": 1,
    "columns": [
      {
        "name": "Date",
        "description": "Date",
        "data_type": "Date"
      },
      {
        "name": "Open",
        "description": "Open",
        "data_type": "String"
      }
    ]
  },
  {
    "table_name": "samsung_stock",
    "user_id": 5,
    "url": "www.yahoo.com",
    ...
  }
]
```

###### 2.2 Usage: search metadata using tags 

```
GET search/meta?tag=<tagname>
```

###### Response
- returns metadata, including column information, of tables associated with the <tagname>s.
- a query can consist of multiple tags

Response to:

```
http://datsy-dev.azurewebsites.net/search/meta?tag=technology
```
Returned:

```
[
  {
    "table_name": "samsung_stock",
    "user_id": 5,
    "url": "www.yahoo.com",
    "title": "samsung stock",
    "description": "samsung stock data",
    "author": "Yahoo finance",
    "created_at": "2013-12-06T22:22:49.000Z",
    "last_access": null,
    "view_count": null,
    "star_count": null,
    "row_count": 786,
    "col_count": 7,
    "last_viewed": null,
    "token": null,
    "id": 1,
    "columns": [
      {
        "name": "Date",
        "description": "Date",
        "data_type": "Date"
      },
      {
        "name": "Open",
        "description": "Open",
        "data_type": "String"
      }
    ]
  },
  <!-- more tables if applicable -->
]
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

