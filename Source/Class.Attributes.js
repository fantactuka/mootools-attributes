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

Class.Mutators.Attributes = function(attributes) {

    var $setter = attributes.$setter, $getter = attributes.$getter;
    delete attributes.$setter;
    delete attributes.$getter;

    this.implement(new Events);

    this.implement({

        $attributes: attributes,

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
                return $getter ? $getter(name) : undefined;
            }
        },

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
                $setter(name, value);
            }
        },

        setAttributes: function(attributes) {
            $each(attributes, function(value, name) {
                this.set(name, value);
            }, this);
        },

        getAttributes: function() {
            var attributes = {};
            $each(this.$attributes, function(value, name) {
                attributes[name] = this.get(name);
            }, this);
            return attributes;
        }

    });

};
