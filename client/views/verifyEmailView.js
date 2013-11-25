var VerifyEmailView = Backbone.View.extend({

  template: _.template('\
    <div class="container"> \
      <div class="well hero-spacer"> \
        <h3>Great! Please check your email to verify your account</h3> \
      </div> \
    </div> \
	'
  ),

  render: function() {
    console.log("render");
    this.el.innerHTML = this.template();
    return this;
  }

});