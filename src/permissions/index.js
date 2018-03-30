
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

 **/

var _       = require('lodash');
var roles   = require('./roles');


/***
 * Checks to see if a role as the given action
 * @param role [role to check against]
 * @param a [action to check]
 * @returns {boolean}
 */

var canThis = function(role, a) {
    if (_.isUndefined(role)) return false;

    var rolePerm = _.find(roles, {'id': role});
    if (_.isUndefined(rolePerm)) return false;

    if (_.indexOf(rolePerm.allowedAction, '*') !== -1) return true;

    var actionType = a.split(':')[0];
    var action = a.split(':')[1];

    if (_.isUndefined(actionType) || _.isUndefined(action)) return false;

    var result = _.filter(rolePerm.allowedAction, function(value) {
        if (_.startsWith(value, actionType + ':')) return value;
    });

    if (_.isUndefined(result) || _.size(result) < 1) return false;
    if (_.size(result) === 1) {
        if (result[0] === '*') return true;
    }

    var typePerm = result[0].split(':')[1].split(' ');
    typePerm = _.uniq(typePerm);

    if (_.indexOf(typePerm, '*') !== -1) return true;

    return _.indexOf(typePerm, action) !== -1;
};

var getRoles = function(action) {
    if (_.isUndefined(action)) return false;

    var rolesWithAction = [];

    _.each(roles, function(role) {
        var actionType = action.split(':')[0];
        var theAction = action.split(':')[1];

        if (_.isUndefined(actionType) || _.isUndefined(theAction)) return false;
        if (_.indexOf(role.allowedAction, '*') !== -1) {
            rolesWithAction.push(role);
            return;
        }

        var result = _.filter(role.allowedAction, function(value) {
            if (_.startsWith(value, actionType + ':')) return value;
        });

        if (_.isUndefined(result) || _.size(result) < 1) return;
        if (_.size(result) === 1) {
            if (result[0] === '*') {
                rolesWithAction.push(role);
                return;
            }
        }

        var typePerm = result[0].split(':')[1].split(' ');
        typePerm = _.uniq(typePerm);

        if (_.indexOf(typePerm, '*') !== -1) {
            rolesWithAction.push(role);
            return;
        }

        if (_.indexOf(typePerm, theAction) !== -1)
            rolesWithAction.push(role);
    });

    rolesWithAction = _.uniq(rolesWithAction);

    return rolesWithAction;
};

module.exports = {
    roles: roles,
    canThis: canThis,
    getRoles: getRoles
};
