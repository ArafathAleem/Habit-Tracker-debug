const mongoose = require("mongoose");

// user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true,
        unique: true,
    },
    habits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit',
    }],
    password: {
        type: String,
        required: true
    },
}, {
    timestamps: true 
});

const User = mongoose.model('User', userSchema);
module.exports = User;
