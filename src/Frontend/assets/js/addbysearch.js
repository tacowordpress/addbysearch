(function($){
  $(function() {

     if($('.addbysearch').length) {
      var array_addbysearch = [];
      $('.addbysearch').each(function() {
        var post_type = $(this).data('postType').toLowerCase();
        if(!$(this).prop('placeholder').length) {
          $(this).attr('placeholder', 'search by keyword');
        }
        post_type = post_type.split('::')[0];
        array_addbysearch.push(new addbysearch($(this), posts_json_results['json_results_'+post_type]));
      })
     }
  });


  var addbysearch = function($object, data_src) {
    if(!data_src) return;
    if(typeof data_src == 'object') {
      this.data_obj = data_src;
    }
    else if(typeof data_src == 'string') {
      this.data_src = data_src;
    }
    if(this.data_obj == null && this.data_url == null) return;
    this.$input_original = $object;
    this.init();
  }


  addbysearch.prototype = {
    $input_original : null,
    $results_jquery_object: null,
    $actual_values_object: null,
    $addbysearch_show_all: null,
    $ids_field_object: null,
    $reverse_btn_object: null,
    data_url: null,
    data_obj: null,
    original_state: null,
    acceptable_line_length: 65,
    using_terms: false,
    order_only: false,
    ordering_text: 'Order by dragging the items below.',
    single_value_text: '– Pick only one.',
    single_value: false,
    path_file: '/wp-content/plugins/addbysearch/',

    init: function() {
      var $input = this.$input_original;
      var input_name = $input.attr('name');

      // get original contents and store it to a variable
      //so when the destroy method is called it will return to its original state
      this.original_state = $input.closest('.inside').clone().contents();

      // hide the original field and create a new one
      $input.before($(this.getIdsFieldTemplate()));
      this.$ids_field_object = $input.prev('input[type="hidden"]');
      this.$ids_field_object.attr('name', input_name);
      $input.attr('name', '');

      // add all field templates to the DOM
      $input.after(this.getActualValuesTemplate());
      this.$actual_values_object = $input.siblings('.addbysearch-actual-values')

      this.$actual_values_object.before(this.getReverseButtonTemplate());
      this.$reverse_btn_object = this.$actual_values_object.parent().find('.reverse-saved');

      $input.after(this.getResultsTemplate());
      this.$results_jquery_object = $input.siblings('.addbysearch-results');

      $input.after(this.getShowAllButtonTemplate());
      this.$addbysearch_show_all = $input.next('.addbysearch-show-all');

      // initialize events
      this.initEvent();

      // set values
      this.$ids_field_object.val($input.val());
      $input.val('');

      this.using_terms = $input.data('usingTerms');
      this.order_only = $input.data('orderOnly');
      this.single_value = $input.data('singleValue');

      // is this an order only
      if(this.order_only) {
        this.setDefaultsForOrderOnly();
      }
      // should this hold only one id
      if(this.single_value) {
        this.setDefaultsForSingleValue();
      }
    },


    setDefaultsForSingleValue: function() {
      var $label_search = this.$addbysearch_show_all.parent().find('b:eq(0)');
      $label_search.text(
      $label_search.text().replace(/Results/i, 'Results ' + this.single_value_text));
    },


    setDefaultsForOrderOnly: function() {
      this.$addbysearch_show_all
        .click()
        .hide()
        .parent().find('b:eq(0)')
        .hide();

      if(!this.$ids_field_object.length) {
        this.appendAllResults();
      } else {
        this.appendNewResults();
      }

      this.$input_original.hide();
      this.$results_jquery_object.hide();
      this.$reverse_btn_object.hide();
      this.$actual_values_object
        .parent()
        .find('.addbysearch-remove-btn')
        .hide();

      this.$actual_values_object
        .find('.postbox')
        .append(this.getMoveIconTemplate());

      this.$input_original
        .parent()
        .find('b:visible')
        .text(this.ordering_text)
    },


    appendAllResults: function() {
      this.$results_jquery_object.find('.postbox').click();
    },


    appendNewResults: function() {
      var ids = this.getDiffFromValuesToResults();
      for(i in ids) {
        $('[data-key-id="' + ids[i] + '"]').click();
      }
    },


    getDiffFromValuesToResults: function() {
      var actual_value_keys = this.getArrayFromActualValues();
      var results_value_keys = Object.keys(this.data_obj);
      var diff = [];
      
      for(i in results_value_keys) {
        if(actual_value_keys.indexOf(parseInt(results_value_keys[i])) == -1) {
          diff.push(results_value_keys[i]);
        }
      }
      return diff;
    },


    getResultsTemplate: function() {
      return '<br><b>Search Results</b><ul class="addbysearch-results"></ul>';
    },


    getPreviewLink: function(data_key) {
      return ' <a target="_blank" href="/wp-admin/post.php?post=' + data_key + '&action=edit">view</a>';
    },


    getSingleResultTemplate: function(data_key, data_value) {
      var html  = '<li class="addbysearch-result postbox" data-key-id="' + data_key + '">';
          html += '<span>' + this.getShortened(data_value) + '</span>'
          if(!this.using_terms) {
            html += this.getPreviewLink(data_key);
          }
          html += '</li>';
      return html;
    },


    getActualValuesTemplate: function() {
      return '<br><b>Your selection</b><ul class="addbysearch-actual-values"></li>';
    },


    getRemoveButtonTemplate: function() {
      return '<a href="#" class="addbysearch-remove-btn button">x</a>';
    },


    getMoveIconTemplate: function() {
      return '<img src="' + this.path_file + 'icon-move.png">';
    },


    getShowAllButtonTemplate: function() {
      return '<a href="#" class="addbysearch-show-all button">Show All</a>';
    },


    getReverseButtonTemplate: function() {
      return '<a href="#" class="reverse-saved button">Reverse order</a>';
    },


    getClickToAddText: function() {
      return '<i>Click to Add</i>';
    },


    getIdsFieldTemplate: function() {
      return '<input type="hidden" name="" value="">'
    },


    getShortened: function(text) {
      return (text.length >= this.acceptable_line_length)
        ? text.substring(
          0,
          (text.length - (text.length - this.acceptable_line_length))) + '...'
        : text;
    },


    getSavedResults: function() {
      if(!this.data_obj) return;
      if(!this.$input_original.val().length) return;

      var data = this.data_obj;
      var self = this;
      var organized_data = [];
      var saved_ids = self.$input_original.val().split(',').reverse();

      for(s in saved_ids) {
          $(this.getSingleResultTemplate(
            saved_ids[s],
            data[saved_ids[s]]

          ))
          .prependTo(this.$actual_values_object);
      }
      // add the remove button
      this.$actual_values_object.find('li span')
      .after(this.getRemoveButtonTemplate());

      this.addRemoveEvents();

      this.$actual_values_object.sortable();
      this.$actual_values_object.on('sortupdate', function(event, ui) {
        self.updateSavedValues();
      });
    },


    filterResults: function() {
      var results = [];
      var $input = this.$input_original;
      var data = this.data_obj;
      input_text = $input.val().toLowerCase().trim();
      for(d in data) {
        if(input_text.length < 3) return;
        var current_data = data[d].toLowerCase().trim();
        if(data[d].toLowerCase().search(input_text) > -1) {
          results.push(this.getSingleResultTemplate(d, data[d]));
        }
      }
      return results;
    },


    // show everything that's in the json object
    showEverything: function() {
      var data = this.data_obj;
      var results = [];
      for(d in data) {
        results.push(this.getSingleResultTemplate(d, data[d]));
      }
      this.$results_jquery_object.find('li').remove();
      this.appendResults(results);
      this.$results_jquery_object.addClass('contains-results');
    },


    clearResults: function() {
      this.$results_jquery_object.text('');
      this.$results_jquery_object.find('li').remove();
    },


    getArrayFromActualValues: function() {
      var values = [];
      this.$actual_values_object.find('li').each(function(){
        values.push($(this).data('keyId'));
      });
      return values;
    },


    reverseOrder: function() {
      var self = this;
      this.$ids_field_object.val(this.getArrayFromActualValues().reverse().join(','));
      this.$actual_values_object.find('li').each(function() {
        self.$actual_values_object.prepend($(this))
      });
    },


    appendResults: function(results) {
      var self = this;
      if(typeof results == 'undefined' || !results.length) {
        this.$results_jquery_object.removeClass('contains-results');
        return;
      }
      this.$results_jquery_object.append(results.join(' '));
      this.$results_jquery_object.find('li').each(function(){
        $(this).append(self.getClickToAddText());
      })
      this.$actual_values_object.sortable();
      this.$actual_values_object.on('sortupdate', function(event, ui) {
        self.updateSavedValues();
      });
      this.$results_jquery_object.addClass('contains-results');
    },


    addResultToSavedValues: function(id) {
      this.$ids_field_object.val(this.$ids_field_object.val() + ',' + id);
      this.$ids_field_object.val(this.$ids_field_object.val().replace(/^\,/, ''));
    },


    updateSavedValues: function() {
      var updated_values = [];
      this.$actual_values_object.find('li').each(function() {
        if(typeof $(this).data('keyId') == 'undefined') return;
        updated_values.push($(this).data('keyId'));
      });
      this.$ids_field_object.val(updated_values.join());
    },


    initEvent: function() {
      $input = this.$input_original;
      var self = this;
      var $results_jquery_object = this.$results_jquery_object;
      var $addbysearch_show_all = this.$addbysearch_show_all;
      var $reverse_btn_object = this.$reverse_btn_object;
      this.getSavedResults();

      $addbysearch_show_all.on('click', function(e){
        e.preventDefault();
        self.showEverything();
      });
      $reverse_btn_object.on('click', function(e){
        e.preventDefault();
        self.reverseOrder();
      });
      $input.on('keyup', function(e) {
        var results;
        results = self.filterResults();
        self.clearResults();
        self.appendResults(results);
      })
      .on('blur', function(e) {

      })
      .on('keydown', function(e) {
        if(e.which === 13) {
          return false;
        }
      });
      this.$results_jquery_object.on('click', '.addbysearch-result', function(e) {
        if($(e.target).prop('tagName') == 'A') return true;
        if(self.single_value && self.countActualValues()) return false;

        self.addResultToSavedValues($(this).data('keyId'));
        $(this).clone().appendTo(self.$actual_values_object);
        self.$actual_values_object.find('i').remove();
        self.flashAddition(self.$actual_values_object.find('li:first-child'));
        // add the remove button
        self.addRemoveBoxes();
        self.updateSavedValues();

        if(self.single_value) {
          // temp disable adding anymore until actual values length is zero
          self.addDisabledAppereance();
        }
      })
    },


    addDisabledAppereance: function() {
      this.$results_jquery_object
        .find('.addbysearch-result')
        .css({
          opacity: 0.5
        })
    },


    removeDisabledAppereance: function() {
      this.$results_jquery_object
        .find('.addbysearch-result')
        .css({
          opacity: 1
        })
    },


    countActualValues: function() {
      if(this.$actual_values_object.find('li').length) return true;
      return false;
    },


    flashAddition: function($object) {
      var timeout_animation = null;
      $object.addClass('just-added')

      timeout_animation = setTimeout(function(){
        $object.removeClass('just-added');
      }, 1000);

    },


    addRemoveBoxes: function() {
      var self = this;
      this.$actual_values_object.find('li').each(function(){
        if(!$(this).find('.button').length) {
          $(this).find('span').after(self.getRemoveButtonTemplate());
        }
      });
      this.addRemoveEvents();
    },


    addRemoveEvents: function() {
      var self = this;
      this.$actual_values_object.find('li').off()
      .on('click', '.button', function(e) {
        e.preventDefault();
        $(this).parent().remove();
        self.updateSavedValues();
        if(self.single_value && !self.countActualValues()) {
          self.removeDisabledAppereance();
        }
      });
    },


    destroy: function() {
      this.$input_original.closest('.inside').html(this.original_state.contents());
      array_addbysearch = [];
    },
  }
})(jQuery);
