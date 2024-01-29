// index-routes.js

// require express
const express = require('express');
const routes = express.Router();
const passport = require('../config/passport_local'); // Adjust the path based on your project structure

// require controllers path
const homeController = require('../controllers/home-controller');
const userController = require('../controllers/user-controller');

// user controller
routes.get('/', userController.home); // signin page route
routes.get('/signup', userController.signup); // signup page route
routes.get('/logout', userController.logout); // logout route

// creating a new user
routes.post('/create-account',userController.createAccount);

// use passport as middleware to authenticate
routes.post('/create-session', passport.authenticate(
    'local',
    { failureRedirect: '/' }, // Corrected the failureRedirect path
), userController.createSession);

// home route
routes.get('/dashboard', passport.checkAuthentication, homeController.dashboard);
routes.post('/create-habit', homeController.createHabit); // create habit route
routes.get('/delete-habit/:id', homeController.deleteActivity); // delete habit route
routes.get('/done-notdone', homeController.markDoneNotDone); // status route

// weekly report route
routes.get('/weekly-view', homeController.weeklyreport);

// export routes
module.exports = routes;
