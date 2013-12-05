var Router = Backbone.Router.extend({
  routes: {
    "posts/:id": "getPost", // will match example: /#/posts/1
    "login": "login",
    "signup": "signup",
    "verifyEmail": "verifyEmail"
  }
});
