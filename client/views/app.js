// (function($){
var Router = Backbone.Router.extend({
  routes: {
    "posts/:id": "getPost", // will match example: /#/posts/1
    "login": "login",
    "signup": "signup",
    "verifyEmail": "verifyEmail",
    "": "signup",
    "aboutUs": "aboutUs",
  },

  defaultPage: function(){
    this.loadPage();
  }
});

var Datsy = Backbone.View.extend({
  initialize: function(){
    console.log("Datsy is running");
    console.log("Datsy is still running");
  },

  userLogin: function(className){
    console.log("In login");
    this.pageView = new LoginView();
    $('.container .section1').html(this.pageView.render().el);
  },

  userSignup: function(className){
    console.log("In Signup");
    this.signupView = new SignupView();
    $('.container .section1').html(this.signupView.render().el);
  },

  userVerifyEmail: function(className){
    console.log("In verify Email");
    this.verifyEmail = new VerifyEmailView();
    $('.container .section1').html(this.verifyEmail.render().el);
  },

  aboutUs: function(){
    console.log("In About Us");
    this.aboutUsView = new AboutUsView();
    $('.container .section1').html(this.aboutUsView.render().el);  
  }
});

var app_router = new Router();
var datsy = new Datsy();
console.log("router initialized");
Backbone.history.start();

app_router.on('route:login', datsy.userLogin);
app_router.on('route:signup', datsy.userSignup);
app_router.on('route:verifyEmail', datsy.userVerifyEmail);
app_router.on('route:aboutUs', datsy.aboutUs);
app_router.on('route:getPost', function (id) {
    // Note the variable in the route definition being passed in here
    console.log("In posts");
    alert( "Get post number " + id );
});


// })(jQuery);