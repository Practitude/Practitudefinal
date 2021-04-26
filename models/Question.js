const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  qid:{
    type:Number,
    required:true
  },
    question: {
        type: String,
        required: true
    },
    option1:{
      type: String,
        required: true
    },
     option2:{
      type: String,
        required: true
    },
     option3:{
      type: String,
        required: true
    },
     option4:{
      type: String,
        required: true
    },
    correctanswer:{
      type: String,
        required: true
    },
});

var Question=mongoose.model('Question',QuestionSchema);
module.exports = Question;