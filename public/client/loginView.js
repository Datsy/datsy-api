var LoginView = Backbone.View.extend({

  template: _.template('\
	  <div class="well hero-spacer well-background">\
	    <h3>Please Login</h3>\
	  </div>\
	  <div class="row">\
	    <form method="post" action="/worker-login">\
	      <div class="form-group">\
	        <label>Email</label>\
	        <input type="text" placeholder="Enter your email" name="email" size="30" class="form-control">\
	      </div>\
	      <div class="form-group">\
	        <label>Password</label>\
	        <input type="password" placeholder="Enter your password" name="password" class="form-control">\
	        <button class="btn btn-default">Sign In</button>\
	      </div>\
	    </form>\
	  </div>\
	  '
  ),

  render: function() {
    this.el.innerHTML = this.template();
    return this;
  }

});
