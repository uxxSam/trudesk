/*
      .                              .o8                     oooo
   .o8                             "888                     `888
 .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
   888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
   888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
   888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
   "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 ========================================================================
 Created:    02/10/2015
 Author:     Chris Brame

 */

/*
 * Handlebars Comparison Helpers
 * Copyright (c) 2013 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT).
 */
'use strict';


// node_modules
var _       = require('lodash');
var moment  = require('moment');

// The module to be exported
var helpers = {

    contains: function (str, pattern, options) {
        if (str.indexOf(pattern) !== -1) {
            return options.fn(this);
        }
        return options.inverse(this);
    },

    and: function (a, b, options) {
        if (a && b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    gt: function (value, test, options) {
        if (value > test) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    gte: function (value, test, options) {
        if (value >= test) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    is: function (value, test, options) {
        if (value === null || value === 'undefined') {
            return options.inverse(this);
        }
        if (value === test) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    isAsString: function (value, test, options) {
        if (value === null || value === 'undefined') {
            return options.inverse(this);
        }
        if (value.toString() === test.toString()) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    isnot: function (value, test, options) {
        if (value !== test) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    isNotAsString: function (value, test, options) {
        if (value === null || value === 'undefined') {
            return options.inverse(this);
        }
        if (value.toString() !== test.toString()) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    lt: function (value, test, options) {
        if (value < test) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    lte: function (value, test, options) {
        if (value <= test) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    /*
     * Or
     * Conditionally render a block if one of the values is truthy.
     */
    or: function (a, b, options) {
        if (a || b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    /*
     * ifNth
     * Conditionally render a block if mod(nr, v) is 0
     */
    ifNth: function (nr, v, options) {
        v = v+1;
        if (v % nr === 0) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    /**
     * {{#compare}}...{{/compare}}
     *
     * @credit: OOCSS
     * @param left value
     * @param operator The operator, must be between quotes ">", "=", "<=", etc...
     * @param right value
     * @param options option object sent by handlebars
     * @return {String} formatted html
     *
     * @example:
     *   {{#compare unicorns "<" ponies}}
     *     I knew it, unicorns are just low-quality ponies!
     *   {{/compare}}
     *
     *   {{#compare value ">=" 10}}
     *     The value is greater or equal than 10
     *     {{else}}
     *     The value is lower than 10
     *   {{/compare}}
     */
    compare: function(left, operator, right, options) {
        /*jshint eqeqeq: false*/

        if (arguments.length < 3) {
            throw new Error('Handlebars Helper "compare" needs 2 parameters');
        }

        if (options === undefined) {
            options = right;
            right = operator;
            operator = '===';
        }

        var operators = {
            '==':     function(l, r) {return l === r; },
            '===':    function(l, r) {return l === r; },
            '!=':     function(l, r) {return l !== r; },
            '!==':    function(l, r) {return l !== r; },
            '<':      function(l, r) {return l < r; },
            '>':      function(l, r) {return l > r; },
            '<=':     function(l, r) {return l <= r; },
            '>=':     function(l, r) {return l >= r; },
            'typeof': function(l, r) {return typeof l === r; }
        };

        if (!operators[operator]) {
            throw new Error('Handlebars Helper "compare" doesn\'t know the operator ' + operator);
        }

        var result = operators[operator](left, right);

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },


    /**
     * {{if_eq}}
     *
     * @author: Dan Harper <http://github.com/danharper>
     *
     * @param  context
     * @param  options
     * @return {Boolean}
     *
     * @example: {{if_eq this compare=that}}
     */
    if_eq: function (context, options) {
        if (context === options.hash.compare) {
            return options.fn(this);
        }
        return options.inverse(this);
    },

    /**
     * {{unless_eq}}
     * @author: Dan Harper <http://github.com/danharper>
     *
     * @param  context
     * @param  options
     * @return {Boolean}
     *
     * @example: {{unless_eq this compare=that}}
     */
    unless_eq: function (context, options) {
        if (context === options.hash.compare) {
            return options.inverse(this);
        }
        return options.fn(this);
    },

    /**
     * {{if_gt}}
     * @author: Dan Harper <http://github.com/danharper>
     *
     * @param  context
     * @param  options
     * @return {Boolean}
     *
     * @example: {{if_gt this compare=that}}
     */
    if_gt: function (context, options) {
        if (context > options.hash.compare) {
            return options.fn(this);
        }
        return options.inverse(this);
    },

    /**
     * {{unless_gt}}
     * @author: Dan Harper <http://github.com/danharper>
     *
     * @param  context
     * @param  options
     * @return {Boolean}
     *
     * @example: {{unless_gt this compare=that}}
     */
    unless_gt: function (context, options) {
        if (context > options.hash.compare) {
            return options.inverse(this);
        }
        return options.fn(this);
    },

    /**
     * {{if_lt}}
     * @author: Dan Harper <http://github.com/danharper>
     *
     * @param  context
     * @param  options
     * @return {Boolean}
     *
     * @example: {{if_lt this compare=that}}
     */
    if_lt: function (context, options) {
        if (context < options.hash.compare) {
            return options.fn(this);
        }
        return options.inverse(this);
    },

    /**
     * {{unless_lt}}
     * @author: Dan Harper <http://github.com/danharper>
     *
     * @param  context
     * @param  options
     * @return {Boolean}
     *
     * @example: {{unless_lt this compare=that}}
     */
    unless_lt: function (context, options) {
        if (context < options.hash.compare) {
            return options.inverse(this);
        }
        return options.fn(this);
    },

    /**
     * {{if_gteq}}
     * @author: Dan Harper <http://github.com/danharper>
     *
     * @param  context
     * @param  options
     * @return {Boolean}
     *
     * @example: {{if_gteq this compare=that}}
     */
    if_gteq: function (context, options) {
        if (context >= options.hash.compare) {
            return options.fn(this);
        }
        return options.inverse(this);
    },

    /**
     * {{unless_gteq}}
     * @author: Dan Harper <http://github.com/danharper>
     *
     * @param  context
     * @param  options
     * @return {Boolean}
     *
     * @example: {{unless_gteq this compare=that}}
     */
    unless_gteq: function (context, options) {
        if (context >= options.hash.compare) {
            return options.inverse(this);
        }
        return options.fn(this);
    },

    /**
     * {{if_lteq}}
     * @author: Dan Harper <http://github.com/danharper>
     *
     * @param  context
     * @param  options
     * @return {Boolean}
     *
     * @example: {{if_lteq this compare=that}}
     */
    if_lteq: function (context, options) {
        if (context <= options.hash.compare) {
            return options.fn(this);
        }
        return options.inverse(this);
    },

    /**
     * {{unless_lteq}}
     * @author: Dan Harper <http://github.com/danharper>
     *
     * @param  context
     * @param  options
     * @return {Boolean}
     *
     * @example: {{unless_lteq this compare=that}}
     */
    unless_lteq: function (context, options) {
        if (context <= options.hash.compare) {
            return options.inverse(this);
        }
        return options.fn(this);
    },

    /**
     * {{ifAny}}
     * Similar to {{#if}} block helper but accepts multiple arguments.
     * @author: Dan Harper <http://github.com/danharper>
     *
     * @param  context
     * @param  options
     * @return {Boolean}
     *
     * @example: {{ifAny this compare=that}}
     */
    ifAny: function () {
        var argLength = arguments.length - 2;
        var content = arguments[argLength + 1];
        var success = true;
        var i = 0;
        while (i < argLength) {
            if (!arguments[i]) {
                success = false;
                break;
            }
            i += 1;
        }
        if (success) {
            return content(this);
        } else {
            return content.inverse(this);
        }
    },

    /**
     * {{ifEven}}
     * Determine whether or not the @index is an even number or not
     * @author: Stack Overflow Answer <http://stackoverflow.com/questions/18976274/odd-and-even-number-comparison-helper-for-handlebars/18993156#18993156>
     * @author: Michael Sheedy <http://github.com/sheedy> (found code and added to repo)
     *
     * @param  context
     * @param  options
     * @return {Boolean}
     *
     * @example: {{ifEven @index}}
     */
    ifEven: function (conditional, options) {
        if ((conditional % 2) === 0) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    /**
     * {{forEach}}
     * Credit: http://bit.ly/14HLaDR
     *
     * @param  {Array}   array
     * @param  {Function} fn
     *
     * @example:
     *   var accounts = [
     *     {'name': 'John', 'email': 'john@example.com'},
     *     {'name': 'Malcolm', 'email': 'malcolm@example.com'},
     *     {'name': 'David', 'email': 'david@example.com'}
     *   ];
     *
     *   {{#forEach accounts}}
     *     <a href="mailto:{{ email }}" title="Send an email to {{ name }}">
     *       {{ name }}
     *     </a>{{#unless isLast}}, {{/unless}}
     *   {{/forEach}}
     */
    forEach: function (array, fn) {
        var total = array.length;
        var buffer = "";
        // Better performance: http://jsperf.com/for-vs-forEach/2
        var i = 0;
        while (i < total) {
            // stick an index property onto the item, starting
            // with 1, may make configurable later
            var item = array[i];
            item['index'] = i + 1;
            item['_total'] = total;
            item['isFirst'] = i === 0;
            item['isLast'] = i === (total - 1);
            // show the inside of the block
            buffer += fn.fn(item);
            i++;
        }
        // return the finished buffer
        return buffer;
    },

    formatNumber: function(num) {
          return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    now: function() {
        return new moment();
    },

    formatDate: function(date, format) {
        return moment(date).format(format);
    },

    calendarDate: function(date) {
        moment.updateLocale('en', {
            calendar: {
                sameDay: '[Today at] LT',
                lastDay: '[Yesterday at] LT',
                nextDay: '[Tomorrow at] LT',
                lastWeek: '[Last] ddd [at] LT',
                nextWeek: 'ddd [at] LT',
                sameElse: 'L'
            }
        });
        return moment(date).calendar();
    },

    fromNow: function(date) {
        if (date === undefined)
            return 'Never';
        moment.updateLocale('en', {
            relativeTime : {
                future: "in %s",
                past:   "%s ago",
                s:  "a few seconds",
                m:  "1m",
                mm: "%dm",
                h:  "1h",
                hh: "%dh",
                d:  "1d",
                dd: "%dd",
                M:  "1mo",
                MM: "%dmos",
                y:  "1y",
                yy: "%dyrs"
            }
        });

        return moment(date).fromNow();
    },

    firstCap: function(str) {
        return _.capitalize(str);
    },

    lowercase: function(str) {
        return str.toLowerCase();
    },

    substring: function(start, len, options) {
        return options.fn(this).toString().substr(start, len);
    },

    isNotNull: function(obj, options) {
        if (!(_.isUndefined(obj) || _.isNull(obj))) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    split: function(arr, sep) {
        var str = "";
        _.each(arr, function(obj) {
            str += obj + " " + sep + " ";
        });

        return str;
    },

    trim: function(string) {
        return string.trim();
    },

    isNull: function(obj, options) {
        if((_.isUndefined(obj) || _.isNull(obj))) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    checkPerm: function(user, perm, options) {
        var P = require('../../permissions');
        if (_.isUndefined(user)) return options.inverse(this);

        if (P.canThis(user.role, perm)) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    checkRole: function(role, perm, options) {
        var P = require('../../permissions');
        if (P.canThis(role, perm)) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    checkPlugin: function(user, permissions, options) {
        if (user === undefined || permissions === undefined)
            return options.inverse(this);
        var pluginPermissions = permissions.split(' ');
        var result = false;
        for (var i = 0; i < pluginPermissions.length; i++) {
            if (pluginPermissions[i] === user.role)
                result = true;
        }

        if (result)
            return options.fn(this);
        else
            return options.inverse(this);
    },

    checkEditSelf: function(user, owner, perm, options) {
        var P = require('../../permissions');
        if (P.canThis(user.role, perm + ':editSelf')) {
            if (user._id.toString() === owner._id.toString()) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        }

        return options.inverse(this);
    },

    hasGroup: function(arr, value, options) {
        var result = _.some(arr, function(i) {
            if (_.isUndefined(i) || _.isUndefined(value)) return false;
            return i._id.toString() === value.toString();
        });
        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    isSubscribed: function(arr, value) {
        return _.some(arr, function(i) {
            if (_.isUndefined(i) || _.isUndefined(value)) return false;
            return i._id.toString() === value.toString();
        });
    },

    json: function(str) {
        return JSON.stringify(str);
    },

    size: function(arr) {
        return _.size(arr);
    },

    add: function(num1, num2) {
        return num1+num2;
    },

    overdue: function(showOverdue, updated, options) {
        if (!showOverdue) return false;
        var now = moment();
        updated = moment(updated);
        var timeout = updated.clone().add(2, 'd');

        var result = now.isAfter(timeout);

        if (result)
            return options.fn(this);
        else
            return options.inverse(this);

    },

    statusName: function(status) {
        var str = '';
        switch (status) {
            case 0:
                str = 'New';
                break;
            case 1:
                str = 'Open';
                break;
            case 2:
                str = 'Pending';
                break;
            case 3:
                str = 'Closed';
                break;
            default:
                str = 'New';
        }

        return str;
    }
};

// Aliases
helpers.ifeq       = helpers.if_eq;
helpers.unlessEq   = helpers.unless_eq;
helpers.ifgt       = helpers.if_gt;
helpers.unlessGt   = helpers.unless_gt;
helpers.iflt       = helpers.if_lt;
helpers.unlessLt   = helpers.unless_lt;
helpers.ifgteq     = helpers.if_gteq;
helpers.unlessGtEq = helpers.unless_gteq;
helpers.ifLtEq     = helpers.if_lteq;
helpers.unlessLtEq = helpers.unless_lteq;
helpers.foreach    = helpers.forEach;
helpers.canUser    = helpers.checkPerm;
helpers.canUserRole = helpers.checkRole;
helpers.canEditSelf = helpers.checkEditSelf;
helpers.hasPluginPerm = helpers.checkPlugin;
helpers.inArray    = helpers.hasGroup;


// Export helpers
module.exports.helpers = helpers;
module.exports.register = function (Handlebars) {

    for (var helper in helpers) {
        if (helpers.hasOwnProperty(helper)) {
            Handlebars.registerHelper(helper, helpers[helper]);
        }
    }
};
