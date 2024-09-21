const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/qrSystem");

const BatchSchema = new mongoose.Schema({
    batchName: { type: String, required: true },
    teacherName: { type: String, required: true },
    subject: { type: String, required: true },
    classTime: { type: String, required: true }, // Example: '09:00 AM - 11:00 AM'
  });


module.exports = mongoose.model('Batch', BatchSchema);
