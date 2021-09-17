const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');

const router = new express.Router();

const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be an image (jpg, jpeg, png)'));
        }

        cb(undefined, true);
    }
});

router.get('/users/me', auth, async(req, res) => {
    res.send(req.user);
});

router.get('/users/me/avatar', auth, async(req, res) => {
    try {
        if (!req.user.avatar) {
            return res.status(404).send();
        }

        res.set('Content-Type', 'image/png');
        res.send(req.user.avatar);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.get('/users/:id', auth, async(req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.post('/users', async(req, res) => {
    try {
        const user = new User(req.body);

        await user.save();
        sendWelcomeEmail(user.email, user.name);

        const token = await user.generateToken();

        res.status(201).send({ user, token });
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.post('/users/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password);
        const token = await user.generateToken();

        res.send({ user, token });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(({ token }) => token !== req.token);
        await req.user.save();
        res.send();
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        console.log(e);
        res.status(500).send()
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();

        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);

router.patch('/users/me', auth, async(req, res) => {
    const allowedFields = ['name', 'email', 'age'];
    const isUpdateAllowed = Object.keys(req.body).every(key => allowedFields.includes(key));

    if (!isUpdateAllowed) {
        return res.status(400).send({ error: 'Fields are not allowed' });
    }

    try {
        allowedFields.forEach(field => {
            if (req.body[field]) {
                req.user[field] = req.body[field];
            }
        });

        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete('/users/me', auth, async(req, res) => {
    try {
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.delete('/users/me/avatar', auth, async(req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

module.exports = router;