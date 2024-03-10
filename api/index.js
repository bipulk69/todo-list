const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const moment = require("moment");

const User = require("./models/user");
const Todo = require("./models/todos");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;
const cors = require("cors");
const { title } = require("process");
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

// Generate secret key
const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
};

const secretKey = generateSecretKey();

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

    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({
      token,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Internal server error",
      status: "error",
    });
  }
});

// Add todo
app.post("/todos/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { title, category } = req.body;

    const newTodo = new Todo({
      title,
      category,
      dueDate: moment().format("YYYY-MM-DD"),
    });

    await newTodo.save();

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    user?.todos.push(newTodo._id);
    await user.save();

    res.status(200).json({ message: "Todo added sucessfully", todo: newTodo });
  } catch (error) {
    res.status(200).json({ message: "Todo not added" });
  }
});

// Get todos
app.get("/users/:userId/todos", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("todos");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ todos: user.todos });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal server error",
      status: "error",
    });
  }
});

// Update todo
app.patch("/todos/:todoId/complete", async (req, res) => {
  try {
    const todoId = req.params.todoId;

    const updatedTodo = await Todo.findByIdAndUpdate(
      todoId,
      { staus: "completed" },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res
      .status(200)
      .json({ message: "Todo updated successfully", todo: updatedTodo });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal server error",
      status: "error",
    });
  }
});
