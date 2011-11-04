//
// Namespaces
//

(function($){
if ({}.__proto__){
    // mozilla  & webkit expose the prototype chain directly
    $.namespace = function(n){
        var names=n.split('.');
        var f=$.fn;
        for(var i=0;i<names.length;i++) {
            var name=names[i];
            if(!f[name]) {
                f[name] = function namespace() { // insert this function in the prototype chain
                    this.__proto__ = arguments.callee;
                    return this;
                };
                f[name].__proto__ = f;
            }
            f=f[name];
        }
    };
    $.fn.$ = function(){
        this.__proto__ = $.fn;
        return this;
    };
}else{
    // every other browser; need to copy methods
    $.namespace = function(n){
        var names=n.split('.');
        var f=$.fn;
        for(var i=0;i<names.length;i++) {
            var name=names[i];
            if(!f[name]) {
                f[name] = function namespace() { return this.extend(arguments.callee); };
            }
            f=f[name];
        }
    };
    $.fn.$ = function() { // slow but restores the default namespace
        var len = this.length;
        this.extend($.fn);
        this.length = len; // $.fn has length = 0, which messes everything up
        return this;
    };
}
})(jQuery);

$.namespace('zato');
$.namespace('zato.cluster');
$.namespace('zato.data_table');
$.namespace('zato.definition');
$.namespace('zato.definition.amqp');
$.namespace('zato.form');
$.namespace('zato.scheduler');
$.namespace('zato.security');
$.namespace('zato.security.basic_auth');
$.namespace('zato.security.tech_account');
$.namespace('zato.security.wss');


$.fn.zato.post = function(url, callback) {
	$.ajax({
		type: 'POST',
		url: url,
		data: '',
		headers: {'X-CSRFToken': $.cookie('csrftoken')},
		complete: callback
	});
}

$.fn.zato.user_message = function(is_success, msg) {
	var pre = $('#user-message');
	var new_css_class = ''
	
	if(is_success) {
		css_class = 'user-message-success';
	}
	else {
		css_class = 'user-message-failure';
	}

	pre.removeClass('user-message-success').
		removeClass('user-message-failure').addClass(css_class);
	pre.text(msg);
	
	var div = $('#user-message-div');
	div.fadeOut(100, function() {
		div.fadeIn(250);
	});		
}

//
// Forms
//

/* Unlike jQuery's serializeArray, the function below simply returns all the
   fields, regardless of whether they're disabled, checked or not etc. */
$.fn.zato.form.serialize = function(form) {

	var out = {}
	var name = '';
	var value = '';

	var fields = $(':input, textarea', form);
	$.each(fields, function(idx, elem) {
		elem = $(elem);
		name = elem.attr('name');
		if(name) {
			value = elem.val();
			if(elem.attr('type') == 'checkbox') {
				value = $.fn.zato.to_bool(value);
			}
			out[name] = value;
		}
	});
	return out;
}


/* Takes a form (ID or a jQuery object), a business object and populates the
form with values read off the object. The 'name' and 'id' attributes of the
form's fields may use custom prefixes that will be taken into account.
*/
$.fn.zato.form.populate = function(form, instance, name_prefix, id_prefix) {

	if(_.isUndefined(name_prefix)) {
		name_prefix = '';
	}
	
	if(_.isUndefined(id_prefix)) {
		id_prefix = '';
	}

	var name = '';
	var value = '';
	var form_elem = null;	
	var fields = $.fn.zato.form.serialize(form);
	
	for(field_name in fields) {
		if(field_name.indexOf(name_prefix) === 0 || field_name == 'id') {
			field_name = field_name.replace(name_prefix, '');
			for(item_attr in instance) {
				if(item_attr == field_name) {
					value = instance[item_attr];
					form_elem = $(id_prefix + field_name);
					if($.fn.zato.like_bool(value)) {
						form_elem.prop('checked', $.fn.zato.to_bool(value));
					}
					else {
						form_elem.val(value);
					}
				}
			}
		}
	}
	
}

// /////////////////////////////////////////////////////////////////////////////
// Data table begin
// /////////////////////////////////////////////////////////////////////////////

$.fn.zato.data_table.data = {}

$.fn.zato.data_table.row_updated = function(id) {
	var tr = $('#tr_'+ id)
	tr.addClass('updated');
	
	return tr;
}

$.fn.zato.data_table.parse = function() {

	var rows = $('#data-table tr').not('[class="ignore"]');
	var columns = $.fn.zato.data_table.get_columns();

	$.each(rows, function(row_idx, row) {
		var instance = new $.fn.zato.data_table.class_()
		var tds = $(row).find('td');
		$.each(tds, function(td_idx, td) {
		
			var attr_name = columns[td_idx];
			var attr_value = $(td).text().trim();

			// Don't bother with ignored attributes.
			if(attr_name[0] != '_') {
				instance[attr_name] = attr_value;
			}
		});
		$.fn.zato.data_table.data[instance.id] = instance;
	});
}

$.fn.zato.data_table.reset_form = function(form_id) {
	$(form_id).each(function() {
	  this.reset();
	});
}

$.fn.zato.data_table.cleanup = function(form_id) {

	/* Clear out the values and close the dialog.
	*/
	$.fn.zato.data_table.reset_form(form_id);
	var div_id = '';
	var parts = form_id.split('form-');
	
	if(parts == form_id) {
		parts = form_id.split('form');
		div_id = parts[0].replace('-', '') + '-div';
	}
	else {
		div_id = parts[0] + parts[1];
	}
	$(div_id).dialog('close');
}

$.fn.zato.data_table.form_info = function(button) {
	var form = $(button).closest('form');
	var form_id = form.attr('id');
	return {
		'form': form,
		'form_id': '#' + form_id,
	}
}

$.fn.zato.data_table.close = function(button) {
	var form_info = $.fn.zato.data_table.form_info(button);
	$.fn.zato.data_table.cleanup(form_info['form_id']);
}

$.fn.zato.data_table._on_submit_complete = function(data, status) {

	var msg = '';
	var success = status == 'success';
	
	if(success) {
		var response = $.parseJSON(data.responseText);
		msg = response.message; 
	}
	else {
		msg = data.responseText; 
	}
	$.fn.zato.user_message(success, msg);
}

$.fn.zato.data_table._on_submit = function(form, callback) {

	$.ajax({
		type: 'POST',
		url: form.attr('action'),
		data: form.serialize(),
		dataType: 'json',
		complete: callback
	});
}

$.fn.zato.data_table.delete_ = function(id, td_prefix, success_pattern, confirm_pattern) {

	var instance = $.fn.zato.data_table.data[id];
	
	var _callback = function(data, status) {
		var success = status == 'success';
		if(success) {

			$(td_prefix + instance.id).parent().remove();
			$.fn.zato.data_table.data[instance.id] = null;
			
			if($('#data-table tr').length == 1) {
				var row = '<tr><td>No results</td></tr>';
				$('#data-table > tbody:last').prepend(row);
			}
			
			msg = String.format(success_pattern, instance.name);
		}
		else {
			msg = data.responseText; 
		}
		$.fn.zato.user_message(success, msg);
	}
	
	var callback = function(ok) {
		if(ok) {
			var url = String.format('./delete/{0}/cluster/{1}/', id, $('#cluster_id').val());
			$.fn.zato.post(url, _callback);
			return false;
		}
	}
	var q = String.format(confirm_pattern, instance.name);
	jConfirm(q, 'Please confirm', callback);
}

$.fn.zato.data_table.on_change_password_submit = function() {

	var form = $('#change_password-form');
	if(form.data('bValidator').isValid()) {
		var _callback = function(data, status) {
			$.fn.zato.data_table.row_updated($('#id_change_password-id').val());
			$.fn.zato.data_table._on_submit_complete(data, status);
		}	
		
		$.fn.zato.data_table._on_submit(form, _callback);
		$('#change_password-div').dialog('close');
		
		return false;
	}	
}

$.fn.zato.data_table.change_password = function(id) {

	var name = $.fn.zato.data_table.data[id].name
	
	$('#change-password-name').text(name);
	$('#id_change_password-id').val(id);
	
	var title = 'Change password ';
	var div = $('#change_password-div');
	
	div.prev().text(title); // prev() is a .ui-dialog-titlebar
	div.dialog('open');
}

$.fn.zato.data_table.setup_change_password = function() {

	var form_id = '#change_password-form';

	$('#change_password-div').dialog({
		autoOpen: false,
		width: '40em',
		close: function(e, ui) {
			$.fn.zato.data_table.reset_form(form_id);
		}
	});

	var change_password_form = $('#change_password-form');
	
	change_password_form.submit(function(e) {
		e.preventDefault();
		$.fn.zato.data_table.on_change_password_submit();
		return false;
	});

    $('#id_password1').attr('data-bvalidator', 'equalto[id_password2],required');
    $('#id_password1').attr('data-bvalidator-msg', 'Both fields are required and need to be equal');
	
	$('#id_password2').attr('data-bvalidator', 'required');
    $('#id_password2').attr('data-bvalidator-msg', 'This is a required field');
	
	change_password_form.bValidator();
}

$.fn.zato.data_table._create_edit = function(action, title, id) {

	if(action == 'edit') {

		var form = $(String.format('#{0}-form', action));
		var name_prefix = action + '-';
		var id_prefix = String.format('#id_{0}', name_prefix);
		var instance = $.fn.zato.data_table.data[id];
		
		$.fn.zato.form.populate(form, instance, name_prefix, id_prefix);
	}

	var div = $(String.format('#{0}-div', action));
	div.prev().text(title); // prev() is a .ui-dialog-titlebar
	div.dialog('open');
}

$.fn.zato.data_table.add_row = function(data, action, new_row_func, include_tr) {

	var item = new $.fn.zato.data_table.class_();
	var form = $(String.format('#{0}-form', action));
	var prefix = action + '-';
	var name = '';
	var _columns = $.fn.zato.data_table.get_columns();
	
	$.each(form.serializeArray(), function(idx, elem) {
		name = elem.name.replace(prefix, '');
		item[name] = elem.value;
	})
	if(!item.id) {
		item.id = data.id;
	}
	
	if(item.is_active) {
		item.is_active = $.fn.zato.to_bool(item.is_active);
	}
	
	$.fn.zato.data_table.data[item.id] = item;
	return new_row_func(item, data, include_tr);
}

$.fn.zato.data_table.setup_forms = function(attrs) {
	var actions = ['create', 'edit'];

	/* Dynamically prepare pop-up windows.
	*/
	$.each(actions, function(ignored, action) {
		var form_id = String.format('#{0}-form', action);
		var div_id = String.format('#{0}-div', action);

		// Pop-up				
		$(div_id).dialog({
			autoOpen: false,
			width: '40em',
			height: '10em',
			close: function(e, ui) {
				$.fn.zato.data_table.reset_form(form_id);
			}
		});
	});
	
	// Change password pop-up
	$.fn.zato.data_table.setup_change_password();
	
	/* Prepare the validators here so that it's all still a valid HTML
	   even with bValidator's custom attributes.
	*/

	var field_id = '';
	var form_id = '';
	
	$.each(['', 'edit'], function(ignored, action) {
		$.each(attrs, function(ignored, attr) {
			if(action) {
				field_id = String.format('#id_{0}', attr);
			}
			else {
				field_id = String.format('#id_{0}-{1}', action, attr);
			}
			
			$(field_id).attr('data-bvalidator', 'required');
			$(field_id).attr('data-bvalidator-msg', 'This is a required field');
		});
		
		// Doh, not exactly the cleanest approach.
		if(action) {
			form_id = '#edit-form';
		}
		else {
			form_id = '#create-form';
		}
		$(form_id).bValidator();
	});

	/* Assign form submition handlers.
	*/
	
	$.each(actions, function(ignored, action) {
		$('#'+ action +'-form').submit(function() {
			$.fn.zato.data_table.on_submit(action);
			return false;
		});
	});
}

$.fn.zato.data_table.on_submit = function(action) {
	var form = $('#' + action +'-form');
	var callback = function(data, status) {
			return $.fn.zato.data_table.on_submit_complete(data, 
				status, action);
		}
	return $.fn.zato.data_table._on_submit(form, callback);
}

$.fn.zato.data_table.on_submit_complete = function(data, status, 
	action) {

	if(status == 'success') {
		var json = $.parseJSON(data.responseText);
		var include_tr = true ? action == 'create' : false;
		var row = $.fn.zato.data_table.add_row(json, action, $.fn.zato.data_table.new_row_func, include_tr);

		// 1 - Header
		// 2 - The 'No results' information that needs to be removed
		if($('#data-table tr').length == 2) {
			$('#data-table tr:last').remove();
		}
			
		if(action == 'create') {
			$('#data-table > tbody:last').prepend(row);
		}
		else {
			var tr = $('#tr_'+ json.id).html(row);
			tr.addClass('updated');
		}	
	}

	$.fn.zato.data_table._on_submit_complete(data, status);
	$.fn.zato.data_table.cleanup('#'+ action +'-form');
}

// /////////////////////////////////////////////////////////////////////////////
// Data table end
// /////////////////////////////////////////////////////////////////////////////


//
// Misc
//
$.fn.zato.get_random_string = function() {
    var elems = '1234567890qwertyuiopasdfghjklzxcvbnm'.split('');
    var s = "";
    var length = 32;

    for(var i = 0; i < length; i++) {
        s += elems[Math.floor(Math.random() * elems.length)];
    }
    return s;
}

$.fn.zato.to_bool = function(item) {
	var s = new String(item).toLowerCase();
    return(s == "true" || s == 'on'); // 'on' too because it may be a form's field
}

$.fn.zato.like_bool = function(item) {
	var s = new String(item).toLowerCase();
	
	// 'on' too because it may be a form's field
    return(s == "true" || s == 'false' || s == 'on' || _.isBoolean(item));
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


$.fn.zato.dir = function (item) {
    out = [];
    for(attr in item) {
		out.push(attr);
    }
    out.sort();
    return out;
}