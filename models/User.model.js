import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: String,
    avatarPublicId: String,
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('users', UserSchema);
