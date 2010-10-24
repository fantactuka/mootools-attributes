var employee, $each = window['$each'] || Object.each;

var Employee = new Class({

    Attributes: {

        $getter: function(attr) {
            return attr;
        },

        $setter: function(attr/*, value*/) {
            return attr;
        },

        name: {
            value: 'Unnamed',
            validator: function(value) {
                return value.trim().length > 2;
            }
        },
        birthdate: {
            setter: function(value) {
                return new Date(value);
            }
        },
        age: {
            valueFn: function() {
                var birthdate = this.get('birthdate');
                var today = new Date('2010 08 21');
                var age = today.getFullYear() - birthdate.getFullYear();
                if (today.setFullYear(birthdate.getFullYear()) < birthdate) age--;
                return age;
            },
            readOnly: true
        },
        salary: {
            getter: function(value) {
                return '$' + value;
            }
        },
        hobby: {

        }
    },

    initialize: function() {
    }

});

describe('Class.Attributes', {

    'before each': function() {
        employee = new Employee();
    },

    'should have get/set methods for instance': function() {
        value_of(employee.get).should_not_be_undefined();
        value_of(employee.set).should_not_be_undefined();
    },

    'should return default value with getter': function() {
        value_of(employee.get('name')).should_be('Unnamed');
    },

    'should set value with setter': function() {
        employee.set('name', 'Bob');
        value_of(employee.get('name')).should_be('Bob');
    },

    'should use validator before setting value': function() {
        employee.set('name', 'Bo');
        value_of(employee.get('name')).should_be('Unnamed');
    },

    'should set value as is in case no validator provided': function() {
        employee.set('hobby', 'Table tennis');
        value_of(employee.get('hobby')).should_be('Table tennis');
    },

    'should use getter function if defined': function() {
        employee.set('salary', 1000);
        value_of(employee.get('salary')).should_be('$1000');
    },

    'should use setter function if defined': function() {
        employee.set('birthdate', '1988 Jan 12');
        value_of(+ employee.get('birthdate')).should_be(+ new Date('1988 Jan 12'));
    },

    'should not use setter if attribute is readOnly': function() {
        employee.set('birthdate', '1988 Jan 12');
        employee.set('age', 43);
        value_of(employee.get('age')).should_be(22);
    },

    'should use valueFn function if defined': function() {
        employee.set('birthdate', '1988 Jan 12');
        value_of(employee.get('age')).should_be(22);
    },

    'should provide setAttributes method': function() {
        employee.setAttributes({
            name: 'Sam',
            birthdate: '1970 Jan 1'
        });
        value_of(employee.get('name')).should_be('Sam');
        value_of(+ employee.get('birthdate')).should_be(+ new Date('1970 Jan 1'));
    },

    'should provide getAttributes method': function() {
        employee.setAttributes({
            name: 'Sam',
            birthdate: '1988 Jan 12',
            salary: 1000,
            hobby: 'Table tennis'
        });
        value_of(employee.getAttributes()).should_be({
            name: 'Sam',
            birthdate: new Date('1988 Jan 12'),
            age: 22,
            salary: '$1000',
            hobby: 'Table tennis'
        });
    },

    'should fire change event': function() {
        employee.addEvent('nameChange', function(event) {
            value_of(event).should_be({
                oldVal: 'Unnamed',
                newVal: 'Bob'
            });
        });
        employee.set('name', 'Bob');
    },

    'should correctly work with non-existing attributes': function() {
        employee.set('no-existing-attribute', 1);
        // Since $getter defined that just returns attr name
        value_of(employee.get('no-existing-attribute')).should_be('no-existing-attribute');
    },

    '$getter and $setter should not be removed from attributes list': function() {
        value_of(employee.$attributes.$getter).should_be_undefined();
        value_of(employee.$attributes.$setter).should_be_undefined();
        value_of(employee.get('$setter')).should_be('$setter');
        value_of(employee.get('$getter')).should_be('$getter');
    }

});
