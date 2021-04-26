const express = require('express');
const app = express();
// const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const Question = require('./models/Question');
const User = require('./models/User');
var bodyParser = require('body-parser')
const { ensureAuthenticated, forwardAuthenticated } = require('./config/auth');
app.use(express.static(__dirname + '/public'));
// DB Config
const db = require('./config/keys').mongoURI;

// Passport Config
require('./config/passport')(passport);

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
  
// EJS
app.set('view engine', 'ejs');

// Express body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

//express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

  
// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.err = req.flash('err');
    next();
  });

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.get('/dashboard',function(req,res) {
  res.render('dashboard',{name: req.user.name})
});
app.get('/StudentExam',ensureAuthenticated,function(req,res) {
  res.render('StudentExam',{name: req.user.name})
});
app.get('/Quiz/',ensureAuthenticated,function(req,res) {
  var perPage = 1;
      var page = req.params.page || 1;
  
    Question.find({})
             .skip((perPage * page) - perPage)
             .limit(perPage).exec(function(err,data){
                  if(err) throw err;
            Question.countDocuments({}).exec((err,count)=>{          
    res.render('Quiz', {  
    records: data,
    current: page,
    count:count,
    pages: Math.ceil(count / perPage) });
    
  });
  
    });

  });


app.get('/Quiz/:page',ensureAuthenticated,function(req,res) {
  var perPage = 1;
      var page = req.params.page || 1;
  
    Question.find({})
             .skip((perPage * page) - perPage)
             .limit(perPage).exec(function(err,data){
                  if(err) throw err;
            Question.countDocuments({}).exec((err,count)=>{          
    res.render('Quiz', {  
    records: data,
    current: page,
    pages: Math.ceil(count / perPage) });
    
  });
    });
});
app.get("/result",ensureAuthenticated,function(req,res){
  User.findById(req.user.id,function(err,foundUser){
  if(err){
    console.log(err)
  }
  else{
       if(foundUser){
        res.render("result",{totalScore:foundUser.totalNumbers
          ,rightscore:foundUser.QuestionsCorrectid,
          wrongscore:foundUser.QuestionsInCorrectid,
          name: req.user.name
          });
       }
     }

});
});
app.post("/Quiz/:id/:correctanswer/:qid",async(req,res)=>{
 try{
 const quesid = req.params.id;
 let qid=req.params.qid;

  const corrans=req.params.correctanswer;
 
  const choice=req.body.choice;

   

User.findById(req.user.id,function(err,foundUser){
  if(err){
    console.log(err)
  }
  else{
    if(foundUser){
      if(corrans===choice){
       
        if(foundUser.Questionsid.includes(quesid)){
          req.flash('err','The answer to this question already exists !');
          qid=Number(qid)+1;
           res.redirect(`/Quiz/${qid}`);
        }
        else{
           foundUser.correctAnswers.push(choice);
           foundUser.Questionsid.push(quesid);
           foundUser.totalNumbers+=1;
           foundUser.QuestionsCorrectid.push(qid);
           foundUser.save(function(){
            if(Number(qid)==10){
              res.redirect('/result');
            }
            else{
            qid=Number(qid)+1;
            res.redirect(`/Quiz/${qid}`);
          }
           });
        }
      }
       else if(corrans!=choice){
          if(foundUser.Questionsid.includes(quesid)){
          req.flash('err','The answer to this question already exists !');
          qid=Number(qid)+1;
            res.redirect(`/Quiz/${qid}`);
        }
        else{
            foundUser.wrongAnswer.push(choice);
           foundUser.Questionsid.push(quesid);
           foundUser.QuestionsInCorrectid.push(qid);
           foundUser.save(function(){

           if(Number(qid)==10){
              res.redirect('/result');
            }
            else{
            qid=Number(qid)+1;
            res.redirect(`/Quiz/${qid}`);
          }
           });
        }

         
      }
    
     
     
    }
  }
});
}
 catch (error) {
        res.status(404).send(error);
     }
});


app.post("/Quiz/:page/:id/:correctanswer/:qid",function(req,res){
  try{
 const quesid = req.params.id;
 let qid=req.params.qid;
   
 const corrans=req.params.correctanswer;

  const choice=req.body.choice;

   

User.findById(req.user.id,function(err,foundUser){
  if(err){
    console.log(err)
  }
  else{
     if(foundUser){
      if(corrans===choice){
        
        if(foundUser.Questionsid.includes(quesid)){
          req.flash('err','The answer to this question already exists !');
           if(Number(qid)==10){
              res.redirect('/result');
            }
            else{
            qid=Number(qid)+1;
            res.redirect(`/Quiz/${qid}`);
          }
        }
        else{
           foundUser.correctAnswers.push(choice);
           foundUser.Questionsid.push(quesid);
           foundUser.QuestionsCorrectid.push(qid);
           foundUser.totalNumbers+=1;
           foundUser.save(function(){
           if(Number(qid)==10){
              res.redirect('/result');
            }
            else{
            qid=Number(qid)+1;
            res.redirect(`/Quiz/${qid}`);
          }
           });
        }
      }
       else if(corrans!=choice){
        if(foundUser.Questionsid.includes(quesid)){
          req.flash('err','The answer to this question already exists !');
          qid=Number(qid)+1;
           res.redirect(`/Quiz/${qid}`)
        }
        else{
            foundUser.wrongAnswer.push(choice);
           foundUser.Questionsid.push(quesid);
           foundUser.QuestionsInCorrectid.push(qid);
          foundUser.save(function(){
           if(Number(qid)==10){
              res.redirect('/result');
            }
            else{
            qid=Number(qid)+1;
            res.redirect(`/Quiz/${qid}`);
          }
           });
        }
      }
    
     
     
    }
  }
});

 
 }
 catch (error) {
        res.status(404).send(error);
     }
  });


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on  ${PORT}`));
