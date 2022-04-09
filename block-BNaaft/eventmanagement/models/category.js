var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema(
  {
    name: { type: String },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  },
  { timestamps: true }
);

var Category = mongoose.model('Category', categorySchema);
module.exports = Category;
