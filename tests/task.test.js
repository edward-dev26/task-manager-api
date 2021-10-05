const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { userOne, userOneId, userOneJwtToken, taskThree, setupDB } = require('./fixtures/db');

beforeEach(setupDB);

it('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', userOneJwtToken)
        .send({
            description: 'From my test',
        })
        .expect(201);

    const task = await Task.findById(response.body._id);

    expect(task).not.toBeNull();
    expect(response.body).toMatchObject({
        description: 'From my test',
        completed: false
    })
});

it('Should get task only for user one', async () => {
    const { body } = await request(app)
        .get('/tasks')
        .set('Authorization', userOneJwtToken)
        .send()
        .expect(200);

    expect(body).toHaveLength(2);
});

it('Should not delete tasks for user two', async () => {
    await request(app)
        .delete(`/tasks/${taskThree._id}`)
        .set('Authorization', userOneJwtToken)
        .send()
        .expect(404);

    const task = Task.findById(taskThree._id);

    expect(task).not.toBeNull();
});