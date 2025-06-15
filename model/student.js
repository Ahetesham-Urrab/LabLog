const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/qrSystem");

const studentSchema = mongoose.Schema({
  fullname: String,
  email: String,
  roll: String,
  classs: String,
  barcode: String,
  sid: String,
});

module.exports = mongoose.model("student", studentSchema);
//<audio id="notificationSound" src="/sounds/<%= sound %>" preload="auto"></audio> 
   //   const soundFile = "<%= sound %>";
    //   const audio = new Audio(`/sounds/${soundFile}`);
  
    //   // Function to play audio
    //   function playAudio() {
    //       if (soundFile) {
    //           audio.play().catch(error => console.error("Sound play error:", error));
    //       }
    //   }