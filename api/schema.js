const mongoose = require('mongoose');

mongoose.Promise = Promise;
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: String,
  encMessage: {
    type: String,
    required: true
  },
  expiration: String
}, { collection: 'message', timestamps: false });

const Message = mongoose.model('message', messageSchema);

module.exports = { Message };
