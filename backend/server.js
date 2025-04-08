const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3001;

// Rate limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(bodyParser.json());

// CORS Configuration
app.use(cors({
  origin: [
    'https://occupancy-tracker-02.vercel.app', // Your Vercel URL
    'http://localhost:3000' // Local development
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas and Models
const roomSchema = new mongoose.Schema({
  room: { type: String, required: true, unique: true },
  status: { type: Boolean, required: true }
});
const Room = mongoose.model('Room', roomSchema);

const labSchema = new mongoose.Schema({
  lab: { type: String, required: true, unique: true },
  status: { type: Boolean, required: true }
});
const Lab = mongoose.model('Lab', labSchema);

// API Endpoints
app.get('/api/room-status', async (req, res) => {
  try {
    const rooms = await Room.find();
    const statusMap = rooms.reduce((acc, room) => {
      acc[room.room] = room.status;
      return acc;
    }, {});
    res.json(statusMap);
  } catch (error) {
    console.error('Error fetching room status:', error);
    res.status(500).json({ error: 'Failed to fetch room status' });
  }
});

app.post('/api/room-status', async (req, res) => {
  try {
    const { room, status } = req.body;
    const updatedRoom = await Room.findOneAndUpdate(
      { room },
      { status },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ message: 'Room status updated', data: updatedRoom });
  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({ error: 'Failed to update room status' });
  }
});

// Similar updates for lab endpoints...

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}).on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});
