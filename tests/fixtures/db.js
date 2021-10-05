const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId();

const userOne = {
    _id: userOneId,
    name: 'Mike',
    email: 'mike@test.com',
    password: '12345678',
    age: 25,
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),

    }]
};

const userTwoId = new mongoose.Types.ObjectId();

const userTwo = {
    _id: userTwoId,
    name: 'Andrew',
    email: 'andrew@test.com',
    password: '12345678',
    age: 25,
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),

    }]
};

const userOneJwtToken = `Bearer ${userOne.tokens[0].token}`;
const userTwoJwtToken = `Bearer ${userTwo.tokens[0].token}`;

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First task',
    completed: false,
    owner: userOne._id,
};

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second task',
    completed: true,
    owner: userOne._id,
};

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third task',
    completed: true,
    owner: userTwo._id,
};

const setupDB = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
};

module.exports = {
    userOneId,
    userOne,
    userOneJwtToken,
    setupDB,
    taskOne,
    taskTwo,
    taskThree,
};