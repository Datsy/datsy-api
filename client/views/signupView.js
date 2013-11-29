var SignupView = Backbone.View.extend({

  events: {
    //"click #signup-submit": "verifyEmailPath",
  },

  verifyEmailPath: function(e) {
    console.log('verify email path');
    // e.preventDefault();
    console.log(window.location);
    app_router.navigate('verifyEmail', {trigger: true});
  },

  template: _.template('\
    <div> \
      <div class="well hero-spacer"> \
        <h3>Sign Up</h3> \
      </div> \
      <div class="row"> \
        <form method="post" action="/signup"> \
          <div class="form-group"> \
            <label for="exampleInputEmail1">Name</label> \
            <input class="form-control" id="InputName" placeholder="Enter your name" name="name">\
          </div> \
          <div class="form-group control-group"> \
            <label>Email</label> \
            <input class="form-control" placeholder="Enter email" name="email"> \
          </div> \
          <div class="form-group"> \
            <label>Password</label> \
            <input type="password" class="form-control" placeholder="Password" name="password"> \
          </div> \
          <div class="form-group"> \
            <label>Re-Enter Password</label> \
            <input type="password" class="form-control" placeholder="Password"> \
          </div> \
          <div class="form-group"> \
            <input id="signup-submit" type="submit" class="btn btn-default" value="Submit"> \
          </div> \
        </form> \
      </div> \
    </div> \
  '
  ),

  render: function() {
    this.el.innerHTML = this.template();
    return this;
  }

});
