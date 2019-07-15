const expect = require('expect')
const request = require('supertest')
const {ObjectId} = require('mongodb')

const app = require('../app')
const Inventory = require('../models/item-model')
const User = require('../models/user-model')
const {populateDatabase, populateInventory, items, populateUsers, users, tokens} = require('./seed')

beforeEach(populateInventory)
beforeEach(populateUsers)

// ITEMS ======================================

// GET /items
describe('GET /items', () => {

  describe('if no token is provided', () => {

    it('should respond 401', async () => {

      await request(app)
        .get('/items')
        .expect(401)
    })
  })

  describe('if a valid token is provided', () => {
    
  const cookie = `token=${tokens.token0}`

    it('should respond 200', async () => {
      request(app)
        .get('/items')
        .set('Cookie', cookie)
        .expect(200)
    })

    it('should return all items', async () => {
      request(app)
        .get('/items')
        .set('Cookie', cookie)
        .expect((res) => {
          expect(res.body.items.length).not.toBe(0)
        })
    })
  })
})

// POST /items
describe('POST /items', () => {

  describe('when no token is provided', () => {

    it('should respond 401', async () => {

      await request(app)
        .post('/items')
        .expect(401)
    })
  })

  describe('when a valid token is provided', () => {

    describe('when `name` is invalid', () => {

      const name = 'test item'

      it('should respond 400', async () => {

        await request(app)
          .post('/items')
          .set('Cookie', cookie)
          .send({ name: 1244 })
          .expect(400)
      })
    })

    describe('when `name` is valid', () => {

      const name = 'test item'

      it('should respond 200', async () => {

        await request(app)
          .post('/items')
          .set('Cookie', cookie)
          .send({ name })
          .expect(200)
      })

      it('should return the new item', async () => {

        await request(app)
          .post('/items')
          .set('Cookie', cookie)
          .send({ name })
          .expect(res => {
            expect(res.body.item.name).toBe(name)
          })
      })

      it('should create a new item', async () => {

        await request(app)
          .post('/items')
          .set('Cookie', cookie)
          .send({ name })

        const foundItems = await Inventory.find({ name })
        expect(foundItems.length).toBe(1)
        expect(foundItems[0].name).toBe(name)
      })
    })
  })

  it('should NOT create a new item, if body data is invalid', (done) => {

    request(app)
      .post('/items')
      .send({})
      .set('Cookie', cookie)
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        
        Inventory.find().then((items) => {
          expect(items.length).toBe(2)
          done()
        })
      })
  })
})

// GET /items/:id
describe('GET /items/:id', () => {
  const cookie = `token=${tokens.token0}`

  it('should return specified item', (done) => {
    const id = items[0]._id.toString()

    request(app)
      .get(`/items/${id}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.item._id).toBe(id)
      })
      .end(done)
  })

  it('should return 404 if item is not found', (done) => {
    const id = new ObjectId()

    request(app)
      .get(`/items/${id}`)
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })

  it('should return 404 if Id is invalid', (done) => {
    const id = '1234213412'

    request(app)
      .get(`/items/${id}`)
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })
})

// DELETE /items/:id
describe('DELETE /items/:id', () => {
  const cookie = `token=${tokens.token0}`
  const id = items[0]._id.toString()

  it('should delete an item', (done) => {
    request(app)
      .delete(`/items/${id}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.item._id).toBe(id)
      })
      .end((err, res) => {
        if (err) {
          return done(err.stack)
        }

        Inventory.findById(id).then((item) => {
          expect(item).toBeFalsy()
          done()
        }).catch((err) => done(err.stack))
      })
  })

  it('should return 404 if specified item is not found', (done) => {
    const id =  new ObjectId()
    request(app)
      .delete(`/items/${id}`)
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })

  it('should return 404 if Id is invalid', (done) => {
    const id = 'alsdfu23423'
    request(app)
      .delete(`/items/${id}`)
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })
})

// PATCH /todos/:id
describe('PATCH /todos/:id', () => {
  it('should update the specified item', (done) => {
    const cookie = `token=${tokens.token0}`
    const id = items[0]._id.toString()
    const name = 'updated name'

    request(app)
      .patch(`/items/${id}`)
      .set('Cookie', cookie)
      .send({name})
      .expect(200)
      .expect((res) => {
        expect(res.body.item._id).toBe(id)
        expect(res.body.item.name).toBe(name)
      })
      .end(done)
  })
})

// USERS ======================================

// GET /users
describe('GET /users', () => {
  it('should return all users', (done) => {
    const cookie = `token=${tokens.token0}`

    request(app)
      .get('/users')
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.users.length).not.toBe(0)
      })
      .end(done)
  })
})

// POST /users
describe('POST /users', () => {

  it('should create a new user', (done) => {
    const email = 'test@example.com'
    const password = '1234asdf'

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.header['set-cookie'][0]).toMatch(/token/)
        expect(res.text).toBe(email)
        // expect(res.body.password).not.toBe(password)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.find({ email }).then((user) => {
          expect(user[0].email).toBe(email)
          expect(user).toBeTruthy()
          expect(user[0].password).not.toBe(password)
          done()
        }).catch((err) => done(err))
      })
  })

  it('should NOT create a new item, if body data is invalid', (done) => {

    request(app)
      .post('/users')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        
        User.find().then((users) => {
          expect(users.length).toBe(2)
          done()
        })
      })
  })

  it('should NOT create a new item, if body data is invalid', (done) => {

    request(app)
      .post('/users')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        
        User.find().then((users) => {
          expect(users.length).toBe(2)
          done()
        })
      })
  })
})

// GET /users/:id
describe('GET /users/:id', () => {
  const cookie = `token=${tokens.token0}`

  it('should return specified item', (done) => {
    const id = users[0]._id.toString()
    request(app)
      .get(`/users/${id}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.user._id).toBe(id)
      })
      .end(done)
  })

  it('should return 404 if item is not found', (done) => {
    const id = new ObjectId()
    request(app)
      .get(`/users/${id}`)
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })

  it('should return 404 if Id is invalid', (done) => {
    const id = '1234213412'
    request(app)
      .get(`/users/${id}`)
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })
})

// DELETE /users/:id
describe('DELETE /users/:id', () => {
  const id = users[0]._id.toString()
  const cookie = `token=${tokens.token0}`

  it('should delete an item', (done) => {
    request(app)
      .delete(`/users/${id}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.user._id).toBe(id)
      })
      .end((err, res) => {
        if (err) {
          return done(err.stack)
        }

        Inventory.findById(id).then((user) => {
          expect(user).toBeFalsy()
          done()
        }).catch((err) => done(err.stack))
      })
  })

  it('should return 404 if specified user is not found', (done) => {
    const id =  new ObjectId()
    request(app)
      .delete(`/users/${id}`)
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })

  it('should return 404 if Id is invalid', (done) => {
    const id = 'alsdfu23423'
    request(app)
      .delete(`/users/${id}`)
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })
})

// PATCH /users/:id
describe('PATCH /users/:id', () => {
  const cookie = `token=${tokens.token0}`

  it('should update the specified user', (done) => {
    const id = users[0]._id.toString()
    const email = 'updatedemail@test.com'
    const password = 'updatedpassword'

    request(app)
      .patch(`/users/${id}`)
      .set('Cookie', cookie)
      .send({ email, password})
      .expect(200)
      .expect((res) => {
        expect(res.body.user._id).toBe(id)
        expect(res.body.user.email).toBe(email)
      })
      .end(done)
  })
})
