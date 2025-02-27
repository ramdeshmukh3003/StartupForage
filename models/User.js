const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: [3, 'Name must be at least 3 characters'], 
        maxlength: [30, 'Name cannot exceed 30 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'], 
        unique: true, 
        match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'], 
    },
    profilePic: {
        type: String,
        default: "",
    },
    role : {
        type: String,
        enum: ["founder" , "mentor" , "investor" , "user"],
        required: true,
    },
    isVerified : { type: Boolean, default: false },
    verificationToken : { type: String },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// hashes the password to make it secure before saving the database

UserSchema.pre("save" , async function(next) {
    if(!this.isModified('password')) return next();
    const saltRounds = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password , saltRounds);
    next();
});

//  this is not the async function it is normal function . 
UserSchema.methods.generateVerificationToken = function () {
    this.verificationToken = crypto.randomBytes(16).toString("hex");
}

module.exports = mongoose.model("User" , UserSchema);