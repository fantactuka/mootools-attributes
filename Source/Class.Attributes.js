/*
---
description: Adds attributes functionality to class instances with setters, getters, validators and change event listeners

license: MIT-style

authors:
- Maksim Horbachevsky

requires:
- /Class
- /$util

provides: [Class.Attributes]
...
*/

/**
 * @module Class.Mutators.Attributes
 * @description allows to add attributes with setters, getters, validators and some more help methods
 * @example
 *
 * var Product = new Class({
 *     Attributes: {
 *         brand: {
 *             validator: function(val) {
 *                 return val.trim().length > 1;
 *             }
 *         },
 *         model: {
 *             validator: function(val) {
 *                 return val.trim().length > 1;
 *             }
 *         },
 *         name: {
 *             readOnly: true,
 *             getter: function() {
 *                 return this.get('brand') + ' ' + this.get('model');
 *             }
 *         },
 *         price: {
 *             getter: function(val) {
 *                 return val * (100 - this.get('discount')) / 100
 *             }
 *         },
 *         discount: {
 *             value: 0 // Default value
 *         }
 *
 *     },
 *
 *     initialize: function(attributes) {
 *         this.setAttributes(attributes);
 *     }
 *
 * });
 *
 *
 * var product = new Product({
 *     brand: 'Porsche',
 *     model: '911',
 *     price: 100000,
 *     discount: 5
 * });
 *
 * product.get('name'); // -> Porsche 911
 * product.get('price'); // -> 95000
 * product.addEvent('disountChange', function(event) {
 *     alert("New discount: {newVal}% instead of {oldVal}%!".substitute(event));
 * });
 *
 * product.set('discount', 30); // -> alerts "New discount: 30% instead of 5!"
 *
 */
Class.Mutators.Attributes = function(attributes) {


    /**
     * @method $setter, $getter
     * @description in case $setter or $getter (or both) is defined in attributes list as functions they will be used as
     * default setter and getter functions for non-existing attributes.
     *
     * That means if you didn't add `name` attribute      * in the Attributes list and tries to get or set it
     * .set('name', 'Bob'), .get('name') $setter and $getter will be invoked.
     *
     * If you DON'T have $setter or $getter defined and try to access non-existing attribute - getter will
     * return undefined, setter won't do anything at all.
     *
     * @example
     * var Employee = new Class({
     *     Attributes: {
     *         age: { }
     *     }
     * });
     *
     * var employee = new Employee();
     * employee.get('name'); // -> undefined
     * employee.set('name', 'bob'); // -> do nothing, does not throw error
     *
     * var Employee = new Class({
     *     Attributes: {
     *         $getter: function(name) {
     *             return this.getCookieData(name);
     *         },
     *         age: { }
     *     },
     *
     *     initialize: function(attributes) {
     *          ...
     *     },
     *
     *     getCookieData: function(name) {
     *         return Cookie.read(name);
     *     }
     * });
     *
     * var employee = new Employee();
     * employee.get('name'); // -> cookie 'name'
     *
     *
     *
     *
     */
    var $setter = attributes.$setter, $getter = attributes.$getter;
    delete attributes.$setter;
    delete attributes.$getter;

    this.implement(new Events);

    this.implement({

        /**
         * @property $attributes
         * @description storage for instance attributes
         */
        $attributes: attributes,

        /**
         * @method get
         * @param name {String} - attribute name
         * @description attribute getter
         */
        get: function(name) {
            var attr = this.$attributes[name];
            if (attr) {
                if (attr.valueFn && !attr.initialized) {
                    attr.initialized = true;
                    attr.value = attr.valueFn.call(this);
                }

                if (attr.getter) {
                    return attr.getter.call(this, attr.value);
                } else {
                    return attr.value;
                }
            } else {
                return $getter ? $getter.call(this, name) : undefined;
            }
        },

        /**
         * @method set
         * @param name {String} - attribute name
         * @param value {Object} - attribute value
         * @description attribute setter
         */
        set: function(name, value) {
            var attr = this.$attributes[name];
            if (attr) {
                if (!attr.readOnly) {
                    var oldVal = attr.value, newVal;
                    if (!attr.validator || attr.validator.call(this, value)) {
                        if (attr.setter) {
                            newVal = attr.setter.call(this, value);
                        } else {
                            newVal = value;
                        }
                        attr.value = newVal;

                        this.fireEvent(name + 'Change', { newVal: newVal, oldVal: oldVal });
                    }
                }
            } else if($setter) {
                $setter.call(this, name, value);
            }
        },

        /**
         * @method setAttributes
         * @param attributes {Object} - a list of attributes to be set to the instance
         * @description set passed attributes passing it through .set method
         */
        setAttributes: function(attributes) {
            $each(attributes, function(value, name) {
                this.set(name, value);
            }, this);
        },

        /**
         * @method getAttributes
         * @description returns a key-value object of all instance attributes
         * @returns {Object}
         */
        getAttributes: function() {
            var attributes = {};
            $each(this.$attributes, function(value, name) {
                attributes[name] = this.get(name);
            }, this);
            return attributes;
        },

        /**
         * @method addAttributes
         * @param attributes {Object} - a list of new attributes to be added to the instance
         * @description adds list of attributes to the instance
         */
        addAttributes: function(attributes) {
            $each(attributes, function(value, name) {
                this.addAttribute(name, value);
            }, this);
        },

        /**
         * @method addAttribute
         * @param name {String} - new attribute name
         * @param value {Object} - new attribute value
         * @description adds new attribute to the instance
         */
        addAttribute: function(name, value) {
            this.$attributes[name] = value;
            return this;
        }

    });

};
