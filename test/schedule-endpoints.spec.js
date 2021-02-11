const knex = require('knex')
const app = require('../src/app')
const { makePeopleArray, makeSchedulesArray } = require('./people.fixures')

describe('Schedules Endpoints', function() {
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
  
    describe(`GET /api/schedules`, () => {
      context(`Given no schedules`, () => {
        it(`responds with 200 and an empty list`, () => {
          return supertest(app)
            .get('/api/schedules')
            .expect(200, [])
        })
      })
  
      context('Given there are schedules in the database', () => {
        const testPeople = makePeopleArray()
        const testSchedules = makeSchedulesArray()
  
        beforeEach('insert people', () => {
          return db
            .into('people')
            .insert(testPeople)
            .then(()=> {
                return db
                  .into('schedules')
                  .insert(testSchedules)
            })
        })
  
        it('responds with 200 and all of the schedules', () => {
          return supertest(app)
            .get('/api/schedules')
            .expect(200, testSchedules)
        })
      })
  
    })
  
    describe(`GET /api/schedules/:schedule_id`, () => {
      context(`Given no schedules`, () => {
        it(`responds with 404`, () => {
          const scheduleId = 123456
          return supertest(app)
            .get(`/api/schedules/${scheduleId}`)
            .expect(404, { error: { message: `Schedule doesn't exist` } })
        })
      })
  
      context('Given there are schedules in the database', () => {
          const testPeople = makePeopleArray()
          const testSchedules = makeSchedulesArray()
  
          beforeEach('insert people', () => {
            return db
              .into('people')
              .insert(testPeople)
              .then(() => {
                return db
                    .into('schedules')
                    .insert(testSchedules)
              })
          })
  
        it('responds with 200 and the specified schedule', () => {
          const scheduleId = 2
          const expectedSchedule = testSchedules[scheduleId - 1]
          return supertest(app)
            .get(`/api/schedules/${scheduleId}`)
            .expect(200, expectedSchedule)
        })
      })
  
    })
  
    describe(`POST /api/schedules`, () => {
      const testPeople = makePeopleArray()

      beforeEach('insert people', () => {
        return db
          .into('people')
          .insert(testPeople)
      })

      it(`creates a new schedule, responding with 201 and the new schedule`, function() {
        const newSchedule= {
            people_id: 2,
            schedule_name: "Sherlock's Second Schedule",
            status: "open",
            responses: 0,
            start_date: "Dec 9, 2021",
            end_date: "Dec 10, 2021",
            meeting_duration: "30 minutes"
        }
        return supertest(app)
          .post('/api/schedules')
          .send(newSchedule)
          .expect(201)
          .expect(res => {
            expect(res.body.people_id).to.eql(newSchedule.people_id)
            expect(res.body.schedule_name).to.eql(newSchedule.schedule_name)
            expect(res.body.status).to.eql(newSchedule.status)
            expect(res.body.responses).to.eql(newSchedule.responses)
            expect(res.body.start_date).to.eql(newSchedule.start_date)
            expect(res.body.end_date).to.eql(newSchedule.end_date)
            expect(res.body.meeting_duration).to.eql(newSchedule.meeting_duration)
            expect(res.body).to.have.property('id')
            expect(res.headers.location).to.eql(`/api/schedules/${res.body.id}`)
          })
          .then(res =>
            supertest(app)
              .get(`/api/schedules/${res.body.id}`)
              .expect(res.body)
          )
      })
  
      const requiredFields = ['people_id', 'schedule_name', 'responses', 'start_date', 'end_date', 'meeting_duration']
  
      requiredFields.forEach(field => {
          const newSchedule = {
            people_id: 2,
            schedule_name: "Sherlock's Second Schedule",
            status: "open",
            responses: 0,
            start_date: "Dec 9, 2021",
            end_date: "Dec 10, 2021",
            meeting_duration: "30 minutes"
          }
  
          it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newSchedule[field]
  
          return supertest(app)
              .post('/api/schedules')
              .send(newSchedule)
              .expect(400, {
              error: { message: `Missing '${field}' in request body` }
              })
          })
      })
      
    })
  
    describe(`DELETE /schedule/:schedule_id`, () => {
      context(`Given no schedules`, () => {
        it(`responds with 404`, () => {
          const scheduleId = 123456
          return supertest(app)
            .delete(`/api/schedules/${scheduleId}`)
            .expect(404, { error: { message: `Schedule doesn't exist` } })
        })
      })
  
      context('Given there are schedules in the database', () => {
          const testPeople = makePeopleArray()
          const testSchedules = makeSchedulesArray()
  
          beforeEach('insert people', () => {
            return db
              .into('people')
              .insert(testPeople)
              .then(() =>{
                  return db
                  .into('schedules')
                  .insert(testSchedules)
              })
          })
  
            it('responds with 204 and removes the schedule', () => {
            const idToRemove = 2
            const expectedSchedule = testSchedules.filter(schedule => schedule.id !== idToRemove)
            return supertest(app)
                .delete(`/api/schedules/${idToRemove}`)
                .expect(204)
                .then(res =>
                supertest(app)
                    .get(`/api/schedules`)
                    .expect(expectedSchedule)
                )
            })
        })
    })
  
    describe(`PATCH /api/schedules/:schedule_id`, () => {
        context(`Given no schedules`, () => {
            it(`responds with 404`, () => {
            const scheduleId = 123456
            return supertest(app)
                .patch(`/api/schedules/${scheduleId}`)
                .expect(404, { error: { message: `Schedule doesn't exist` } })
            })
        })
    
        context(`Given there are Schedules in the database`, () => {
            const testPeople = makePeopleArray()
            const testSchedules = makeSchedulesArray()
    
            beforeEach('insert people', () => {
                return db
                .into('people')
                .insert(testPeople)
                .then(() => {
                    return db
                    .into('schedules')
                    .insert(testSchedules)
                })
            })
    
            it('responds with 204 and updates the schedule', () => {
            const idToUpdate = 3
            const updatedSchedule = {
                schedule_name: "Sherlock's Updated Schedule",
                status: "open",
                responses: 1,
                start_date: "Dec 20, 2021",
                end_date: "Dec 25, 2021",
                meeting_duration: "15 minutes"
            }
            const expectedSchedule = {
                ...testSchedules[idToUpdate - 1],
                ...updatedSchedule
            }
            return supertest(app)
                .patch(`/api/schedules/${idToUpdate}`)
                .send(updatedSchedule)
                .expect(204)
                .then(res =>
                supertest(app)
                    .get(`/api/schedules/${idToUpdate}`)
                    .expect(expectedSchedule)
                )
        })
  
        it(`responds with 400 when no required fields supplied`,() => {
          const idToUpdate = 2
          return supertest(app)
            .patch(`/api/schedules/${idToUpdate}`)
            .send({ irrelevantField: 'foo' })
            .expect(400, {
              error: { message: `Request body must contain something to edit`}
            })
        })
  
        it(`responds with 204 when updating only a subset of fields`, () => {
          const idToUpdate = 3
          const updatedSchedule = {
            responses: 1,
            schedule_name: "Sherlock's Updated Schedule"
          }
          const expectedSchedule = {
            ...testSchedules[idToUpdate - 1],
            ...updatedSchedule
          }
          return supertest(app)
            .patch(`/api/schedules/${idToUpdate}`)
            .send({
              ...updatedSchedule,
              fieldToIgnore: 'should not be in GET response'
            })
            .expect(204)
            .then(res =>
              supertest(app)
                .get(`/api/schedules/${idToUpdate}`)
                .expect(expectedSchedule)
            )
        })

        it(`responds with 400 when people_id is in the body request`, () => {
            const idToUpdate = 3
            return supertest(app)
            .patch(`/api/schedules/${idToUpdate}`)
            .send({ people_id: 20 })
            .expect(400, {
              error: { message: `Cannot update people_id`}
            })
        })
            
      })
    })

    describe(`GET /api/schedules/user/:user_id`, () => {
        context(`Given the user has no schedules`, () => {
            it(`responds with 404`, () => {
              const userId = 123456
              return supertest(app)
                .get(`/api/schedules/user/${userId}`)
                .expect(404, { error: { message: `User doesn't have any schedules` } })
            })
        })
      
        context('Given the user has schedules in the database', () => {
            const testPeople = makePeopleArray()
            const testSchedules = makeSchedulesArray()
      
            beforeEach('insert people', () => {
                return db
                  .into('people')
                  .insert(testPeople)
                  .then(() => {
                    return db
                        .into('schedules')
                        .insert(testSchedules)
                })
            })
      
            it(`responds with 200 and all the user's schedules`, () => {
              const userId = 1
              const expectedSchedules = [ testSchedules[0], testSchedules[1] ]
              return supertest(app)
                .get(`/api/schedules/user/${userId}`)
                .expect(200, expectedSchedules)
            })
        })
    })

    //end of big describe
  })