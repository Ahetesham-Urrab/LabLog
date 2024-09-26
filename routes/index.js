var express = require('express');
var router = express.Router();
const studentModel = require('../model/student'); 
const AttModule = require('../model/attandance');
const BatchModule = require('../model/batch');
const QR = require('qrcode');
const multer = require('multer');
const xlsx = require('xlsx');
const bwipjs = require('bwip-js');
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
router.get('/students',async function (req, res, next) {
  try {
    let students = await studentModel.find(); // Replace with your actual data fetching logic

    // Remove duplicate students based on email
    const uniqueStudents = [];
    const emailSet = new Set();

    students.forEach(student => {
        if (!emailSet.has(student.email)) {
            uniqueStudents.push(student);
            emailSet.add(student.email);
        }
    });

    res.render('std', { students: uniqueStudents });
} catch (error) {
    console.error(error);
    res.status(500).send('Server error');
}
});


// router.post('/add', async (req, res) => {
//   try {

//     const { fullname, email, roll, classs } = req.body;
//     const student = new studentModel({ fullname, email, roll, classs });
//     await student.save();

//     const qr = await QR.toDataURL(student._id.toString());
//     student.qrCode = qr;
//     await student.save();

//     res.redirect('/attandance');

//   } catch (error) {
//     res.send(500).send(error.message);
//   }
// });

router.get('/attandance', async (req, res, next) => {
  try {
    
    const students = await studentModel.find();
    res.render('studAttandance', {students});

  } catch (error) {
    res.send(500).send(error.message);
  }
});
router.get('/attandance2', async (req, res, next) => {
  try {
    
    const students = await studentModel.find();
    res.render('ckout', {students});

  } catch (error) {
    res.send(500).send(error.message);
  }
});

router.get('/student/:sid', async (req, res, next) => {
  try {
    const sid = req.params.sid;

    // Find student by SID
    const student = await studentModel.findOne({ sid });

    if (student) {
      // Check for active attendance record
      const attendanceRecord = await AttModule.findOne({ student: student._id, checkedOut: false });

      if (attendanceRecord) {
        // If already checked in, show a message
        res.render('sinfo', { student, attendance: attendanceRecord, message: 'Already checked in.' });
      } else {
        // If not checked in, create a new attendance record
        const newAttendance = new AttModule({
          student: student._id,
          checkInTime: new Date(),
          status: 'Present',
        });
        await newAttendance.save();
        res.render('sinfo', { student, attendance: newAttendance, message: 'Check-in successful!' });
      }
    } else {
      res.status(404).send('Student not found');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
});

// router.get('/studentout/:sid', async (req, res) => {
//   try {
//     const sid = req.params.sid;

//     // Find student by SID
//     const student = await studentModel.findOne({ sid });

//     if (student) {
//       // Find the attendance record for the student that is not checked out
//       const attendanceRecord = await AttModule.findOne({ student: student._id, checkedOut: false });

//       if (attendanceRecord) {
//         const currentTime = new Date();
//         const checkInTime = attendanceRecord.checkInTime;
//         const timeDifference = (currentTime - checkInTime) / 1000 / 60; // Difference in minutes
//         var totalTime = 0;
//         // Check if the student has been checked in for at least 10 minutes
//         if (timeDifference < 1) {
//           res.render('sinfo', {
//             student,
//             attendance: attendanceRecord,
//             message: 'You must wait at least 10 minutes before checking out.',
//             totalTime: null,
//           });
//           return; // Exit early if under 10 minutes
//         }

//         // Update the checkout time
//         attendanceRecord.checkOutTime = currentTime;
//         attendanceRecord.checkedOut = true; // Mark as checked out
//         await attendanceRecord.save();

//         // Calculate total time spent in the lab
//          totalTime = Math.abs(attendanceRecord.checkOutTime - attendanceRecord.checkInTime); // Difference in milliseconds
//         const totalMinutes = Math.floor(totalTime / 60000);
//         const totalHours = Math.floor(totalMinutes / 60);
//         const remainingMinutes = totalMinutes % 60;

//         // Render the student info page with updated attendance record and total time
//         res.render('sinfo', {
//           student,
//           attendance: attendanceRecord,
//           message: 'Checked out time saved successfully!',
//           totalTime: { hours: totalHours, minutes: remainingMinutes },
//         });
//       } else {
//         res.render('sinfo', { student, message: 'No active check-in record found for this student.' });
//       }
//     } else {
//       res.status(404).send('Student not found');
//     }
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });
router.get('/studentout/:sid', async (req, res) => {
  try {
    const sid = req.params.sid;

    // Find student by SID
    const student = await studentModel.findOne({ sid });

    if (student) {
      // Find the attendance record for the student that is not checked out
      const attendanceRecord = await AttModule.findOne({ student: student._id, checkedOut: false });

      if (attendanceRecord) {
        const currentTime = new Date();
        const checkInTime = attendanceRecord.checkInTime;
        const timeDifference = (currentTime - checkInTime) / 1000 / 60; // Difference in minutes

        let totalTime = null; // Ensure totalTime is defined
        // Check if the student has been checked in for at least 10 minutes
        if (timeDifference < 1) {
          res.render('sinfo', {
            student,
            attendance: attendanceRecord,
            message: 'You must wait at least 10 minutes before checking out.',
            totalTime: null, // Send as null or default object
          });
          return; // Exit early if under 10 minutes
        }

        // Update the checkout time
        attendanceRecord.checkOutTime = currentTime;
        attendanceRecord.checkedOut = true; // Mark as checked out
        await attendanceRecord.save();

        // Calculate total time spent in the lab
        totalTime = Math.abs(attendanceRecord.checkOutTime - attendanceRecord.checkInTime); // Difference in milliseconds
        const totalMinutes = Math.floor(totalTime / 60000);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        // Render the student info page with updated attendance record and total time
        res.render('sinfo', {
          student,
          attendance: attendanceRecord,
          message: 'Checked out time saved successfully!',
          totalTime: { hours: totalHours, minutes: remainingMinutes }, // Pass totalTime as an object
        });
      } else {
        res.render('sinfo', {
          student,
          attendance: null,
          message: 'No active check-in record found for this student.',
          totalTime: null, // Send totalTime as null
        });
      }
    } else {
      res.status(404).send('Student not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});


router.get('/excel', (req, res) => {
  res.render('excel');
});
router.post('/upload', upload.single('excel'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const students = xlsx.utils.sheet_to_json(worksheet);

    // Prepare an array to hold the promises for saving students
    const savePromises = students.map(async (student) => {
      if (!student.sid) {
        console.error('SID is missing for student:', student);
        throw new Error('SID is missing');
      }

      const sidString = String(student.sid);

      // Generate barcode
      const barcodeBuffer = await new Promise((resolve, reject) => {
        bwipjs.toBuffer({
          bcid: 'code128',
          text: sidString,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: 'center',
        }, (err, png) => {
          if (err) {
            reject(err);
          } else {
            resolve(png);
          }
        });
      });

      const barcodeDataUrl = `data:image/png;base64,${barcodeBuffer.toString('base64')}`;

      // Create student data
      const studentData = new studentModel({
        fullname: student.fullname,
        email: student.email,
        roll: student.roll,
        classs: student.classs,
        sid: sidString,
        barcode: barcodeDataUrl,
      });

      return studentData.save();
    });

    // Wait for all students to be saved
    await Promise.all(savePromises);

    // Fetch all students from the database to display
    const allStudents = await studentModel.find({});

    // Render the EJS template with the student data
    res.render('std', { students: allStudents });

  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send('Error saving data');
  }
});

// router.post('/upload', upload.single('excel'), (req, res) => {
//   const file = req.file;
//   const workbook = xlsx.readFile(file.path);
//   const sheetName = workbook.SheetNames[0];
//   const worksheet = workbook.Sheets[sheetName];
//   const students = xlsx.utils.sheet_to_json(worksheet);

//   // Insert data into the database
//   studentModel.insertMany(students)
//       .then(() => res.send('Student data saved successfully!'))
//       .catch((error) => res.status(500).send('Error saving data'));
// });
router.get('/allStudInfo',async (req,res)=>{
  const stud = await studentModel.find();
  res.render('allInfo', {stud});
});

router.get('/Attman', (req, res) => {
  res.render('manual', { stm: null, notFound: null });
});


router.post('/searchStudent', async (req, res) => {
  const { rolll } = req.body;
  try {
      const stm = await studentModel.findOne({ roll: rolll });

      if (stm) {
          res.render('manual', { stm, notFound: null }); // Passing 'stm' and 'notFound'
      } else {
          res.render('manual', { stm: null, notFound: true }); // Passing 'notFound' as true
      }
  } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
  }
});

router.post('/addBatch', async (req, res) => {
  try {
    const { batchName, teacherName, subject, classTime } = req.body;
    const batch = new batchModel({ batchName, teacherName, subject, classTime });
    await batch.save();

    res.redirect('/batches'); // Redirect to view all batches
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Display batch creation form
router.get('/createBatch', (req, res) => {
  res.render('createBatch');
});

//----------------------------------------
router.get('/present-students', async (req, res) => {
  try {
    // Find all attendance records
    const attendanceRecords = await AttModule.find({}).populate('student');

    // Create a map to store the latest attendance record for each student
    const latestAttendance = {};

    attendanceRecords.forEach((attendance) => {
      const studentId = attendance.student._id.toString();
      // Check if the student already exists in the map
      if (!latestAttendance[studentId] || 
          attendance.checkInTime > latestAttendance[studentId].checkInTime) {
        latestAttendance[studentId] = attendance; // Store the latest record
      }
    });

    // Convert the map to an array
    const presentStudents = Object.values(latestAttendance).map(attendance => ({
      student: attendance.student,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      checkedOut: attendance.checkedOut,
    }));

    // Render the page with present students data
    res.render('presentStudents', { presentStudents });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


//------------------------------------------------------------------------//
router.get('/create-batch', (req, res) => {
  res.render('create-batch'); // Render the form for creating a batch
});

// Handle batch creation and student upload
router.post('/create-batch', upload.single('studentFile'), async (req, res) => {
  try {
      const { name, timing, teacher } = req.body;

      // Read the uploaded Excel file
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const students = xlsx.utils.sheet_to_json(sheet);

      // Calculate the number of students per batch
      const numberOfBatches = 3;
      const batchSize = Math.ceil(students.length / numberOfBatches);
      
      // Create batches and assign students
      const batchDetails = [];
      for (let i = 0; i < numberOfBatches; i++) {
          const batchStudents = students.slice(i * batchSize, (i + 1) * batchSize);

          // Create the batch
          const batch = await BatchModule.create({
              name: `${name} - Batch ${i + 1}`, // Unique name for each batch
              timing,
              teacher,
              students: [] // Initialize an empty array for student IDs
          });

          // Insert students into the database and associate with the batch
          const studentPromises = batchStudents.map(async (studentData) => {
              const student = await studentModel.create(studentData);
              batch.students.push(student._id);
              return student; // Return the created student for later use
          });

          const createdStudents = await Promise.all(studentPromises);
          await batch.save();

          // Store batch details including student info
          batchDetails.push({
              batchId: batch._id,
              batchName: batch.name,
              totalStudents: createdStudents.length,
              students: createdStudents
          });
      }

      // Render the success view with batch details
      res.render('success', {
          message: 'Batches created successfully',
          batchDetails,
      });
  } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Error creating batches', error: error.message });
  }
});

router.get('/success', function (req, res, next) {
  res.render('success');
});
//------------------------------------------------------------------//
// Assuming you have BatchModule imported
router.get('/batches', async (req, res) => {
  try {
      // Fetch all batches from the database
      const batches = await BatchModule.find().populate('students'); // Populate with student details if needed

      // Render the batches view with the fetched batches
      res.render('batches', { batches });
  } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Error fetching batches', error: error.message });
  }
});

router.get('/batches/:id/students', async (req, res) => {
  try {
      const batch = await BatchModule.findById(req.params.id).populate('students'); // Populate student details
      if (!batch) {
          return res.status(404).send('Batch not found');
      }
      res.render('batchStudents', { batch }); // Render a new EJS file for student details
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving batch students');
  }
});

module.exports = router;
