const knex = require('knex')
const app = require('../src/app')
const { makePeopleArray } = require('./people.fixures')
//const { makeUsersArray } = require('./users.fixtures')

describe('People Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE avail, timeslots, roles, schedules, people RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE avail, timeslots, roles, schedules, people RESTART IDENTITY CASCADE'))

  describe(`GET /api/people`, () => {
    context(`Given no people`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/people')
          .expect(200, [])
      })
    })

    context('Given there are people in the database', () => {
      const testPeople = makePeopleArray()

      beforeEach('insert people', () => {
        return db
          .into('people')
          .insert(testPeople)
      })

      it('responds with 200 and all of the articles', () => {
        return supertest(app)
          .get('/api/people')
          .expect(200, testPeople)
      })
    })

    /*
    context(`Given an XSS attack article`, () => {
      const { maliciousArticle, expectedArticle } = makeMaliciousArticle()
      const testUsers = makeUsersArray()

      beforeEach('insert malicious article', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert([ maliciousArticle ])
          })
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/articles`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedArticle.title)
            expect(res.body[0].content).to.eql(expectedArticle.content)
          })
      })
    })*/
  })

  describe(`GET /api/people/:people_id`, () => {
    context(`Given no people`, () => {
      it(`responds with 404`, () => {
        const personId = 123456
        return supertest(app)
          .get(`/api/people/${personId}`)
          .expect(404, { error: { message: `Person doesn't exist` } })
      })
    })

    context('Given there are people in the database', () => {
        const testPeople = makePeopleArray()

        beforeEach('insert people', () => {
          return db
            .into('people')
            .insert(testPeople)
        })

      it('responds with 200 and the specified article', () => {
        const personId = 2
        const expectedPerson = testPeople[personId - 1]
        return supertest(app)
          .get(`/api/people/${personId}`)
          .expect(200, expectedPerson)
      })
    })

    /*
    context(`Given an XSS attack article`, () => {
      const { maliciousArticle, expectedArticle } = makeMaliciousArticle()
      const testUsers = makeUsersArray()

      beforeEach('insert malicious article', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert([ maliciousArticle ])
          })
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/articles/${maliciousArticle.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedArticle.title)
            expect(res.body.content).to.eql(expectedArticle.content)
          })
      })
    })
    */
  })

  describe(`POST /api/people`, () => {
    it(`creates a new person with an account, responding with 201 and the new person`, function() {
      const newPerson = {
            email: "profmoriarty@gmail.com",
            account: true,
            first_name: "James",
            last_name: "Moriarty",
            username: "profmori",
            password: "greatestpassword"
      }
      return supertest(app)
        .post('/api/people')
        .send(newPerson)
        .expect(201)
        .expect(res => {
          expect(res.body.email).to.eql(newPerson.email)
          expect(res.body.account).to.eql(newPerson.account)
          expect(res.body.first_name).to.eql(newPerson.first_name)
          expect(res.body.last_name).to.eql(newPerson.last_name)
          expect(res.body.username).to.eql(newPerson.username)
          expect(res.body.password).to.eql(newPerson.password)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/people/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/api/people/${res.body.id}`)
            .expect(res.body)
        )
    })

    it(`creates a new person without an account, responding with 201 and the new person`, function() {
        const newPerson = {
              email: "profmoriarty@gmail.com",
              account: false,
              first_name: "James",
              last_name: "Moriarty",
              username: "",
              password: ""
        }
        return supertest(app)
          .post('/api/people')
          .send(newPerson)
          .expect(201)
          .expect(res => {
            expect(res.body.email).to.eql(newPerson.email)
            expect(res.body.account).to.eql(newPerson.account)
            expect(res.body.first_name).to.eql(newPerson.first_name)
            expect(res.body.last_name).to.eql(newPerson.last_name)
            expect(res.body.username).to.eql(newPerson.username)
            expect(res.body.password).to.eql(newPerson.password)
            expect(res.body).to.have.property('id')
            expect(res.headers.location).to.eql(`/api/people/${res.body.id}`)
          })
          .then(res =>
            supertest(app)
              .get(`/api/people/${res.body.id}`)
              .expect(res.body)
          )
    })

    const requiredFields = ['email', 'account', 'first_name', 'last_name']

    requiredFields.forEach(field => {
        const newPerson = {
            email: "profmoriarty@gmail.com",
            account: false,
            first_name: "James",
            last_name: "Moriarty",
            username: "",
            password: ""
        }

        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newPerson[field]

        return supertest(app)
            .post('/api/people')
            .send(newPerson)
            .expect(400, {
            error: { message: `Missing '${field}' in request body` }
            })
        })
    })
    
    /*
    it('removes XSS attack content from response', () => {
      const { maliciousArticle, expectedArticle } = makeMaliciousArticle()
      return supertest(app)
        .post(`/api/articles`)
        .send(maliciousArticle)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(expectedArticle.title)
          expect(res.body.content).to.eql(expectedArticle.content)
        })
    })
    */
  })

  describe(`DELETE /people/:person_id`, () => {
    context(`Given no people`, () => {
      it(`responds with 404`, () => {
        const personId = 123456
        return supertest(app)
          .delete(`/api/people/${personId}`)
          .expect(404, { error: { message: `Person doesn't exist` } })
      })
    })

    context('Given there are articles in the database', () => {
        const testPeople = makePeopleArray()

        beforeEach('insert people', () => {
          return db
            .into('people')
            .insert(testPeople)
        })

      it('responds with 204 and removes the person', () => {
        const idToRemove = 2
        const expectedPerson = testPerson.filter(person => person.id !== idToRemove)
        return supertest(app)
          .delete(`/api/people/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/people`)
              .expect(expectedPerson)
          )
      })
    })
  })

  describe(`PATCH /api/people/:person_id`, () => {
    context(`Given no people`, () => {
      it(`responds with 404`, () => {
        const personId = 123456
        return supertest(app)
          .patch(`/api/people/${personId}`)
          .expect(404, { error: { message: `Person doesn't exist` } })
      })
    })
  
    context(`Given there are people in the database`, () => {
        const testPeople = makePeopleArray()

        beforeEach('insert people', () => {
          return db
            .into('people')
            .insert(testPeople)
        })

      it('responds with 204 and updates the article', () => {
        const idToUpdate = 2
        const updatedPerson = {
            email: "profmoriarty@gmail.com",
            account: false,
            first_name: "James",
            last_name: "Moriarty",
            username: "profmori",
            password: "greatestPassword"
        }
        const expectedPerson = {
          ...testPeople[idToUpdate - 1],
          ...updatedPerson
        }
        return supertest(app)
          .patch(`/api/people/${idToUpdate}`)
          .send(updatedPerson)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/people/${idToUpdate}`)
              .expect(expectedPerson)
          )
      })

      it(`responds with 400 when no required fields supplied`,() => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/people/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: { message: `Request must contain either something to edit`}
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updatedPerson = {
          username: 'samplename',
          password: 'greatpassword'
        }
        const expectedPerson = {
          ...testPeople[idToUpdate - 1],
          ...updatedPerson
        }
        return supertest(app)
          .patch(`/api/people/${idToUpdate}`)
          .send({
            ...updatedPerson,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/people/${idToUpdate}`)
              .expect(expectedPerson)
          )
      })
    })
  })
  //end of big describe
})