import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  liveLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  address: { type: String },
  DeliveryPartners: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner',
  },
});

// Create the Branch model
const Branch = mongoose.model('Branch', branchSchema);

// Export the Branch model
export { Branch };
