const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    timing: { type: String, required: true },
    teacher: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'student' }]
});

module.exports = mongoose.model('Batch', batchSchema);
