require('./db/mongoose');
const express = require('express');
const usersRouter = require('./routers/users');
const tasksRouter = require('./routers/tasks');

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(usersRouter);
app.use(tasksRouter)

app.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}`);
});