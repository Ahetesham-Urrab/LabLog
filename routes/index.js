var express = require('express');
var router = express.Router();
const studentModel = require('../model/student');
const QR = require('qrcode');
const multer = require('multer');
const xlsx = require('xlsx');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.post('/add', async (req, res) => {
  try {

    const { fullname, email, roll, classs } = req.body;
    const student = new studentModel({ fullname, email, roll, classs });
    await student.save();

    const qr = await QR.toDataURL(student._id.toString());
    student.qrCode = qr;
    await student.save();

    res.redirect('/attandance');

  } catch (error) {
    res.send(500).send(error.message);
  }
});

router.get('/attandance', async (req, res, next) => {
  try {
    
    const students = await studentModel.find();
    res.render('studAttandance', {students});

  } catch (error) {
    res.send(500).send(error.message);
  }
});

router.get('/student/:id', async (req, res, next) => {
  try {
    const sId = req.params.id;
    const student = await studentModel.findById(sId);
    res.render('sinfo', {student});

  } catch (error) {
    res.send(500).send(error.message);
  }
});
router.get('/excel', (req, res) => {
  res.render('excel');
});
router.post('/upload', upload.single('excel'), (req, res) => {
  const file = req.file;
  const workbook = xlsx.readFile(file.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const students = xlsx.utils.sheet_to_json(worksheet);

  // Insert data into the database
  studentModel.insertMany(students)
      .then(() => res.send('Student data saved successfully!'))
      .catch((error) => res.status(500).send('Error saving data'));
});
router.get('/allStudInfo',async (req,res)=>{
  const stud = await studentModel.find();
  res.render('allInfo', {stud});
});

module.exports = router;
