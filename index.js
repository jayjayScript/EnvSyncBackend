const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const mongoose = require('mongoose')
require('dotenv').config()

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB')
}).catch(() => {
    console.error('Error connecting to MongoDB')
})


const authRoutes = require('./routes/Auth')
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Hello Devs!')
})


app.listen(port, () => {
    console.log(`EnvSync listening on port ${port}`)
})