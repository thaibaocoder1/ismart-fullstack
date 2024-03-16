const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const Schema = mongoose.Schema;

const User = new Schema(
  {
    fullname: String,
    username: String,
    email: String,
    phone: String,
    password: String,
    password_confirmation: String,
    role: {
      type: String,
      default: 'User',
    },
    imageUrl: String,
    refreshToken: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', User);
