const Habit = require('../models/habits');  // require habit db
const User = require('../models/users');     // require user db


// date to string function => eg: Jan 01, 2022 -> "01012022"
function getTodayDate() {
    const d = new Date();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear().toString();
    return `${year}-${month}-${day}`;
}

// date formatter function
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

module.exports.dashboard = async (req, res) => {
    try {
        // if (req.cookies.user_id) {
            let user = await User.findById(req.user);
            let habits = await Habit.find({ user});
            let currentDateStr = getTodayDate(); // Change this line
            console.log(user,habits,currentDateStr);
            return res.render("home", {
                title: "Habit Tracker",
                habits: habits,
                user: user.email,
                date: currentDateStr,
                formatDate: formatDate,
            });
        // } else {
        //     // Redirect to login if not authenticated
        //     console.log('else page')
        //     return res.redirect('/');
        
    } catch (err) {
        console.log(err);
    }
}

// Update the createHabit controller
module.exports.createHabit = async (req, res) => {
    try {
        let habit;
        let user;

        try {
            // Find the logged-in user
            user = await User.findById(req.user);

            // If the user doesn't exist, handle accordingly (redirect, throw an error, etc.)
            if (!user) {
                return res.redirect('/');
            }

            // If the user exists, find or create the habit
            habit = await Habit.findOne({ Habit: req.body.habit, user: user.id });

            // If the habit doesn't exist, create it
            if (!habit) {
                const validStatus = ['Done', 'Not done', 'None'];
                const currentDateStr = await getTodayDate();
                console.log('Current Date:', currentDateStr);

                // Check if the provided status is valid, default to 'None' if not provided or invalid
                const statusToday = validStatus.find(s => s.toLowerCase() === (req.body.statusToday || '').toLowerCase()) || 'None';

                habit = await Habit.create({
                    Habit: req.body.habit,
                    user: user._id,
                    dates: [{
                        date: currentDateStr,
                        status: statusToday
                    }],
                    statusToday: statusToday
                    // Add any other fields you need for your habits
                });

                // Ensure that the status for the dates array is valid
                if (!validStatus.includes(statusToday)) {
                    // If not valid, throw an error or handle it accordingly
                    throw new Error('Invalid status for the dates array');
                }

                // Check if the user has the 'habits' property initialized, if not, initialize it
                if (!user.habits) {
                    user.habits = [];
                }

                // Add the new habit to the user's habits array
                user.habits.push(habit.id);
                await user.save();
            }
        } catch (err) {
            console.log(err);
        }

        // Redirect to the home page
        return res.redirect('/');

    } catch (err) {
        console.log(err);
    }
};


// delete habit controller
module.exports.deleteActivity = async (req, res) => {
    try {
        // find logged in user
        let user = await User.findById(req.user).populate('habits');

        if (user) {
            // delete the activity
            await Habit.findByIdAndDelete(req.params.id);

            // pull it from user-> habits array
            if (user.habits && user.habits.length > 0) {
                user.habits.pull(req.params.id);
                await user.save();
            } else {
                console.log('User does not have any habits to pull.');
            }
        } else {
            console.log('User not found.');
        }

        // redirect back
        return res.redirect('/');
    } catch (err) {
        console.log(err);

        // Handle errors appropriately, e.g., log the error and redirect
        return res.status(500).send('Internal Server Error');
    }
};

// mark as done, not done, or None
module.exports.markDoneNotDone = async (req, res) => {
    try {
        // get id, date, status from request.query
        let id = req.query.id;
        let date = req.query.date;
        let status = req.query.status;

        // find habit
        let habit = await Habit.findById(id).populate();

        // if status == new-status
        if (status == "new-status") {
            // check if habit has 'dates' property, if not, initialize it
            if (!habit.dates) {
                habit.dates = [];
            }

            // add new date and status as done
            habit.dates.push({
                date: date,
                status: "Done"  // Update to match the enum values in your schema
            });

            await habit.save();
        } else {
            // check if habit has 'dates' property
            if (habit.dates) {
                // iterate over dates in habit 
                for (let i = 0; i < habit.dates.length; ++i) {
                    // find the current date
                    if (habit.dates[i].date == date) {
                        // update the status based on your logic
                        if (habit.dates[i].status == "Done") {
                            habit.dates[i].status = "done";
                        } else if (habit.dates[i].status == "Not done") {
                            habit.dates[i].status = "Not done";
                        } else {
                            habit.dates[i].status = "None";
                        }
                        break;
                    }
                }

                await habit.save();
            }
        }

        // redirect back
        return res.redirect('/');
    } catch (err) {
        console.log(err);
    }
};


// weekly-view Controller
module.exports.weeklyreport = async (req, res) => {
    try {
        // if user logged in
        // find habits associated with the user
        let user = await User.findById(req.user);
        let habits = await Habit.find({ user });

        // Move currentDateStr declaration outside the loop
        let currentDateStr;

        // render weekly-report and pass the habits, user, and formatDate function
        return res.render('weekly-view', {
            title: "Habit Tracker | Weekly Report",
            habits: habits,
            user: user.email,
            date: currentDateStr,
            formatDate: formatDate,
        });
    } catch (err) {
        console.log(err);
    }
};
