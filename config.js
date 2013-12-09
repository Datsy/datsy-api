// # Ghost Configuration
// Setup your Ghost install for various environments

var path = require('path');
var config;
var setting = require('./setting.js');

config = {
  // ### Development **(default)**
  development: {
    // The url to use when providing links to the site, E.g. in RSS and email.
    url: 'http://my-ghost-blog.com',
    mail: {
      transport: 'SMTP',
      options: {
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD
        }
      }
    },
    database: {
      user: "bhc",
      password: "",
      host: "",
      dbname: "datsy"
    },
    datastore: {
      user: "bhc",
      password: "",
      host: "",
      dbname: "datastore"
    },
    server: {
      // Host to be passed to node's `net.Server#listen()`
      host: '127.0.0.1',
      // Port to be passed to node's `net.Server#listen()`, for iisnode set this to `process.env.PORT`
      port: '2368'
    }
  },

  // ### Production
  // When running Ghost in the wild, use the production environment
  // Configure your URL and mail settings here
  production: {
    url: process.env.MY_URL,
    mail: {
      transport: 'SMTP',
      options: {
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD
        }
      }
    },
    database: {
      user: "masterofdata",
      password: "gj1h23gnbfsjdhfg234234kjhskdfjhsdfKJHsdf234",
      host: "137.135.14.92",
      dbname: "datsydata"
    },
    datastore: {
      user: "masterofdata",
      password: "gj1h23gnbfsjdhfg234234kjhskdfjhsdfKJHsdf234",
      host: "137.135.14.92",
      dbname: "postgres"
    },
    server: {
      // Host to be passed to node's `net.Server#listen()`
      host: '0.0.0.0',
      // Port to be passed to node's `net.Server#listen()`, for iisnode set this to `process.env.PORT`
      port: process.env.PORT || 5000
    }
  },

  // **Developers only need to edit below here**

  // ### Testing
  // Used when developing Ghost to run tests and check the health of Ghost
  // Uses a different port number
  testing: {
    url: 'http://127.0.0.1:2369',
    database: {
      client: 'mysql',
      connection: {
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DATABASE,
          filename: path.join(__dirname, '/content/data/ghost-test.db')
      }
    },
    server: {
      host: '127.0.0.1',
      port: '2369'
    }
  },

  // ### Travis
  // Automated testing run through Github
  travis: {
    url: 'http://127.0.0.1:2368',
    database: {
      client: 'mysql',
      connection: {
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DATABASE,
        filename: path.join(__dirname, '/content/data/ghost-travis.db')
      }
    },
    server: {
      host: '127.0.0.1',
      port: '2368'
    }
  },

  allEnv: {
    mailer: {
      auth: {
        //user: process.env.GMAIL_USERNAME,
        //pass: process.env.GMAIL_PASSWORD
        user: setting.email_user,
        pass: setting.email_pass
      },
      defaultFromAddress: 'Datsy <datsydev@gmail.com>'
    }
  }
};

// Export config
module.exports = config;
