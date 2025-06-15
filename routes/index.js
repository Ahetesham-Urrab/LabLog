var express = require('express');
var router = express.Router();
const studentModel = require('../model/student'); 
const AttModule = require('../model/attandance');
const BatchModule = require('../model/batch');
const QR = require('qrcode');
const multer = require('multer');
const xlsx = require('xlsx');
const bwipjs = require('bwip-js');
const moment = require("moment");
// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('studAttandance');
});
router.get('/students',async function (req, res, next) {
  try {
    let students = await studentModel.find(); 

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

router.get('/check-in', async (req, res, next) => {
  try {
    
    const students = await studentModel.find();
    res.render('studAttandance', {students});

  } catch (error) {
    res.send(500).send(error.message);
  }
});
router.get('/check-out', async (req, res, next) => {
  try {
    
    const students = await studentModel.find();
    res.render('ckout', {students});

  } catch (error) {
    res.send(500).send(error.message);
  }
});

// router.get('/student/:sid', async (req, res, next) => {
//   try {
//     const sid = req.params.sid;

//     // Find student by SID
//     const student = await studentModel.findOne({ sid });

//     if (student) {
//       // Check for active attendance record
//       const attendanceRecord = await AttModule.findOne({ student: student._id, checkedOut: false });

//       if (attendanceRecord) {
//         // If already checked in, show a message
//         res.render('sinfo', { student, attendance: attendanceRecord, message: 'Already checked in.' });
//       } else {
//         // If not checked in, create a new attendance record
//         const today = moment().format('YYYY-MM-DD');
//         const newAttendance = new AttModule({
//           student: student._id,
//           date: today, 
//           checkInTime: new Date(),
//           status: 'Present',
//         });
//         await newAttendance.save();
//         res.render('sinfo', { student, attendance: newAttendance, message: 'Check-in successful!' });
//       }
//     } else {
//       res.status(404).send('Student not found');
//     }

//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });



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

//         let totalTime = null; // Ensure totalTime is defined
//         // Check if the student has been checked in for at least 10 minutes
//         if (timeDifference < 1) {
//           res.render('sinfo', {
//             student,
//             attendance: attendanceRecord,
//             message: 'You must wait at least 10 minutes before checking out.',
//             totalTime: null, // Send as null or default object
//           });
//           return; // Exit early if under 10 minutes
//         }

//         // Update the checkout time
//         attendanceRecord.checkOutTime = currentTime;
//         attendanceRecord.checkedOut = true; // Mark as checked out
//         await attendanceRecord.save();

//         // Calculate total time spent in the lab
//         totalTime = Math.abs(attendanceRecord.checkOutTime - attendanceRecord.checkInTime); // Difference in milliseconds
//         const totalMinutes = Math.floor(totalTime / 60000);
//         const totalHours = Math.floor(totalMinutes / 60);
//         const remainingMinutes = totalMinutes % 60;

//         // Render the student info page with updated attendance record and total time
//         res.render('sinfo', {
//           student,
//           attendance: attendanceRecord,
//           message: 'Checked out time saved successfully!',
//           totalTime: { hours: totalHours, minutes: remainingMinutes }, // Pass totalTime as an object
//         });
//       } else {
//         res.render('sinfo', {
//           student,
//           attendance: attendanceRecord,
//           message: 'Checked out time saved successfully!',
//           totalTime: { hours: totalHours, minutes: remainingMinutes }, // Send totalTime as null
//         });
//       }
//     } else {
//       res.status(404).send('Student not found');
//     }
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });



//kam
// router.get('/student/:sid', async (req, res, next) => {
//   try {
//     const sid = req.params.sid;

//     // Find student by SID
//     const student = await studentModel.findOne({ sid });

//     if (student) {
//       // Check for active attendance record
//       const attendanceRecord = await AttModule.findOne({ student: student._id, checkedOut: false });

//       if (attendanceRecord) {
//         // If already checked in, show a message
//         res.render('sinfo', { student, attendance: attendanceRecord, message: 'Already checked in.', sound: 'fail.wav'  });
//       } else {
//         // If not checked in, create a new attendance record
//         const today = moment().format('YYYY-MM-DD');
//         const newAttendance = new AttModule({
//           student: student._id,
//           date: today, 
//           checkInTime: new Date(),
//           status: 'Present',
//         });
//         await newAttendance.save();
//         res.render('sinfo', { student, attendance: newAttendance, message: 'Check-in successful!',sound: 'success.wav' });
//       }
//     } else {
//       res.status(404).send('Student not found');
//     }

//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// router.get('/studentout/:sid', async (req, res) => {
//   try {
//     const sid = req.params.sid;

//     // Find student by SID
//     const student = await studentModel.findOne({ sid });

//     if (!student) {
//       return res.status(404).send('Student not found');
//     }

//     // Find the active attendance record
//     const attendanceRecord = await AttModule.findOne({ student: student._id, checkedOut: false });

//     if (!attendanceRecord) {
//       return res.render('sinfo', {
//         student,
//         attendance: null,
//         message: 'No active check-in found.',
//         sound: 'fail.wav',
//         totalTime: null,
//       });
//     }

//     const currentTime = new Date();
//     const checkInTime = attendanceRecord.checkInTime;
//     const timeDifference = (currentTime - checkInTime) / 1000 / 60; // Convert to minutes

//     if (timeDifference < 1) {
//       return res.render('sinfo', {
//         student,
//         attendance: attendanceRecord,
//         message: 'You must wait at least 10 minutes before checking out.',
//         sound: 'fail.wav',
//         totalTime: null,
//       });
//     }

//     // ✅ Ensure the `date` field is set
//     if (!attendanceRecord.date) {
//       attendanceRecord.date = new Date().toISOString().split("T")[0]; // Set today's date
//     }

//     // Update the checkout time and total time spent
//     attendanceRecord.checkOutTime = currentTime;
//     attendanceRecord.checkedOut = true;
//     attendanceRecord.totalTime = Math.floor(timeDifference); // Store total time in minutes
//     await attendanceRecord.save();

//     res.render('sinfo', {
//       student,
//       attendance: attendanceRecord,
//       message: 'Checked out successfully!',
//       sound: 'success.wav',
//       totalTime: { hours: Math.floor(timeDifference / 60), minutes: Math.floor(timeDifference % 60) },
//     });
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// router.get('/student/:sid', async (req, res, next) => {
//   try {
//     const sid = req.params.sid;
//     const student = await studentModel.findOne({ sid });

//     if (!student) {
//       return res.status(404).send('Student not found');
//     }

//     // Get today's date in "YYYY-MM-DD" format
//     const today = moment().format('YYYY-MM-DD');

//     // Check for an existing attendance record for today
//     const attendanceRecord = await AttModule.findOne({
//       student: student._id,
//       date: today,  // ✅ Ensuring date matches today's date
//       checkedOut: false
//     });

//     if (attendanceRecord) {
//       // Already checked in
//       return res.render('sinfo', {
//         student,
//         attendance: attendanceRecord,
//         message: 'Already checked.',
//         sound: 'fail.wav'
//       });
//     } 

//     // If not checked in, create a new attendance record
//     const newAttendance = new AttModule({
//       student: student._id,
//       date: today,
//       checkInTime: new Date(),
//       status: 'Present'
//     });

//     await newAttendance.save();

//     return res.render('sinfo', {
//       student,
//       attendance: newAttendance,
//       message: 'Check-in successful!',
//       sound: 'success.wav'
//     });

//   } catch (error) {
//     return res.status(500).send(error.message);
//   }
// });

router.get('/studentout/:sid', async (req, res) => {
  try {
    const sid = req.params.sid;
    const student = await studentModel.findOne({ sid });

    if (!student) {
      return res.status(404).send('Student not found');
    }

    console.log("Checking for active attendance record...");
    const attendanceRecord = await AttModule.findOne({ student: student._id, checkedOut: false });

    console.log("Found record:", attendanceRecord);
    if (!attendanceRecord) {
      return res.render('sinfo', { student, attendance: null, message: 'No active check-in found.', sound: 'fail.wav', totalTime: null });
    }

    const currentTime = new Date();
    const checkInTime = attendanceRecord.checkInTime;
    const timeDifference = (currentTime - checkInTime) / 1000 / 60; // Convert to minutes

    if (timeDifference < 1) {
      return res.render('sinfo', { student, attendance: attendanceRecord, message: 'You must wait at least 10 minutes before checking out.', sound: 'fail.wav', totalTime: null });
    }

    attendanceRecord.checkOutTime = currentTime;
    attendanceRecord.checkedOut = true;
    attendanceRecord.totalTime = Math.floor(timeDifference);
    await attendanceRecord.save();

    res.render('sinfo', { student, attendance: attendanceRecord, message: 'Checked out successfully!', sound: 'success.wav', totalTime: { hours: Math.floor(timeDifference / 60), minutes: Math.floor(timeDifference % 60) } });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


router.get('/student/:sid', async (req, res, next) => {
  try {
    const sid = req.params.sid;
    const student = await studentModel.findOne({ sid });

    if (!student) {
      return res.status(404).send('Student not found');
    }

    const today = new Date().toISOString().split("T")[0]; 
    console.log("Today's Date:", today);

    // Check for today's check-in
    const attendanceRecord = await AttModule.findOne({
      student: student._id,
      date: today, 
      checkedOut: false
    });

    console.log("Attendance found:", attendanceRecord);

    if (attendanceRecord) {
      return res.render('sinfo', {
        student,
        attendance: attendanceRecord,
        message: 'Already checked.',
        sound: 'fail.wav'
      });
    } 

    // New check-in
    const newAttendance = new AttModule({
      student: student._id,
      date: today,
      checkInTime: new Date(),
      status: 'Present',
      checkedOut: false
    });

    await newAttendance.save();

    return res.render('sinfo', {
      student,
      attendance: newAttendance,
      message: 'Check-in successful!',
      sound: 'success.wav'
    });

  } catch (error) {
    return res.status(500).send(error.message);
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
          res.render('manual', { stm, notFound: null }); 
      } else {
          res.render('manual', { stm: null, notFound: true });
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
    // Find all attendance records and populate student details
    const attendanceRecords = await AttModule.find({}).populate('student');

    // Create a map to store the latest attendance record for each student
    const latestAttendance = {};

    attendanceRecords.forEach((attendance) => {
      // Check if attendance.student exists
      if (!attendance.student) return; // Skip this entry if student is missing

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
router.get('/export-data', (req, res) => {
  res.render('export'); // Render the form for creating a batch
});

// Handle batch creation and student upload
// router.post('/create-batch', upload.single('studentFile'), async (req, res) => {
//   try {
//       const { name, timing, teacher } = req.body;

//       // Read the uploaded Excel file
//       const workbook = xlsx.readFile(req.file.path);
//       const sheetName = workbook.SheetNames[0];
//       const sheet = workbook.Sheets[sheetName];

//       // Convert sheet to JSON
//       const students = xlsx.utils.sheet_to_json(sheet);

//       // Calculate the number of students per batch
//       const numberOfBatches = 3;
//       const batchSize = Math.ceil(students.length / numberOfBatches);
      
//       // Create batches and assign students
//       const batchDetails = [];
//       for (let i = 0; i < numberOfBatches; i++) {
//           const batchStudents = students.slice(i * batchSize, (i + 1) * batchSize);

//           // Create the batch
//           const batch = await BatchModule.create({
//               name: `${name} - Batch ${i + 1}`, // Unique name for each batch
//               timing,
//               teacher,
//               students: [] // Initialize an empty array for student IDs
//           });

//           // Insert students into the database and associate with the batch
//           const studentPromises = batchStudents.map(async (studentData) => {
//               const student = await studentModel.create(studentData);
//               batch.students.push(student._id);
//               return student; // Return the created student for later use
//           });

//           const createdStudents = await Promise.all(studentPromises);
//           await batch.save();

//           // Store batch details including student info
//           batchDetails.push({
//               batchId: batch._id,
//               batchName: batch.name,
//               totalStudents: createdStudents.length,
//               students: createdStudents
//           });
//       }

//       // Render the success view with batch details
//       res.render('success', {
//           message: 'Batches created successfully',
//           batchDetails,
//       });
//   } catch (error) {
//       console.error(error);
//       res.status(500).render('error', { message: 'Error creating batches', error: error.message });
//   }
// });

router.post('/create-batch', upload.single('studentFile'), async (req, res) => {
  const { name, timing, days } = req.body;
  const studentFile = req.file;

  try {
    // Parse Excel file
    const workbook = xlsx.readFile(studentFile.path);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Create an array of student objects based on the Excel data
    const students = sheetData.map(row => ({
      sid: row.SID, // Assuming 'SID' column in the Excel sheet
      name: row.Name, // Assuming 'Name' column in the Excel sheet
      batch: name, // Assign the current batch name to the student
    }));

    // Save the student data to the database
    const savedStudents = await studentM.insertMany(students);

    // Create a new batch and associate the saved students
    const newBatch = new BatchModule({
      name,
      timing,
      days, // Save the selected days
      students: savedStudents.map(student => student._id) // Save references to the student IDs
    });

    await newBatch.save();
    
    // Redirect to the list of batches after creation
    res.redirect('/batches');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating batch or saving students');
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

router.get("/dashboard", async (req, res) => {
  try {
      const studentsCount = await studentModel.countDocuments();
      const batchesCount = await BatchModule.countDocuments();
      const attendanceToday = await AttModule.countDocuments({ date: new Date().toISOString().split('T')[0] });

      const attendanceRecords = await AttModule.find().sort({ date: -1 }).limit(5);

      res.render("dashboard", {
          studentsCount,
          batchesCount,
          attendanceToday,
          attendanceRecords
      });
  } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
  }
});



router.get("/attendance-rec/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const startOfDay = moment(date, "YYYY-MM-DD").startOf("day").toDate();
    const endOfDay = moment(date, "YYYY-MM-DD").endOf("day").toDate();

    // Find attendance records for the selected date
    const attendanceRecords = await AttModule.find({
      checkInTime: { $gte: startOfDay, $lte: endOfDay },
    }).populate("student");

    if (!attendanceRecords.length) {
      return res.render("attendanceRecords", { 
        records: [], 
        selectedDate: date, 
        message: "No records found for this date." 
      });
    }

    // Format the records for display in EJS
    const formattedRecords = attendanceRecords.map(record => ({
      studentName: record.student ? record.student.fullname : "Unknown",
      sid: record.student ? record.student.sid : "N/A",
      email: record.student ? record.student.email : "N/A",
      roll: record.student ? record.student.roll : "N/A",
      classs: record.student ? record.student.classs : "N/A",
      checkInTime: moment(record.checkInTime).format("HH:mm:ss"), 
      checkOutTime: record.checkOutTime ? moment(record.checkOutTime).format("HH:mm:ss") : "Not checked out",
      totalTime: record.totalTime ? `${Math.floor(record.totalTime / 60)}h ${record.totalTime % 60}m` : "N/A",
      status: record.status
    }));

    res.render("attendanceRecords", { records: formattedRecords, selectedDate: date });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/attendance-rec", async (req, res) => {
  try {
    const { date } = req.query; // Get the selected date from query parameters
    let attendanceRecords = [];

    if (date) {
      const startOfDay = moment(date, "YYYY-MM-DD").startOf("day").toDate();
      const endOfDay = moment(date, "YYYY-MM-DD").endOf("day").toDate();

      attendanceRecords = await AttModule.find({
        checkInTime: { $gte: startOfDay, $lte: endOfDay },
      }).populate("student");
    }

    res.render("attendanceRecords", { 
      records: attendanceRecords.map(record => ({
        studentName: record.student ? record.student.fullname : "Unknown",
        sid: record.student ? record.student.sid : "N/A",
        email: record.student ? record.student.email : "N/A",
        roll: record.student ? record.student.roll : "N/A",
        classs: record.student ? record.student.classs : "N/A",
        checkInTime: moment(record.checkInTime).format("HH:mm:ss"),
        checkOutTime: record.checkOutTime ? moment(record.checkOutTime).format("HH:mm:ss") : "Not checked out",
        totalTime: record.totalTime ? `${Math.floor(record.totalTime / 60)}h ${record.totalTime % 60}m` : "N/A",
        status: record.status
      })),
      selectedDate: date || "" // Ensure selectedDate is always defined
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
});

const fs = require("fs");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
// 🔹 Export CSV
router.post("/export-csv", async (req, res) => {
    try {
        const { date } = req.body;
        const formattedDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");

        // Fetch attendance records
        const records = await AttModule.find({ date: formattedDate }).populate("student");

        if (!records.length) {
            return res.status(404).send("No records found for this date.");
        }

        // Prepare data for CSV
        const csvData = records.map(record => ({
            Name: record.student.fullname,
            SID: record.student.sid,
            Email: record.student.email,
            Roll: record.student.roll,
            Class: record.student.classs,
            "Check-In Time": moment(record.checkInTime).format("HH:mm:ss"),
            "Check-Out Time": record.checkOutTime ? moment(record.checkOutTime).format("HH:mm:ss") : "Not checked out",
            "Total Time": record.totalTime ? `${Math.floor(record.totalTime / 60)}h ${record.totalTime % 60}m` : "N/A",
            Status: record.status
        }));

        // Convert JSON to CSV
        const parser = new Parser();
        const csv = parser.parse(csvData);

        // Send CSV file
        res.setHeader("Content-Disposition", `attachment; filename=attendance_${formattedDate}.csv`);
        res.setHeader("Content-Type", "text/csv");
        res.send(csv);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// router.post("/export-pdf", async (req, res) => {
//   try {
//       const { date } = req.body;
//       const formattedDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");

//       // Fetch attendance records
//       const records = await AttModule.find({ date: formattedDate }).populate("student");

//       if (!records.length) {
//           return res.status(404).send("No records found for this date.");
//       }

//       // Create PDF document
//       const doc = new PDFDocument({ margin: 20 });
//       const fileName = `attendance_${formattedDate}.pdf`;
//       res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
//       res.setHeader("Content-Type", "application/pdf");
      
//       doc.pipe(res);

//       // Add logo


//       // Title
//       doc.fontSize(18).font("Helvetica-Bold").text("ATTENDANCE REPORT", { align: "center" });
//       doc.fontSize(14).font("Helvetica").text(`Date: ${formattedDate}`, { align: "center" });
//       doc.moveDown(2);

//       // Define column widths
//       const colWidths = [100, 60, 150, 50, 50, 80, 80, 80, 80];
//       let startY = doc.y;

//       // Table Header
//       doc.fontSize(12).font("Helvetica-Bold").fillColor("black");
//       const headers = ["Name", "SID", "Email", "Roll", "Class", "Check-In", "Check-Out", "Total Time", "Status"];
//       let x = 50;
//       headers.forEach((header, i) => {
//           doc.text(header, x, startY, { width: colWidths[i], bold: true });
//           x += colWidths[i];
//       });
//       doc.moveDown();
//       doc.moveTo(50, doc.y).lineTo(750, doc.y).stroke();

//       // Table Rows
//       records.forEach(record => {
//           let x = 50;
//           let rowY = doc.y;
//           const values = [
//               record.student.fullname,
//               record.student.sid,
//               record.student.email,
//               record.student.roll,
//               record.student.classs,
//               moment(record.checkInTime).format("HH:mm:ss"),
//               record.checkOutTime ? moment(record.checkOutTime).format("HH:mm:ss") : "Not checked out",
//               record.totalTime,
//               record.status
//           ];
//           values.forEach((value, i) => {
//               doc.text(value.toString(), x, rowY, { width: colWidths[i] });
//               x += colWidths[i];
//           });
//           doc.moveDown();
//       });
      
//       doc.end();
//   } catch (error) {
//       res.status(500).send(error.message);
//   }
// });
const path = require("path");
const pdf = require("html-pdf");
router.post("/export-pdf", async (req, res) => {
  try {
      const { date } = req.body;
      const formattedDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");

      // Fetch attendance records
      const records = await AttModule.find({ date: formattedDate }).populate("student");

      if (!records.length) {
          return res.status(404).send("No records found for this date.");
      }

      // Generate HTML content for the PDF
      let html = `
      <html>
      <head>
      
          <style>
          body {
        font-family: Arial, sans-serif;
        border:1px solid #1f40c3;
        padding:15px;
    }
              table {
    width: 100%;

    border-collapse: collapse;
    background: #f9f9f9;
    overflow: hidden;
    z-index: 999;
    font-size:12.5px;
   
}
    
    h2 {
    text-align: center;
    color: #1f40c3;
    font-family: Arial, sans-serif;
}


th, td {
    
    border: 1px solid #010101;
    text-align: left;

  
}
.ig{
    height: 100%;
    width: 10%;
    background-color: #1f40c3;
}

th {
    background-color: #1f40c3;
    color: #f9f9f9;
    font-family: Arial, sans-serif;
    text-align: center;
   
}
.f2 img{

    width: 15px;

}
    .p{
    margin-top:-3%;
    }

tbody tr:nth-child(even) {
    background-color: #f9f9f9;
}

tbody tr:hover {
    background-color: #e8e8e8;
}
.nme{
    width: 30%;
}
.email{
    text-transform: lowercase;
}
    .footer{
        text-align: center;
                     font-size: 12px;
                     margin-top: 20px;
                     color: #1f40c3;
                 }
          </style>
      </head>
      <body>
          <h2>ATTENDANCE REPORT</h2>
          <p style="text-align: center;" class="p"><strong>Date:</strong> ${formattedDate}</p>
          <table>
              <thead>
                  <tr>
                      <th>Name</th>
                      <th>SID</th>
                      <th>Email</th>
                      <th>Roll</th>
                      <th>Class</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Total Time</th>
                     
                  </tr>
              </thead>
              <tbody>
      `;

      // Append rows dynamically
      records.forEach(record => {
          html += `
          <tr>
              <td>${record.student.fullname}</td>
              <td>${record.student.sid}</td>
              <td>${record.student.email}</td>
              <td>${record.student.roll}</td>
              <td>${record.student.classs}</td>
              <td>${moment(record.checkInTime).format("HH:mm:ss")}</td>
              <td>${record.checkOutTime ? moment(record.checkOutTime).format("HH:mm:ss") : "Not checked out"}</td>
              <td>${record.totalTime ? `${Math.floor(record.totalTime / 60)}h ${record.totalTime % 60}m` : "N/A"}
             
          </tr>
          `;
      });

      html += `
              </tbody>
          </table>
           <div class="footer">
              <p>Generated by LabLog | ${moment().format("YYYY-MM-DD HH:mm:ss")}</p>
            </div>
      </body>
      </html>
      `;

      // Define PDF file path
      const filePath = path.join(__dirname, `attendance_${formattedDate}.pdf`);

      // Convert HTML to PDF
      pdf.create(html, { format: "A4", border:"5mm" }).toFile(filePath, (err, result) => {
          if (err) {
              return res.status(500).send("Error generating PDF");
          }
          // Send the file to the client
          res.download(result.filename, `attendance_${formattedDate}.pdf`, (err) => {
              if (err) console.error(err);
              fs.unlinkSync(result.filename); // Delete file after download
          });
      });

  } catch (error) {
      res.status(500).send(error.message);
  }
});

// router.post("/export-pdf", async (req, res) => {
//     try {
//         const { date } = req.body;
//         const formattedDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");

//         // Fetch attendance records
//         const records = await AttModule.find({ date: formattedDate }).populate("student");

//         if (!records.length) {
//             return res.status(404).send("No records found for this date.");
//         }

//         // Generate HTML content for the PDF
//         let html = `
//         <html>
//         <head>
//             <style>
//                 * {
//                     margin: 0;
//                     padding: 0;
//                     box-sizing: border-box;
//                     font-family: Arial, sans-serif;
//                 }
//                 body {
//                     background-color: #f7f7f7;
//                     padding: 20px;
//                 }
//                 .header {
//                     text-align: center;
//                     margin-bottom: 20px;
//                 }
//                 h2 {
//                     color: #010101;
//                     font-size: 22px;
//                     font-weight: bold;
//                     text-transform: uppercase;
//                 }
//                 p {
//                     text-align: center;
//                     font-size: 14px;
//                     margin-bottom: 10px;
//                 }
//                 table {
//                     width: 100%;
//                     border-collapse: collapse;
//                     background: #ffffff;
//                     border-radius: 5px;
//                     overflow: hidden;
//                     box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
//                 }
//                 th, td {
//                     padding: 10px;
//                     text-align: left;
//                     border: 1px solid #ddd;
//                 }
//                 th {
//                     background-color: #1f40c3;
//                     color: #EFEFD7;
//                     text-align: center;
//                     font-weight: bold;
//                 }
//                 tbody tr:nth-child(even) {
//                     background-color: #f9f9f9;
//                 }
//                 tbody tr:hover {
//                     background-color: #e8e8e8;
//                 }
//                 .footer {
//                     text-align: center;
//                     font-size: 12px;
//                     margin-top: 20px;
//                     color: #555;
//                 }
//             </style>
//         </head>
//         <body>
//             <div class="header">
//                 <h2>Attendance Report</h2>
//                 <p><strong>Date:</strong> ${formattedDate}</p>
//             </div>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Name</th>
//                         <th>SID</th>
//                         <th>Email</th>
//                         <th>Roll</th>
//                         <th>Class</th>
//                         <th>Check-In</th>
//                         <th>Check-Out</th>
//                         <th>Total Time</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//         `;

//         // Append rows dynamically
//         records.forEach(record => {
//             html += `
//                 <tr>
//                     <td>${record.student.fullname}</td>
//                     <td>${record.student.sid}</td>
//                     <td>${record.student.email}</td>
//                     <td>${record.student.roll}</td>
//                     <td>${record.student.classs}</td>
//                     <td>${moment(record.checkInTime).format("HH:mm:ss")}</td>
//                     <td>${record.checkOutTime ? moment(record.checkOutTime).format("HH:mm:ss") : "Not checked out"}</td>
//                     <td>${record.totalTime ? `${Math.floor(record.totalTime / 60)}h ${record.totalTime % 60}m` : "N/A"}</td>
//                 </tr>
//             `;
//         });

//         html += `
//                 </tbody>
//             </table>
//             <div class="footer">
//                 <p>Generated by Attendance System | ${moment().format("YYYY-MM-DD HH:mm:ss")}</p>
//             </div>
//         </body>
//         </html>
//         `;

//         // Define PDF file path
//         const filePath = path.join(__dirname, `attendance_${formattedDate}.pdf`);

//         // Convert HTML to PDF
//         pdf.create(html, { format: "A4", border: "10mm" }).toFile(filePath, (err, result) => {
//             if (err) {
//                 return res.status(500).send("Error generating PDF");
//             }
//             // Send the file to the client
//             res.download(result.filename, `attendance_${formattedDate}.pdf`, (err) => {
//                 if (err) console.error(err);
//                 fs.unlinkSync(result.filename); // Delete file after download
//             });
//         });

//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });



module.exports = router;
