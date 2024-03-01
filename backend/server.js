// code for creating server.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/userSchema');

// connect to express app:

const app = express();
const SECRET_KEY = 'secretkey';

// connect to mongodb database:

const dbUri = 'mongodb+srv://devilme:Devilme96@cluster30.4n4f5mu.mongodb.net/userAuth?retryWrites=true&w=majority';
mongoose.connect(dbUri)
.then(() => {
    app.listen(3001, () => {
        console.log('Server and mongodb is connected, 3001!')
    })
})
.catch((error) => {
    console.log('unable to connect!', error);
})

// middleware:

app.use(cors());
app.use(bodyParser.json());

// Routes:

// register user
app.post('/register', async (req, res) => {
    try{
        const {email, username, password} = req.body;
        // hash password to protect route:
        const hashPassword = await bcrypt.hash(password, 10);
        const isUserEmailExists = await User.findOne({email})
        const isUserNameExists = await User.findOne({username})
        if(isUserNameExists){
            return res.status(400).json({message: 'Username already exists!'});
        }
        if(isUserEmailExists){
            return res.status(400).json({message: 'Email already exists!'});
        }
        const newUser = new User({ email, username, password: hashPassword});
        await newUser.save();
        res.status(201).json({message: 'User created successfully!', value: newUser})
    }catch(err){
        res.status(500).json({error: 'Error signing up'})
    }
});

// get registered user:

app.get('/register', async(req, res) => {
    try{
        const users = await User.find(); // to get everything in User collection
        res.status(200).json(users);
    }catch(err){
        res.status(500).json({error: 'Unable to get the users'})
    }
})

// post login user:

app.post('/login', async(req, res) => {
    try{
        const {username, password} = req.body;
        console.log(username);
        const user = await User.findOne({username});
        // if don't find the user
        if(!user){
           return res.status(401).json({ error: "User doesn't exists!"})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({ error: "invalid credentials"});
        }

        // if username and password is correct, then we'll make token:
        const token = jwt.sign({userId: user._id}, SECRET_KEY, {expiresIn: '1hr'});
        res.status(200).json({ message: 'Login successful!', token})
    }catch(err){
        res.status(500).json({ error: 'Unable to sign in!'});
    }
})