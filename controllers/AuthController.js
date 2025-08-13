const User = require('../models/User');
const bcrypt = require('bcryptjs')

const register = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'username, email, and password are required'
            });
        }

        const isExisting = await User.findOne({ email: email.toLocaleLowerCase() })
        if (isExisting) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists!...'
            })
        }

        const newUser = new User({
            email: email.toLocaleLowerCase(),
            username,
            password: password
        })

        const savedUser = await newUser.save();

        res.status(200).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: savedUser._id,
                email: savedUser.email,
                username: savedUser.username,
            }
        })

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'USER REGISTRATION ERROR!'
        })
    }

}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: 'Email and Password are REQUIRED!!'
            })
        }

        const user = await User.findOne({ email: email.toLocaleLowerCase() });
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User with this email does not exist'
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                success: false,
                message: 'Password is not Valid'
            })
        }

        const token = user.generateToken();

        res.status(200).json({
            success: true,
            message: `${user.username} has loggedin successfully`,
            token,
            data: {
                id: user._id,
                email: user.email,
                username: user.username,
                last_login: user.last_login
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'FAILED TO LOGIN USER!'
        })
        console.error(error)
    }
}


module.exports = {
    register,
    login
}