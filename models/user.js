const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb+srv://admin:Dilip%40123@cluster0.n6ybqtu.mongodb.net/darkgram");

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    picture: {
        type: String,
        default: "def.png"
    },
    contact: String,
    bio: String,
    stories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "story"
        }
    ],
    saved: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post"
        }
    ],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    }],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    date: {
        type: Date,
        default: Date.now
    },
})

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);