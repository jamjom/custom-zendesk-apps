(function() {
 
  var randomFields = [
	{name: 'Random Value 1', value: 'test 1'}, 
	{name: 'Random Value 2', value: 'test 2'} 
	];

  var customFields = [
	{name: 'Order Number', field: 'custom_field_27475497'}, 
	{name: 'Email Address', field: 'custom_field_27474597'} 
	];

  var showFieldValue = function(item) {
   this.$('.div-custom-fields').append("<p><b>" + item.name + ":</b> " + this.ticket().customField(item.field)  + "</p>");
  };

  var showRandomValue = function(item) {
   this.$('.div-random-fields').append("<p><b>" + item.name + ":</b> " + item.value  + "</p>");
  };

  return {
    events: {
      'app.activated':'doSomething',
    },

    doSomething: function() {
     _.each(customFields, showFieldValue, this);
     _.each(randomFields, showRandomValue, this);
    }
  };

}());
