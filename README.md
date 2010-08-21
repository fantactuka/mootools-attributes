Class.Attributes
===========

Provides simple attributes definition with setters, getters, validators and change event handlers

How to use
----------

All you have to do is add *Attributes* defenition to your class

	#JS
	var Employee = new Class({

		Attributes: {
			name: {
				value: 'Unnamed',
				validator: function(val) {
					return val.trim().length > 2;
				}
			},
			salary: {
				getter: function(val) {
					return this.get('currency') + val;
				}
			},
			currency: {
				value: '$'
			}
		},

		initialize: function(attributes) {
			this.setAttributes(attributes);
		}

	});

Now you're able to create instance with initial attributes (like options)

	#JS
	var bob = new Employee({
		name: 'Bob',
		salary: 10000
	});

Add events to listen attributes changes

	#JS
	bob.addEvent('salaryChange', function(event) {
		alert('Old salary: {oldVal}, new salary: {newVal}'.substitute(event));
	});

Set attributes

	#JS
	bob.set('salary', 12000); // alert text: 'Old salary: 10000, new salary: 12000';

Get attributes

	#JS
	bob.get('salary'); // '$12000' - since we defined getter

Validate attributes

	#JS
	bob.set('name', 'B'); // Will not set name since we have length validator


Attribute properties
----------

Attribute can have following properties:

* `value` - default value of the attribute
* `valueFn` - function that will run instead of simple value. Could be used if your value depends on other instance values. The difference with setter it that valueFn is executed only at the very first getter call.
* `setter` - method that will process value and store it when you use `instance.set(attr, value)`
* `getter` - method that will process stored value and return it when you use `instance.get(attr)`
* `readOnly` - if true setter won't change the value

Also when value is changed (in case it successfully validated) the instance fires attrChange event, e.g.: `nameChange`, `salaryChange`, etc






