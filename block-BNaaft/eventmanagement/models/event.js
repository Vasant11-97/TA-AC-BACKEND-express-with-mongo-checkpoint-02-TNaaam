var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    host: { type: String, required: true },
    start_date: { type: Date },
    end_date: { type: Date },
    eventCategory: [{type: String}],
    eventCategory_Id: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    location: { type: String },
    likes: { type: Number, default: 0 },
    remarks: [{ type: Schema.Types.ObjectId, ref: 'Remark' }],
  },
  { timestamps: true }
);

var Event = mongoose.model('Event', eventSchema);
module.exports = Event;
