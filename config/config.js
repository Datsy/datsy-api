module.exports = {
  db: {
    production: process.env.MONGOLAB_URI ||
                process.env.MONGOHQ_URL  ||
                'mongodb://localhost/HelloMongoose',
    development: 'mongodb://localhost/HelloMongoose',
    test: "mongodb://localhost/test",
  },
  mailer: {
    auth: {
      //Note to CCare - these credentials will be visible when the project is uploaded to github.  
      //You should replace these credentials with another email account then mark this file to NOT be 
      //uploaded to github via the the .gitignore file, otherwise anyone with access to the repo will be able
      //to see this login info.  See https://help.github.com/articles/ignoring-files.
      user: "credentialedcaredev@gmail.com",
      pass: "credentialed"
    },
   defaultFromAddress: 'Credentialed Care <credentialedcaredev@gmail.com>'
  }
}; 