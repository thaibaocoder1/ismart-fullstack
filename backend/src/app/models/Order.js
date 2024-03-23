const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Order = new Schema(
  {
    fullname: { type: String, require: true },
    email: { type: String, require: true },
    address: { type: String, require: true },
    phone: { type: Number, require: true },
    note: { type: String },
    status: { type: Number, require: true },
    userID: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Order', Order);
