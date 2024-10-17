const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/megaDeals', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Route for GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Route for login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        return res.json({ success: true, message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Route to register a new user (optional)
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user
        user = new User({ email, password: hashedPassword });
        await user.save();

        res.json({ success: true, message: 'User registered' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
