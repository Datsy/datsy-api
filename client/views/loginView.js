var LoginView = Backbone.View.extend({

  template: _.template('\
    <div class="row">\
      <form class="form-horizontal" method="get" action="/login">\
        <div class="control-group">\
          <label class="control-label">Email</label>\
          <div class="controls">\
            <input type="text" placeholder="Enter your email" name="email" size="30" class="form-control">\
          </div>\
        </div>\
        <div class="control-group"">\
          <label class="control-label">Password</label>\
          <div class="controls">\
            <input type="password" placeholder="Enter your password" name="password" class="form-control">\
          </div>\
        </div>\
        <div class="control-group"">\
          <div class="controls">\
            <button class="btn btn-default">Sign In</button>\
          </div>\
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
