var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;

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

// router.get('/student/:sid', async (req, res, next) => {
//   try {
//     const sid = req.params.sid;
//     const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });

//     // Find student by SID
//     const student = await studentModel.findOne({ sid }).populate('batch');

//     if (student) {
//       // Check if student belongs to a batch operating today
//       const batch = student.batch;

//       if (batch && batch.days.includes(currentDay)) {
//         // Check for active attendance record (already checked in)
//         const attendanceRecord = await AttModule.findOne({ student: student._id, checkedOut: false });

//         if (attendanceRecord) {
//           // Already checked in, provide option to check out
//           res.render('sinfo', { student, attendance: attendanceRecord, message: 'Already checked in. Would you like to check out?' });
//         } else {
//           // Not checked in yet, create new attendance record
//           const newAttendance = new AttModule({
//             student: student._id,
//             checkInTime: new Date(),
//             status: 'Present',
//           });
//           await newAttendance.save();
//           res.render('sinfo', { student, attendance: newAttendance, message: 'Check-in successful!' });
//         }
//       } else {
//         // If student does not belong to today's batch, mark as "extra"
//         const newAttendance = new AttModule({
//           student: student._id,
//           checkInTime: new Date(),
//           status: 'Present (Extra)',
//           isExtra: true
//         });
//         await newAttendance.save();
//         res.render('sinfo', { student, attendance: newAttendance, message: 'Check-in successful (marked as extra).' });
//       }
//     } else {
//       res.status(404).send('Student not found');
//     }
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     res.status(500).send('Internal server error');
//   }
// });
