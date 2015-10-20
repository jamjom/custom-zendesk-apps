(function() {

  return {
    defaultTicketType: ['tickettype', 'status', 'priority'],
    cticketFields: {},
    currentTicketFields: {},
    selectedOptionValue: '',
    selectedField: '',
    ticketForms: {},
    storedValues: {},
    events: {
      'app.activated':'doSomething',
      'change select[name=conditional-ticket-forms]' : 'displayFieldsByForm',
      'click .ticket-field-dropdown' : 'displayFieldOptions',
      'click .ticket-field-options' : 'displayAllDropdownOptions',
      'getTicketForms.done' : 'populateForms',
      'getTicketFields.done' : 'populateFields',

      '*.changed': 'handleDynamicEvents'
    },

    requests: {
      getTicketForms: function() {
        return {
          url: '/api/v2/ticket_forms.json',
          dataType: 'JSON',
          type: 'GET'
        };
      },
      getTicketFields: function() {
        return {
          url: '/api/v2/ticket_fields.json',
          dataType: 'JSON',
          type: 'GET'
        };
      }
    },

    doSomething: function() {
      this.ajax('getTicketForms');
      this.ajax('getTicketFields');
    },

    populateForms: function(data) {
      var _this = this;
      _.each(data.ticket_forms, function(el) {
        _this.ticketForms[el.id] = el.ticket_field_ids;
        _this.$('#ticket-forms-collection').append('<option value="'+ el.id +'">'+ el.name +'</option>');
      });
    },

    populateFields: function(data) {
      var _this = this;
      _.each(data.ticket_fields, function(el) {
        if(el.system_field_options || el.custom_field_options) {
          _this.cticketFields[el.id] = el;
        }
      });
      this.displayConditions();
    },

    displayFieldsByForm: function(event) {
      var $el = this.$(event.currentTarget);
      this.currentTicketFields = this.ticketForms[$el.val()];

      var _this = this;
      _this.$('#ticket-fields-list').empty();
      _this.$('#ticket-field-options').empty();
      _this.$('#dropdown-options').empty();

      _.each(this.currentTicketFields, function(id){
        var ticketObj = _this.cticketFields[id];
        if(ticketObj && ticketObj.type != "status") {
          _this.$('#ticket-fields-list').append('<li class="ticket-field-dropdown" data-field-id="'+ticketObj.id+'">'+ticketObj.raw_title+'</li>');
        }
      });
    },

    displayFieldOptions: function(event) {
      if(!this.store('conditional_values')) {
        this.store('conditional_values', {});
      }
      var $el = this.$(event.currentTarget);
      var ticketField = this.cticketFields[$el.data('field-id')];
      var fieldType = (this.defaultTicketType.indexOf(ticketField.type) < 0 ) ? "custom_field_" + ticketField.id : ticketField.type.replace('ticket', '');
      this.displayOptionsFromObject(ticketField, '#ticket-field-options', 'ticket-field-option');

      this.addSelectedClass('.ticket-field-dropdown', $el);
      this.$('#ticket-field-options .ticket-field-options').removeClass('selected');
      this.$('#dropdown-options').empty();
      this.selectedField = fieldType + "-" + $el.data('field-id');
    },

    displayAllDropdownOptions: function(event) {
      var $el = this.$(event.currentTarget);
      var _this = this;
      if($el.data('option-type') == 'ticket-field-option') {
        this.selectedOptionValue = $el.data('option-value');
        this.$('#dropdown-options').empty();
        _.each(this.currentTicketFields, function(id){
          var ticketObj = _this.cticketFields[id];
          var selectedFieldId = _this.selectedField.split("-")[1];
          if(ticketObj && ticketObj.id != selectedFieldId && ticketObj.type != "status") {
            var ulTitle = _this.cticketFields[ticketObj.id].raw_title;
            _this.$('#dropdown-options').append('<h4 class="options-title">'+ulTitle+'</h4><ul class="dropdown-field" id="dropdown_'+id+'"></ul>');
            _this.displayOptionsFromObject(ticketObj, '#dropdown_' + id, 'dropdown-option');
          }
        });

        this.addSelectedClass("#ticket-field-options .ticket-field-options", $el);
      } else {
        this.storeMetadata($el);

        this.displayConditions();
      }

    },

    displayConditions: function() {
      this.$('#selected-dropdown-options').empty();
      var _this = this;
      _.each(this.store('conditional_values'), function(optionsField, fieldTag) {
        var fieldTagText = (fieldTag.indexOf("-") > 0) ?  fieldTag.split("-")[1] : fieldTag;
        var groupConditionTitle = _this.cticketFields[fieldTagText].raw_title;
        _this.$('#selected-dropdown-options').append('<div id="'+fieldTag+'" class="condition-group"><i class="icon-arrow-right"></i><h4>'+groupConditionTitle+'</h4></div>');
        _.each(optionsField, function(options, optionTag) {
          _this.$('#' + fieldTag).append('<div id="'+optionTag+'" class="con-hierarchy"><i class="icon-arrow-right"></i><h5>'+optionTag+'</h5></div>');
          if(options) {
            _.each(options, function(values, key) {
              if(optionTag !== "") {
                _this.$('#'+optionTag).append('<div id='+key+' class="con-hierarchy"><i class="icon-arrow-right"></i><h6>'+key+'</h6><ul class="selected-values"></ul></div>');
                _.each(values, function(value) {
                  _this.$('#'+optionTag+' #'+key+' .selected-values').append('<li class="con-hierarchy">'+value+'</li>');
                });
              }
            });
          }
        });
      });
    },

    storeMetadata: function($el) {
      if(this.storedValues[this.selectedField]) {

        if(this.storedValues[this.selectedField][this.selectedOptionValue]) {
          if(!this.storedValues[this.selectedField][this.selectedOptionValue][$el.data('field-type')]) {
            this.storedValues[this.selectedField][this.selectedOptionValue][$el.data('field-type')] = [];
          }

          var storedValues = this.storedValues[this.selectedField][this.selectedOptionValue][$el.data('field-type')];

          if(this.storedValues[this.selectedField][this.selectedOptionValue][$el.data('field-type')].indexOf($el.data('option-value')) < 0) {
            storedValues.push($el.data('option-value'));
            this.addSelectedClass("#selected-values", $el);
          } else {
            if($el.hasClass('selected')) {
              storedValues.pop($el.data('option-value'));
              $el.removeClass('selected');
            }
          }

          this.storedValues[this.selectedField][this.selectedOptionValue][$el.data('field-type')] = storedValues;
        } else {
          this.storedValues[this.selectedField][this.selectedOptionValue] = {};
          this.storedValues[this.selectedField][this.selectedOptionValue][$el.data('field-type')] = [$el.data('option-value')];
          this.addSelectedClass("#selected-values", $el);
        }

      } else {
        this.storedValues[this.selectedField] = {};
        this.storedValues[this.selectedField][this.selectedOptionValue] = {};
        this.storedValues[this.selectedField][this.selectedOptionValue][$el.data('field-type')] = [$el.data('option-value')];
        this.addSelectedClass("#selected-values", $el);
      }

      this.store('conditional_values', this.storedValues);
    },

    displayOptionsFromObject: function(ticketField, container, type) {
      var objOptions = (ticketField.custom_field_options) ? ticketField.custom_field_options : ticketField.system_field_options;

      var _this = this;
      _this.$(container).empty();
      _.each(objOptions, function(option){
        var fieldType = (_this.defaultTicketType.indexOf(ticketField.type) < 0 ) ? "custom_field_" + ticketField.id : ticketField.type.replace('ticket', '');
        var selectedCheck = "";
        if(_this.store('conditional_values')[_this.selectedField] && _this.store('conditional_values')[_this.selectedField][_this.selectedOptionValue] && _this.store('conditional_values')[_this.selectedField][_this.selectedOptionValue][fieldType]) {
          selectedCheck = (_this.store('conditional_values')[_this.selectedField][_this.selectedOptionValue][fieldType].indexOf(option.value) >= 0 ) ? 'selected' : '';
        }
        _this.$(container).append('<li class="ticket-field-options '+selectedCheck+'" data-option-value="'+option.value +
                                  '" data-field-type="'+fieldType+'" data-option-type="'+type +
                                  '" data-field-id="'+ticketField.id+'" data-option-id="'+option.id+'">'+option.name+'</li>');
      });
    },

    handleDynamicEvents: function(data) {
      var _this = this;
      var hasWatchedValue = false;

      _.each(this.store('conditional_values'), function(fields, fieldId) {
        _.each(fields, function(value, key) {
          if(data.newValue == key) {
            _this.toggleConditionalValues(key);
            hasWatchedValue = true;
          }
        });
      });

      if(!hasWatchedValue) { this.refreshFieldOptions(); }
    },

    toggleConditionalValues: function(data) {
      var _this = this;
      _.each(this.store('conditional_values'), function(fieldOptions, fieldID) {
        _.each(fieldOptions, function(selectedFields, key) {
          if(key == data) {
            _.each(selectedFields, function(options, key) {
              _.each(_this.ticketFields(key).options(), function(option) {
                if(selectedFields[key].indexOf(option.value()) < 0 && option.value() !== '') {
                  option.hide();
                } else {
                  option.show();
                }
              });
            });
          }
        });
      });
    },

    refreshFieldOptions: function() {
      var _this = this;
      _.each(this.store('conditional_values'), function(fieldOptions, fieldID) {
        _.each(fieldOptions, function(selectedFields, key) {
          _.each(selectedFields, function(options, key) {
            if(_this.ticketFields(key) && _this.ticketFields(key).hasOwnProperty('options')) {
              _.each(_this.ticketFields(key).options(), function(option) {
                option.show();
              });
            }
          });
        });
      });
    },

    addSelectedClass: function(identifier, obj) {
      this.$(identifier).removeClass('selected');
      obj.addClass('selected');
    }
  };
}());
