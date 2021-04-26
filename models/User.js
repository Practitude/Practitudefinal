const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  roll: {
    type: Number,
    required: true
  },
  batch: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  correctAnswers:[String],
  wrongAnswer:[String],
  Questionsid:[String],
  totalNumbers:{
    type:Number,
    default:'0'
  },
  QuestionsCorrectid:{
    type:[Number],
    
  },
  QuestionsInCorrectid:{
    type:[Number],
    
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
