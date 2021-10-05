const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOne, userOneId, userOneJwtToken, setupDB } = require('./fixtures/db');

beforeEach(setupDB);

it('Should signup a new user', async() => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'John Smith',
            email: 'john@test.com',
            password: '12345678',
            age: 22
        })
        .expect(201);


    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);

    expect(user).not.toBeNull();

    //Assertions about the response 
    expect(response.body).toMatchObject({
        user: {
            name: 'John Smith',
            email: 'john@test.com',
            age: 22
        },
        token: user.tokens[0].token,
    });
    expect(user.password).not.toBe('12345678');
});

it('Should login existing user', async() => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password,
        })
        .expect(200);

    const user = await User.findById(response.body.user._id);
    const newToken = user.tokens[1].token;

    expect(newToken).toEqual(response.body.token);
    expect(response.body).toMatchObject({
        user: {
            name: userOne.name,
            email: userOne.email,
            age: userOne.age,
        },
        token: newToken,
    });
});

it('Should not login nonexistent user', async() => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'nonexistent@test.com',
            password: 'failed',
        })
        .expect(400);
});

it('Should get profile for user', async() => {
    await request(app)
        .get('/users/me')
        .set('Authorization', userOneJwtToken)
        .send()
        .expect(200);
});

it('Should not get profile for unauthenticated user', async() => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

it('Should delete account for user', async() => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', userOneJwtToken)
        .send()
        .expect(200);

    const user = await User.findById(response.body._id);

    expect(user).toBeNull();
});

it('Should not delete account for unauthenticated user', async() => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});

it('Should upload avatar image', async() => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', userOneJwtToken)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

    const user = await User.findById(userOneId);

    expect(user.avatar).toEqual(expect.any(Buffer));
});

it('Should update valid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', userOneJwtToken)
        .send({
            name: 'Mike Jonson',
            email: 'mike99jonson@test.com',
            age: 30,
        })
        .expect(200);


    const user = await User.findById(userOneId);

    expect(user).toMatchObject({
        name: 'Mike Jonson',
        email: 'mike99jonson@test.com',
        age: 30,
    });
});

it('Should not update invalid user fields', async() => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', userOneJwtToken)
        .send({
            location: 'New Location'
        })
        .expect(400);

    expect(response.body.error).toEqual('Fields are not allowed');
});