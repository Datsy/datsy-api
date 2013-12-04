var Router = Backbone.Router.extend({
  routes: {
    "posts/:id": "getPost", // will match example: /#/posts/1
    "login": "login",
    "logout": "logout",
//    "signup": "signup",
    "verifyEmail": "verifyEmail",
    "": "signup",
//    "aboutUs": "aboutUs",
  },

  defaultPage: function(){
    this.loadPage();
  }
});

var Datsy = Backbone.View.extend({
  initialize: function(){
    // TODO: Fill in details here
  },

  userLogin: function(className){
    this.pageView = new LoginView();
    $('.container .section1').html(this.pageView.render().el);
  },

  userLogout: function(className){
    this.pageView = new LoginView();
    $('.container .section1').html(this.pageView.render().el);
  },

  userSignup: function(className){
    this.signupView = new SignupView();
    $('.container .section1').html(this.signupView.render().el);
  },

  userVerifyEmail: function(className){
    this.verifyEmail = new VerifyEmailView();
    $('.container .section1').html(this.verifyEmail.render().el);
  },

  aboutUs: function(){
    this.aboutUsView = new AboutUsView();
    $('.container .section1').html(this.aboutUsView.render().el);
  }
});

var app_router = new Router();
var datsy = new Datsy();
Backbone.history.start();

app_router.on('route:login', datsy.userLogin);
app_router.on('route:logout', datsy.userLogout);
//app_router.on('route:signup', datsy.userSignup);
app_router.on('route:verifyEmail', datsy.userVerifyEmail);
//app_router.on('route:aboutUs', datsy.aboutUs);

