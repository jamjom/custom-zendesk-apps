(function() {

  var Util = require('utilities.js');

  return {
    events: {
      'app.activated': 'init',
      'getImageData.done' : 'displayImage',
      'click .thumbnail' : 'toggleImageModal',
      'change .image-datepicker': 'showImageByDate',
      'click #close-btn' : 'toggleImageModal'
    },
    
    requests: {
      getImageData: function(date) {
        return {
          url: 'https://api.nasa.gov/planetary/apod',
          type: 'GET',
          dataType: 'json',
          data: {
            api_key: '8tKXFJvk4bzxmNizdRyj62p8ouqTEIo4LCoJO7FP',
            date: date
          }
        };
      }
    },

    init: function() {
      this.showTodayImage();
    },

    showTodayImage: function() {
      this.date = Util.formatDate(new Date());
      this.switchTo('loader');
      this.ajax('getImageData', this.date);
    },

    displayImage: function(data) {
      data.date = this.date;

      if (data.error) {
        this.switchTo('error', data);
      } else {
        this.switchTo('image_thumbnail', data);
      }

      this.$('.image-datepicker').datepicker();
    },

    toggleImageModal: function(event) {
      event.preventDefault();
      this.$('.image-modal').toggle();
    },

    showImageByDate: function(event) {
      var $el = this.$(event.currentTarget);
      this.date = Util.formatDate(new Date($el.val()));
      this.switchTo('loader');
      this.ajax('getImageData', this.date);
    }
  };

}());
