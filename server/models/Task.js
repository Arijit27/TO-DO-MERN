const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: String,
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Task', taskSchema);
