import mongoose from "mongoose";

// Define the schema
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  sequence_value: { type: Number, default: 0 },
});

// Create the model using the schema
const Counter = mongoose.model("Counter", counterSchema);
export { Counter }; 
