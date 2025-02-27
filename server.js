const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cors({credentials:true , origin:"http://localhost:3000"}));
app.use(cookieParser());

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`)
});

const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);

// app.get("/", (req , res) => {
//     res.send("Hello From Server");
// })

// app.get("/api" , (req , res) => {
//     res.send("Hello From API");
// });