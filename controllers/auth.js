const User = require('../models/user');
const bcrypt=require('bcryptjs');
const nodemailer=require('nodemailer')
const sendGridTransport=require('nodemailer-sendgrid-transport')
const {validationResult}=require('express-validator')

const transporter=nodemailer.createTransport(sendGridTransport({
  auth:{
    api_key:'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'
  }
}));



exports.getLogin = (req, res, next) => {
  let message=req.flash('error');
  if(message.length>0)
  message=message[0];
  else
  message=null;
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage:message
  });
};

exports.getSignup = (req, res, next) => {
  let message=req.flash('error');
  if(message.length>0)
  message=message[0];
  else
  message=null;
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage:message
  });
};

exports.postLogin = (req, res, next) => {
  const email=req.body.email;
  const password=req.body.password;
  User.findOne({email:email})
  .then(user=>{
    if(!user){
      req.flash('error','Invalid email or Password');
      return res.redirect('/login');
    }
    bcrypt.compare(password,user.password)
    .then(doMatch=>{
      if(doMatch==true){
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err => {
        console.log(err);
        res.redirect('/');
      });
      }else{
        req.flash('error','Invalid  Password');
        return res.redirect('/login');
      }
    }).catch(err=> console.log(err));
  })
  .catch(err=> console.log(err));
};

exports.postSignup = (req, res, next) => {
 // console.log(req.user);
  const email=req.body.email;
  const password=req.body.password;
  const confirmPassword=req.body.password;
  const error=validationResult(req);
  if(!error.isEmpty()){
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errorMessage:error.array()[0].msg
    });
  }
  // User.findOne({email:email})
  // .then(userDoc=>{
  //   if(userDoc){
  //   req.flash('error','Email already exist');
  //   return res.redirect('/signup');
  //   }
     bcrypt.hash(password,12)
    .then(hashedPassword=>{
      console.log(hashedPassword);
      const user=new User({
        email:email,
        password:hashedPassword,
        cart:{items:[]}
      })
      return user.save()
    })
    .then(()=>{
      res.redirect('/login');
      return transporter.sendMail({
        to:email,
        from: 'anirbansaha782@gmail.com',
        subject:'SignUp Success',
        html:'<h1>Signup done successfully</h1>'
      })
    })
    .catch(err=>{
      console.log(err);
    })
 // })
  // .catch(err=>{
  //   console.log(err);
  // })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
