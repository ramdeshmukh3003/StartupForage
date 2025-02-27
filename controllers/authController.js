
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { sendVerificationEmail } = require("../config/email");



const generateToken = (user) => {
    return jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET,{expiresIn: "7d"});
}



exports.register = async(req,res) => {
    try {
        const {name , email , password , role} = req.body;
        
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User Already Exists"});
        }

        const newUser = new User({
            name,
            email,
            password,
            role,
        });
        newUser.generateVerificationToken();
        await newUser.save();
        // console.log(newUser.verificationToken);
        await sendVerificationEmail(newUser.email , newUser.verificationToken);
        
        res.status(201).json({message: "User Registered Successfully , Please Verify Your Email", 
            verificationToken: newUser.verificationToken
        });
    }
    catch(error){
        console.error("❌ Registration Failed", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};

exports.verifyEmail = async (req,res) => {
    const {token} = req.params;
    try {
        const user = await User.findOne({verificationToken: token});
        if(!user){
            return res.status(400).json({message: "Invalid Token"});
        }
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();
        res.status(200).json({message: "Email Verified Successfully, you can now Log In"});
    }
    catch(error){
        console.error("❌ Email Verification Failed", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}
exports.login = async(req,res) => {
    try {
        const {email , password} = req.body;
        const existingUser = await User.findOne({email});
        if(!existingUser){
            return res.status(400).json({message: "Invalid Credentials"});
        }
        if(!existingUser.isVerified) {
            return res.status(403).json({message: "Please Verify Your Email"});
        }
        // validate password 
        const isMatch = bcrypt.compare(password , existingUser.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid Credentials"});
        }
        const token = await generateToken(existingUser);

        res.cookie("authToken", token, {
            httpOnly: true,  // Prevents JavaScript access (XSS protection)
            secure: process.env.NODE_ENV === "production", // Only over HTTPS
            sameSite: "Strict", // Prevent CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days expiry
        });
        res.status(200).json({user: existingUser , token});

    }catch(error){
        console.error("❌ Login Failed", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};