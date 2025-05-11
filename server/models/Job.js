import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
  },
  category: {
    type: String,
    required: [true, 'Job category is required'],
  },
  level: {
    type: String,
    enum: ['Beginner Level', 'Intermediate Level', 'Senior Level'],
    default: 'Beginner Level',
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
  },
  requirements: [{
    type: String,
  }],
  responsibilities: [{
    type: String,
  }],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Company is required'],
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active',
  },
  applicationDeadline: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for better query performance
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ company: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });

const Job = mongoose.model('Job', jobSchema);

export default Job; 