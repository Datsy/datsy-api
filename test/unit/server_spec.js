var expect = require('chai').expect;
var request = require('superagent');
var should = require('should');
var mailer = require('../../server/helpers/sendEmail.js');

console.log('NODE_ENV: '+process.env.NODE_ENV);

describe('Test spec file', function() {
  it('has loaded the spec file and run the tests', function() {
    expect(true).to.equal(true);
  });
});

// describe('GET /', function(){
//   it ('should respond', function(done){
//     request.get('localhost:5000').end(function(res){
//       expect(res).to.exist;
//       expect(res.status).to.equal(200);
//       done();
//     })
//   });
// });
/*
=======

/*
>>>>>>> 34b51f06e4e4fa90533d06969b917ddfa19f4c04
>>>>>>> ce6aa701091ea85fdf35dede3da455b244bfee43
describe('Mailer: sendEmail', function(done){
  it ('should render the job applicant/employer registration confirmation email', function(done){
    var locals = {
      email: 'example@gmail.com',
      subject: 'Verify your Datsy account',
      name: 'Adam Rich',
      confirmationLink: 'http://localhost:5000/verifyEmail/000000000001|afdaevdae353'
    };
    mailer.sendOne('registrationVerif', locals, function (err, responseStatus, html, text) {
      should.not.exist(err);
      responseStatus.should.include("OK");
      text.should.include("Hello " + locals.name + "! Thank you for your interest in Datsy. Please click the following link to complete your signup process " +locals.confirmationLink);
<<<<<<< HEAD
      html.should.include("<h1>Hello " + locals.name +
=======
<<<<<<< HEAD
      html.should.include("<h1>Hello " + locals.name + 
>>>>>>> ce6aa701091ea85fdf35dede3da455b244bfee43
      	"!</h1><p>Thank you for your interest in Datsy. Please click the following link to complete your signup process</p><a href=\"" + locals.confirmationLink + "\">Click here</a>");
      done();
    });
  })
})
<<<<<<< HEAD
=======
=======
      html.should.include("<h1>Hello " + locals.name +
      	"!</h1><p>Thank you for your interest in Datsy. Please click the following link to complete your signup process</p><a href=\"" + locals.confirmationLink + "\">Click here</a>");
      done();
    });
  })
})
>>>>>>> ce6aa701091ea85fdf35dede3da455b244bfee43
*/
