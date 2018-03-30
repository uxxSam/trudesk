/*
     .                              .o8                     oooo
   .o8                             "888                     `888
 .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
   888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
   888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
   888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
   "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 ========================================================================
 Created:    12/28/2015
 Author:     Chris Brame

 **/

var mongoose = require('mongoose');

var COLLECTION = 'tags';

/**
 * Tag Schema
 * @module models/tag
 * @class Tag

 *
 * @property {object} _id ```Required``` ```unique``` MongoDB Object ID
 * @property {String} name ```Required``` ```unique``` Name of Tag
 */
var tagSchema = mongoose.Schema({
    name:       { type: String, required: true, unique: true }
});

tagSchema.statics.getTag = function(id, callback) {
    var q = this.model(COLLECTION).findOne({_id: id});

    return q.exec(callback);
};

/**
 * Return all Tags
 *
 * @memberof Tag
 * @static
 * @method getTags
 *
 * @param {QueryCallback} callback MongoDB Query Callback
 */
tagSchema.statics.getTags = function(callback) {
    var q = this.model(COLLECTION).find({});

    return q.exec(callback);
};

tagSchema.statics.getTagByName = function(tagName, callback) {
    var q = this.model(COLLECTION).find({name: tagName}).limit(1);

    return q.exec(callback);
};

tagSchema.statics.tagExist = function(tagName, callback) {
    var q = this.model(COLLECTION).count({name: tagName});

    return q.exec(callback);
};

module.exports = mongoose.model(COLLECTION, tagSchema);