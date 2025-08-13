const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: function() {
            return this.login_method === 'email' || this.login_method === 'both';
        }
    },

    github_id: {
        type: String,
        unique: true,
        sparse: true
    },
    github_username: {
        type: String,
        unique: true,
    },
    github_avatar: String,
    login_method: {
        type: String,
        enum: ['email', 'github', 'both'],
        default: 'email'
    },
    otp_code: String,
    otp_expires_at: Date,
    otp_verified: {
        type: Boolean,
        default: false
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    mfa_enabled: {
        type: Boolean,
        default: false
    },
    mfa_secret: {
        type: String
    },
    last_login: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

userSchema.methods.generateToken = function () {
    return jwt.sign({ id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

module.exports = mongoose.model('User', userSchema);