const expect = require('expect')
const request = require('supertest')

const app = require('../app')

describe('/', () => {

  describe('GET /', () => {
    
    it('should respond 200', async () => {
    
      await request(app)
        .get('/')
        .expect(200)
    })
  })
})