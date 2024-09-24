const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'student' },
    checkInTime: { type: Date, required: true },
    checkedOut: { type: Boolean, default: false },
    checkOutTime: Date,
    status: { type: String, enum: ['Present', 'Absent'], default: 'Absent' },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
