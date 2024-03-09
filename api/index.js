const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("./models/user");
const Todo = require("./models/todos");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose
  .connect("mongodb+srv://bipulkumarb6:apple123@cluster0.zvyzjlr.mongodb.net/")
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Error connecting to database");
  });

app.listen(port, () => {
  console.log("Server is running on port 3000");
});

// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email or password is missing",
        status: "warning",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered",
        status: "warning",
      });
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    res.status(200).json({
      message: "User registered successfully",
      status: "success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Internal server error",
      status: "error",
    });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email or password is missing",
        status: "warning",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        status: "warning",
      });
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: "Invalid password",
        status: "warning",
      });
    }

    res.status(200).json({
      message: "User logged in successfully",
      status: "success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Internal server error",
      status: "error",
    });
  }
});
