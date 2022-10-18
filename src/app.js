require('./db/mongoose');
const express = require('express');
const usersRouter = require('./routers/users');
const tasksRouter = require('./routers/tasks');

const app = express();

app.get('/', (req, res) => {
    res.send("<h1>Welcome to TaskManagerAPI</h1>")
});

app.use(express.json());
app.use(usersRouter);
app.use(tasksRouter)

module.exports = app;