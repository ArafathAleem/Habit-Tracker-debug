// Update the enum values in the Mongoose schema
const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    Habit: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dates: [
        {
            date: {
                type: Date,
                required: true
            },
            status: {
                type: String,
                required: true,
                enum: ['Done', 'Not done', 'None']
            }
        }
    ],
    statusToday: {
        type: String,
        required: true,
        enum: ['Done', 'Not done', 'None']
    },
    // Add any other fields you need for your habits
}, { timestamps: true });

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;