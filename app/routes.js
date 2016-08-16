//app/routes.js
var logout = require('express-passport-logout');
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
//load up the user model
var User = require('./models/user');
var Book = require('./models/book');
var bcrypt = require('bcrypt-nodejs');

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "abdulazizpriatna@gmail.com",
        pass: "ykkigpaqhztvajch"
    }
});

var generate = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8),null);
}

module.exports = function(app,passport){

    //homepage
    app.get('/',function(req,res){
        res.render('index.ejs');
    });

    //if forgot passowrd
    app.get('/forgot-password',function(req,res){
        res.render('forgot.ejs',{message:req.flash('AlreadyEmailMessage')});
    });

    app.post('/forgot-password',function(req,res){

        User.findOne({'email':req.body.email},function(err,user){
            if(err)
                return done(err);
            
            if(!user){
                req.flash('AlreadyEmailMessage','That email is not available.');
                res.redirect('/forgot-password');
            }else{

                var mailOptions={
                    to : user.email,
                    subject : 'Konfirmasi Password',
                    html : '<p>Silahkan rubah password anda ke halaman ini <a href=http://'+req.headers.host+'/confirm-password/'+user.id+'>Klik disini<a></p>'
                }

                console.log(mailOptions);
                smtpTransport.sendMail(mailOptions, function(error, response){
                    if(error){
                        console.log(error);
                        res.end("error");
                    }else{
                        console.log("Message sent: " + response.message);
                        res.render("success.ejs",{url:"http://"+req.headers.host+"/"});
                    }
                });
            }

        });
        
    });

    app.get('/confirm-password/:id',function(req,res){
        User.findOne({'_id':req.params.id},function(err,user){
            res.render('confirm-password.ejs',{message:req.flash('ConfirmPasswordMessage'),user:user});
        });
    });

    app.post('/confirm-password',function(req,res){
        if(req.body.password != req.body.confirm_password){
            req.flash('ConfirmPasswordMessage','That password does not match.');
            res.redirect('/confirm-password/'+req.body.code);
            console.log(req.body.password);
            console.log(req.body.confirm_password);
        }else{
            User.findOneAndUpdate(
                {_id:req.body.code},
                {$set:{password:generate(req.body.password)}},
                {upsert: true},
                function(err, newUser){
                    if(err){
                        console.log(err);
                    }else{
                        req.flash('loginMessage','The password has been change.');
                        res.redirect('/login');
                    }
                }
            );
        }
    });

    //login
    //show the login form
    app.get('/login',isLoggedIn,function(req,res){
        //render the page and pass in any flash data if exits
        res.render('login.ejs',{message:req.flash('loginMessage')});
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    //process the login form
    //app.post('/login',do all our passport here);

    //sign up
    //show the signup form
    app.get('/signup',function(req,res){
        //render the page and pass in any flash data if any
        res.render('signup.ejs',{message:req.flash('signupMessage')});    
    });

   // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    //profile section
    app.get('/profile',isLoggedIn,function(req,res){
        Book.find(function(err,user){
            if(!err){
                res.render('profile.ejs',{
                    book : book,
                    user : req.user //get the user out of session and pass to template
                });
            }else{
                return console.log(err);
            }
        });
    });

    //logout
    app.get('/logout',function(res,req){
        res.logout();
        req.redirect('/');
    });

};

// route middlewher to make sure a user is logged in
function isLoggedIn(req, res, next){
    //if user is authenticated in the session, carry on
    if(req.isAuthenticated())
        return next();

    res.redirect('/');
}