import mongoose from 'mongoose';

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log("Database Connected Successfully➡️➡️📩");
    } catch (error) {
        console.log("Database Not Connected", error);
    }
};

export { connectDB };
