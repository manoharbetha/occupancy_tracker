const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/occupancyTracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Room Schema
const roomSchema = new mongoose.Schema({
    room: String,
    status: Boolean,
});

const Room = mongoose.model('Room', roomSchema);

// Lab Schema
const labSchema = new mongoose.Schema({
    lab: String,
    status: Boolean,
});

const Lab = mongoose.model('Lab', labSchema);

// Get room status
app.get('/api/room-status', async (req, res) => {
    try {
        const rooms = await Room.find();
        const roomStatus = {};
        rooms.forEach(room => {
            roomStatus[room.room] = room.status;
        });
        res.json(roomStatus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update room status
app.post('/api/room-status', async (req, res) => {
    const { room, status } = req.body;
    try {
        console.log(`Updating room ${room} status to ${status}`);
        const result = await Room.findOneAndUpdate(
            { room }, 
            { status }, 
            { upsert: true, new: true }
        );
        console.log('Update result:', result);
        res.json({ message: 'Room status updated successfully!', data: result });
    } catch (error) {
        console.error('Error updating room status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get lab status
app.get('/api/lab-status', async (req, res) => {
    try {
        const labs = await Lab.find();
        const labStatus = {};
        labs.forEach(lab => {
            labStatus[lab.lab] = lab.status;
        });
        res.json(labStatus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update lab status
app.post('/api/lab-status', async (req, res) => {
    const { lab, status } = req.body;
    try {
        console.log(`Updating lab ${lab} status to ${status}`);
        const result = await Lab.findOneAndUpdate(
            { lab }, 
            { status }, 
            { upsert: true, new: true }
        );
        console.log('Update result:', result);
        res.json({ message: 'Lab status updated successfully!', data: result });
    } catch (error) {
        console.error('Error updating lab status:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please try a different port or close the application using this port.`);
    } else {
        console.error('Error starting server:', err);
    }
    process.exit(1);
});