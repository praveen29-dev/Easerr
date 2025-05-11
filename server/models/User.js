import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'recruiter'], default: 'user' },
    profileImage: { type: String, default: null },
    resume: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, { 
    timestamps: true 
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    
    if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 10);
    }
    
    next();
});

// Generate JWT token
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
        expiresIn: '7d' // Token expires in 7 days
    });
    
    user.tokens = user.tokens.concat({ token });
    await user.save();
    
    return token;
};

// Find user by credentials
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new Error('Invalid login credentials');
    }
    
    const isMatch = await bcryptjs.compare(password, user.password);
    
    if (!isMatch) {
        throw new Error('Invalid login credentials');
    }
    
    return user;
};

// Remove sensitive data before sending to client
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    
    delete userObject.password;
    delete userObject.tokens;
    
    // Map profileImage to profileImageUrl and resume to resumeUrl for frontend compatibility
    if (userObject.profileImage) {
        userObject.profileImageUrl = userObject.profileImage;
    }
    
    if (userObject.resume) {
        userObject.resumeUrl = userObject.resume;
    }
    
    return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;