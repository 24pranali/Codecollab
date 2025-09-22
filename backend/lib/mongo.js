import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅MongoDB Connected");
    }
  } catch (error) {
    console.error("❌MongoDB connection error:", error);
  }
};

export default connectToDatabase;
