// Require necessary modules
require('dotenv').config(); // Require .env
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { connectMonggose } = require('./config/mongoose');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const MongoStore = require('connect-mongo');

// Create Express app
const app = express();

// Connect to MongoDB
connectMonggose();

// flash messages package and middleware
const flash = require('connect-flash');
const myMware = require('./config/middleware');

// Set up view engine and static files
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('assets'));

// Use express-session for session management
app.use(
  require('express-session')({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
    }),
  })
);

// connect-flash middleware
app.use(flash());
app.use(myMware.setFlash);

// Initialize passport after configuring session
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use('/', require('./routes/index-routes'));

// Run server on port
const PORT = 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`Running on port :: ${PORT}`);
});
