const mongoose = require('mongoose');

module.exports = mongoose.model("Blog", new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Blog Name"],
        trim: true
    },
    nameblog: {
        type: String,
        required: [true, "Please Enter Blog Name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please Enter Description "]
    },
    content: {
        type: String,
        required: [true, "Please Enter content "]
    },
    images: Array,
    location: {
        type: String,
        trim: true
    },
},{timestamps:true}))