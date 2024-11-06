import express from 'express';
import Bonsai from '../models/Bonsai.js';

const router = express.Router();

// Get all bonsais for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const bonsais = await Bonsai.find({ userId: req.params.userId });
    res.json(bonsais);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific bonsai
router.get('/:id', async (req, res) => {
  try {
    const bonsai = await Bonsai.findById(req.params.id);
    if (bonsai) {
      res.json(bonsai);
    } else {
      res.status(404).json({ message: 'Bonsai not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new bonsai
router.post('/', async (req, res) => {
  const bonsai = new Bonsai({
    userId: req.body.userId,
    name: req.body.name,
    species: req.body.species,
    style: req.body.style || 'formal_upright'
  });

  try {
    const newBonsai = await bonsai.save();
    res.status(201).json(newBonsai);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a bonsai
router.patch('/:id', async (req, res) => {
  try {
    const bonsai = await Bonsai.findById(req.params.id);
    if (!bonsai) {
      return res.status(404).json({ message: 'Bonsai not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'userId') {
        bonsai[key] = updates[key];
      }
    });

    const updatedBonsai = await bonsai.save();
    res.json(updatedBonsai);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Water the bonsai
router.post('/:id/water', async (req, res) => {
  try {
    const bonsai = await Bonsai.findById(req.params.id);
    if (!bonsai) {
      return res.status(404).json({ message: 'Bonsai not found' });
    }

    bonsai.water = Math.min(100, bonsai.water + 20);
    bonsai.lastWatered = new Date();
    
    // Update health based on watering
    if (bonsai.water > 80) {
      bonsai.health = Math.max(0, bonsai.health - 5); // Overwatering damage
    } else if (bonsai.water < 20) {
      bonsai.health = Math.max(0, bonsai.health - 10); // Underwatering damage
    } else {
      bonsai.health = Math.min(100, bonsai.health + 2); // Healthy watering bonus
    }

    const updatedBonsai = await bonsai.save();
    res.json(updatedBonsai);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;