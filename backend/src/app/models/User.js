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
    password: {
      type: String,
      default: 'passwordtemp',
    },
    password_confirmation: {
      type: String,
      default: 'passwordtemp',
    },
    role: {
      type: String,
      default: 'User',
    },
    imageUrl: {
      type: String,
      default: 'https://placehold.co/200x200',
    },
    refreshToken: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', User);
