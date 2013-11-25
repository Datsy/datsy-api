var EmailTokenModel = function(schema){
  var EmailToken = schema.define("emailtoken", {
    name: {type: String},
    email: {type: String},
    password: {type: String},
    phone: {type: String},
    token: {type: String}
  })

  return EmailToken;
}

module.exports = EmailTokenModel;