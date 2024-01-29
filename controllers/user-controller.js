// require User Schema
const User = require('../models/users');
const Habit = require('../models/habits');
const bcrypt = require('bcryptjs')
const passport = require('../config/passport_local');


// render homepage / login page
module.exports.home = (req,res) => {
    // if user logged in, redirect user to their respective home page
    if(req.isAuthenticated()){
        const user = req.user;
        return res.redirect('/dashboard');
    }

    // if user is not logged in 
    // render the sign in page
    return res.render('signin',{
        title: "Login"
    });
}

// render the signup page
module.exports.signup = (req,res) => {

    // if user is already logged in 
    // redirect to their respective dashboard
    if(req.isAuthenticated()){
        const user = req.user;
            return res.redirect('/dashboard');
        } 
    // else render the sign up page
    return res.render('signup',{
        title: "Sign Up"
    })
}



module.exports.createAccount = async (req, res) => {
    try {
        // getting all user's data from req.body
        let { username, email, password, cnf_password } = req.body;
        // convert email to lowercase
        email = email.toLowerCase();

        // find whether user already exists in the database with the same email
        const userExist = await User.findOne({ email });

        // if user found
        if (userExist) {
            // redirect to login page
            req.flash('error', 'User already exists');
            console.log('User already exist');
            return res.redirect('/');
        }

        // if the user is not found

        // compare the password and confirm password
        // if both don't match
        if (password !== cnf_password) {
            // redirect back
            req.flash('error', 'Password does not match !!');
            return res.redirect('/');
        }

        // if the password matches
        // encrypt password before saving it in the database
        const cryptPassword = await bcrypt.hash(password, 10);

        // create a new user
        const newUser = await User.create({
            username,
            email,
            password: password,
        });
        console.log(User);

        req.flash('success', 'New User created, Please login !!');
        // redirect the user to the login page
        return res.status(201).redirect('/');

    } catch (error) {
        // if an error occurs
        console.error('Error creating user:', error);
        req.flash('error', 'Error creating user.');
        return res.redirect('/');
    }
};

// create session
module.exports.createSession = (req, res) => {
    // directly redirect without creating a new constant 'user'
    return res.redirect('/dashboard');
};

// logout controller
module.exports.logout = (req, res) => {
    // clear cookie and redirect to signin
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        req.flash('success', 'You have logged out!');
        return res.redirect('/');
    });
};
