import mongoose from 'mongoose';

const bonsaiSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  species: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    default: 0
  },
  health: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  water: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  sunlight: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  growth: {
    type: Number,
    default: 0
  },
  lastWatered: {
    type: Date,
    default: Date.now
  },
  lastFertilized: {
    type: Date,
    default: Date.now
  },
  style: {
    type: String,
    enum: ['formal_upright', 'informal_upright', 'slanting', 'cascade', 'semi_cascade'],
    default: 'formal_upright'
  },
  achievements: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt
bonsaiSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Bonsai', bonsaiSchema);