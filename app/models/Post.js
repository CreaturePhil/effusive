var mongoose = require('mongoose');
var secrets = require('../../config/secrets');
var Hashids = require('hashids');
var hashids = new Hashids(secrets.hashidSecret);

var postSchema = new mongoose.Schema({
  title: String,
  author: String,
  date: Date,
  body: String,
  comments: [{ 
    cid: { type: String, unique: true },
    body: String,
    date: Date, 
    author: String 
  }]
});

/**
 * Get hashid of an post.
 * Used to display distinct urls of posts.
 */

postSchema.methods.getHash = function() {
  return hashids.encodeHex(this._id);
};

module.exports = mongoose.model('Post', postSchema);
