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

var async   = require('async'),
    _       = require('lodash'),
    winston = require('winston'),
    moment  = require('moment'),
    permissions     = require('../../permissions');

var viewController = {};
var viewdata = {};
viewdata.notifications = {};
viewdata.users = {};

viewController.getData = function(request, cb) {
      async.parallel([
          function(callback) {
              viewController.getActiveNotice(function(err, data) {
                  if (err) return callback(err);
                  viewdata.notice = data;
                  viewdata.noticeCookieName = undefined;

                  if (!_.isUndefined(data) && !_.isNull(data))
                    viewdata.noticeCookieName = data.name + "_" + moment(data.activeDate).format("MMMDDYYYY_HHmmss");

                  return callback();
              });
          },
          function(callback) {
              viewController.getUserNotifications(request, function(err, data) {
                  if (err) return callback(err);

                  viewdata.notifications.items = data;
                  return callback();
              })
          },
          function(callback) {
              viewController.getUnreadNotificationsCount(request, function(err, count) {
                  if (err) return callback(err);
                  viewdata.notifications.unreadCount = count;
                  return callback();
              });
          },
          function(callback) {
              viewController.getConversations(request, function(err, conversations) {
                  if (err) return callback(err);

                  viewdata.conversations = conversations;

                  return callback();
              });
          },
          function(callback) {
              viewController.getUsers(request, function(users) {
                  viewdata.users = users;

                  return callback();
              });
          },
          function(callback) {
              viewController.loggedInAccount(request, function(data) {
                  viewdata.loggedInAccount = data;
                  return callback();
              });
          },
          function(callback) {
              viewController.getGroups(request, function(err, data) {
                  if (err) return callback(null, null);

                  viewdata.groups = data;

                  return callback();
              });
          },
          function(callback) {
              viewController.getTypes(request, function(err, data) {
                  if (err) return callback();

                  viewdata.ticketTypes = data;

                  return callback();
              });
          },
          function(callback) {
              viewController.getTags(request, function(err, data) {
                  if (err) return callback();

                  viewdata.ticketTags = data;

                  return callback();
              });
          },
          function(callback) {
              viewdata.roles = permissions.roles;
              return callback();
          },
          function(callback) {
            viewController.getShowTourSetting(request, function(err, data) {
                viewdata.showTour = data;

                return callback();
            });
          },
          function(callback) {
              viewController.getOverdueSetting(request, function(err, data) {
                  viewdata.showOverdue = data;

                  return callback();
              });
          },
          function(callback) {
            viewController.getPluginsInfo(request, function(err, data) {
                viewdata.plugins = data;

                return callback();
            });
          }
      ], function(err) {
          if (err) {
              winston.warn('Error: ' + err);
          }

          return cb(viewdata);
      });
};

viewController.getActiveNotice = function(callback) {
    var noticeSchema = require('../../models/notice');
    noticeSchema.getActive(function(err, notice) {
        if (err) {
            winston.warn(err.message);
            return callback(err);
        }

        return callback(null, notice);
    });
};

viewController.getUserNotifications = function(request, callback) {
    var notificationsSchema = require('../../models/notification');
    notificationsSchema.findAllForUser(request.user._id, function(err, data) {
        if (err) {
            winston.warn(err.message);
            return callback(err);
        }

        // data = _.take(data, 5);

        return callback(null, data);
    })
};

viewController.getUnreadNotificationsCount = function(request, callback) {
    var notificationsSchema = require('../../models/notification');
    notificationsSchema.getUnreadCount(request.user._id, function(err, count) {
        if (err) {
            winston.warn(err.message);
            return callback(err);
        }

        return callback(null, count);
    });
};

viewController.getConversations = function(request, callback) {
    var conversationSchema = require('../../models/chat/conversation');
    var messageSchema = require('../../models/chat/message');
    conversationSchema.getConversationsWithLimit(request.user._id, 10, function(err, conversations) {
        if (err) {
            winston.warn(err.message);
            return callback(err);
        }

        var convos = [];

        async.eachSeries(conversations, function(convo, done) {
            var c = convo.toObject();

            var userMeta = convo.userMeta[_.findIndex(convo.userMeta, function(item) { return item.userId.toString() === request.user._id.toString(); })];
            if (!_.isUndefined(userMeta) && !_.isUndefined(userMeta.deletedAt) && userMeta.deletedAt > convo.updatedAt) {
                return done();
            }

            messageSchema.getMostRecentMessage(c._id, function(err, rm) {
                if (err) return done(err);

                _.each(c.participants, function(p) {
                    if (p._id.toString() !== request.user._id.toString())
                        c.partner = p;
                });

                rm = _.first(rm);

                if (!_.isUndefined(rm)) {
                    if (String(c.partner._id) === String(rm.owner._id)) {
                        c.recentMessage = c.partner.fullname + ': ' + rm.body;
                    } else {
                        c.recentMessage = 'You: ' + rm.body
                    }
                } else {
                    c.recentMessage = 'New Conversation';
                }

                convos.push(c);

                return done();
            })

        }, function(err) {
            return callback(err, convos);
        });
    });
};

viewController.getUsers = function(request, callback) {
    var userSchema = require('../../models/user');
    userSchema.findAll(function(err, users) {
        if (err) {
            winston.warn(err);
            return callback();
        }

        var u = _.reject(users, function(u) { return u.deleted === true; });
        u.password = null;
        u.role = null;
        u.resetPassHash = null;
        u.resetPassExpire = null;
        u.accessToken = null;
        u.iOSDeviceTokens = null;
        u.preferences = null;
        u.tOTPKey = null;

        u = _.sortBy(u, 'fullname');

        return callback(u);
    });
};

viewController.loggedInAccount = function(request, callback) {
    var userSchema = require('../../models/user');
    userSchema.getUser(request.user._id, function(err, data) {
        if (err) {
            return callback(err);
        }

        return callback(data);
    });
};

viewController.getGroups = function(request, callback) {
    var groupSchema = require('../../models/group');
    groupSchema.getAllGroupsOfUserNoPopulate(request.user._id, function(err, data) {
        if (err) {
            winston.debug(err);
            return callback(err);
        }

        var p = require('../../permissions');
        if (p.canThis(request.user.role, 'ticket:public')) {
            groupSchema.getAllPublicGroups(function(err, groups) {
                if (err) {
                    winston.debug(err);
                    return callback(err);
                }

                data = data.concat(groups);
                return callback(null, data);
            });
        } else
            return callback(null, data);
    });
};

viewController.getTypes = function(request, callback) {
    var typeSchema = require('../../models/tickettype');

    typeSchema.getTypes(function(err, data) {
        if (err) {
            winston.debug(err);
            return callback(err);
        }

        return callback(null, data);
    });
};

viewController.getTags = function(request, callback) {
    var tagSchema = require('../../models/tag');

    tagSchema.getTags(function(err, data) {
        if (err){
            winston.debug(err);
            return callback(err);
        }

        data = _.sortBy(data, 'name');

        return callback(null, data);
    });
};

viewController.getOverdueSetting = function(request, callback) {
    var settingSchema = require('../../models/setting');
    settingSchema.getSettingByName('showOverdueTickets:enable', function(err, data) {
        if (err) {
            winston.debug(err);
            return callback(null, true);
        }
        if (_.isNull(data)) return callback(null, true);
        return callback(null, data.value);
    });
};

viewController.getShowTourSetting = function(request, callback) {
    var settingSchema = require('../../models/setting');
    settingSchema.getSettingByName('showTour:enable', function(err, data) {
        if (err) {
            winston.debug(err);
            return callback(null, true);
        }

        if (!_.isNull(data) && !_.isUndefined(data) && data === false)
            return callback(null, true);

        var userSchema = require('../../models/user');
        userSchema.getUser(request.user._id, function(err, user) {
            var hasTourCompleted = false;
            if (user.preferences.tourCompleted === undefined) {
                hasTourCompleted = false;
            } else {
                hasTourCompleted = user.preferences.tourCompleted;
            }

            if (hasTourCompleted) return callback(null, false);

            if (_.isNull(data)) return callback(null, true);

            return callback(null, data.value);
        });
    })
};

viewController.getPluginsInfo = function(request, callback) {
    //Load Plugin routes
    var dive = require('dive');
    var path = require('path');
    var fs = require('fs');
    var pluginDir = path.join(__dirname, '../../../plugins');
    if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir);
    var plugins = [];
    dive(pluginDir, {directories: true, files: false, recursive: false}, function(err, dir) {
        if (err) throw err;
        delete require.cache[require.resolve(path.join(dir, '/plugin.json'))];
        var pluginPackage = require(path.join(dir, '/plugin.json'));
        plugins.push(pluginPackage);
    }, function() {
        return callback(null, _.sortBy(plugins, 'name'));
    });

};

module.exports = viewController;
