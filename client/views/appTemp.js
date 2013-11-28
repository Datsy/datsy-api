window.Datsy = Backbone.View.extend({

  initialize: function(){
    console.log("Datsy is running");
    //$('body').append(this.render().el);
    // this.router = new Datsy.Router();
    // this.router.on("route:defaultRoute", function(actions){
    //   alert(actions);
    // });
    // Backbone.history.start({pushState: true});
    var AppRouter = Backbone.Router.extend({
        routes: {
            "posts/:id": "getPost", // will match example: /#/posts/1
            "login": "login",
            "signup": "signup",
            "verifyEmail": "verifyEmail"
        }
    });
    // Instantiate the router
    var app_router = new AppRouter();

    app_router.on('route:login', this.userLoginNav);
    app_router.on('route:signup', this.userSignupNav);
    app_router.on('route:verifyEmail', this.verifyEmailNav);

    app_router.on('route:getPost', function (id) {
        // Note the variable in the route definition being passed in here
        console.log("In posts");
        alert( "Get post number " + id );
    });

    // Start Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start();

    new Datsy.verifyEmailView();
    console.log("Datsy is still running");
  },

  userLoginNav: function(className){
    console.log("In login");
    console.log(Datsy.LoginView);
    var view = new Datsy.LoginView();
    console.log(view);
    console.log("View Render:", view.render());
    $('.container .section1').html(view.render().el);
  },

  userSignupNav: function(className){
    console.log("In Signup");
    var view = new Datsy.SignupView();
    console.log("View Render:", view.render());
    $('.container .section1').html(view.render().el);
  },

  verifyEmailNav: function(className){
    console.log("In verify Email");
    var view = new Datsy.verifyEmailView();
    console.log("View Render:", view.render());
      $('.container .section1').html(view.render().el);
    }
});
