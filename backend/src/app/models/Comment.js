const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Comment = new Schema(
  {
    title: { type: String, require: true },
    userID: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Comment', Comment);
