const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    title: String,
    completed: {
        type: Boolean,
        default: false
    }
});

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    todos:{
        type: [todoSchema],
        default:[]
    }
});

const User = mongoose.model('user', userSchema);

module.exports = User