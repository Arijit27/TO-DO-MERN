const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');
const Task = require('./models/Task');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};
// Register
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }

        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Apply authentication middleware to protected routes
app.use('/tasks', authenticateToken);

// Get all tasks
// Get tasks for the authenticated user
app.get('/tasks', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Extract user ID from JWT payload
    const tasks = await Task.find({ user: userId }); // Filter tasks by user ID
    res.json(tasks);
});


// Add a new task
app.post('/tasks', authenticateToken, async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user.id;

        if (!title) {
            return res.status(400).send('Title is required');
        }

        const newTask = new Task({
            title,
            user: userId
        });

        const savedTask = await newTask.save();
        res.json(savedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update a task
app.put('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTask || updatedTask.user.toString() !== req.user.id) {
            return res.status(403).send('Not authorized to update this task');
        }
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete a task
app.delete('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const deletedTask = await Task.findById(req.params.id);
        if (!deletedTask || deletedTask.user.toString() !== req.user.id) {
            return res.status(403).send('Not authorized to delete this task');
        }
        await Task.findByIdAndDelete(req.params.id);
        res.json(deletedTask);
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).send('Internal Server Error');
    }
});


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
