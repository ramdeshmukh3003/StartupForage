const jwt = require("jsonwebtoken");

require("dotenv").config();

const authMiddleware = (req,res,next) => {

    const token = req.headers("Authorization").split(" ")[1];
    if(!token) return res.status(401).json("Access Denied");

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        req.user = decoded; // attach user to the request . so that we can access it in the route
        next();

    }
    catch{
        res.status(400).json("Invalid Token");
    }
}

module.exports = authMiddleware;;