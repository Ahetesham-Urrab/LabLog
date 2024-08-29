const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/qrSystem");

const studentSchema = mongoose.Schema({
    fullname: String,
    email: String,
    roll: String,
    classs: String,
    qrCode: String,
});

module.exports = mongoose.model("student", studentSchema);