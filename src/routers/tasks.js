const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = new express.Router();

// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async(req, res) => {
    const { completed, limit, skip, sortBy } = req.query;
    const match = {};
    const sort = {};

    if (completed) match.completed = completed === 'true';

    if (sortBy) {
        const parts = sortBy.split(':')

        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user
            .populate({
                path: 'tasks',
                match,
                options: {
                    limit: parseInt(limit),
                    skip: parseInt(skip),
                    sort,
                }
            })
            .execPopulate();

        res.send(req.user.tasks);
    } catch (e) {
        console.log(e);
        res.status(500).send()
    }
});

router.get('/tasks/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!task) {
            res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.post('/tasks', auth, async(req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id,
        });

        await task.save();

        res.status(201).send(task);
    } catch (e) {
        res.status(400).send();
    }
});


router.patch('/tasks/:id', auth, async(req, res) => {
    const allowedFields = ['description', 'completed'];
    const isUpdateAllowed = Object.keys(req.body).every(key => allowedFields.includes(key));

    if (!isUpdateAllowed) {
        return res.status(400).send({ error: 'Fields are not allowed' });
    }

    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!task) {
            return res.status(404).send();
        }

        allowedFields.forEach(field => {
            if (req.body[field]) {
                task[field] = req.body[field];
            }
        });

        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete('/tasks/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

module.exports = router;