import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [ true, "Username is required"],
    unique: [ true, "Username already exists"],    
  },
  email: {
    type: String,
    required: [ true, "Email is required"],
    unique: [ true, "Email already exists"],
  },
  password: {
    type: String,
    required: [ true, "Password is required"],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    required: true,
  },

  age: {
      type: Number,
      min: 1,
      max: 120,
  },
  condition: {
      type: String,
      enum: ["good", "bad", "excellent", "average"],
  },
  weight: {
      type: Number,
      min: 0,
      max: 500,
  },
  gender: {
      type: String,
  },
  city: {
      type: String,
      trim: true,
  },
  bio: {
      type: String,
      trim: true,
  },
  profilePicture: {
      type: String,
      default: null,
  },
});

export default mongoose.model("users", userSchema);