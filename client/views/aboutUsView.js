var AboutUsView = Backbone.View.extend({

  // template: _.template('../templates/aboutUsView.js');
  // template: _.template('\
  // ')
  template: _.template('\
    <div class="container"> \
      <div class="hero-spacer"> \
        <div class="row"> \
          <div class="frm_container"> \
            <h1>About Us</h1> \
            <img class="imgleft" src="imgs/Hack_Reactor.png" /> \
              <h1>Product Manager</h1> \
              <h1>Team Members</h1> \
          </div> \
        </div> \
      </div> \
    </div> \
  '),

  render: function() {
    this.el.innerHTML = this.template();
    return this;
  }

});