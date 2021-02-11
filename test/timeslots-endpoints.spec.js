const knex = require('knex')
const app = require('../src/app')
const { makePeopleArray, makeSchedulesArray, makeTimeslotsArray } = require('./people.fixures')

describe('Timeslots Endpoints', function() {
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
  
    describe(`GET /api/timeslots`, () => {
      context(`Given no timeslots`, () => {
        it(`responds with 200 and an empty list`, () => {
          return supertest(app)
            .get('/api/timeslots')
            .expect(200, [])
        })
      })
  
      context('Given there are roles in the database', () => {
        const testPeople = makePeopleArray()
        const testSchedules = makeSchedulesArray()
        const testTimeslots = makeTimeslotsArray()
  
        beforeEach('insert timeslots', () => {
          return db
            .into('people')
            .insert(testPeople)
            .then(() => {
                return db
                  .into('schedules')
                  .insert(testSchedules)
                .then(() => {
                    return db
                    .into('timeslots')
                    .insert(testTimeslots)
                })
            })
        })
  
        it('responds with 200 and all of the roles', () => {
          return supertest(app)
            .get('/api/timeslots')
            .expect(200, testTimeslots)
        })
      })
  
    })
  
    describe(`GET /api/timeslots/:ts_id`, () => {
      context(`Given no timeslots`, () => {
        it(`responds with 404`, () => {
          const timeslotId = 123456
          return supertest(app)
            .get(`/api/timeslots/${timeslotId}`)
            .expect(404, { error: { message: `Timeslot doesn't exist` } })
        })
      })
  
      context('Given there are timeslots in the database', () => {
          const testPeople = makePeopleArray()
          const testSchedules = makeSchedulesArray()
          const testTimeslots = makeTimeslotsArray()
  
          beforeEach('insert timeslots', () => {
            return db
              .into('people')
              .insert(testPeople)
              .then(() => {
                return db
                    .into('schedules')
                    .insert(testSchedules)
                    .then(() => {
                        return db
                        .into('timeslots')
                        .insert(testTimeslots)
                    })
              })
          })
  
        it('responds with 200 and the specified timeslots', () => {
          const timeslotId = 2
          const expectedTimeslot = testTimeslots[timeslotId - 1]
          return supertest(app)
            .get(`/api/timeslots/${timeslotId}`)
            .expect(200, expectedTimeslot)
        })
      })
  
    })
  
    describe(`POST /api/timeslots`, () => {
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

      it(`creates a list of new timeslots, responding with 201 and the new timeslot(s)`, function() {
        const newTimeslots = [
            {
                schedule_id: 2,
                timeslot: "2:00PM",
                day_name: "Monday, Dec 28"
            },
            {
                schedule_id: 2,
                timeslot: "2:00PM",
                day_name: "Tuesday, Dec 29"
            }
        ]
        
        return supertest(app)
          .post('/api/timeslots')
          .send(newTimeslots)
          .expect(201)
          .expect(res => {
            expect(res.body[0].schedule_id).to.eql(newTimeslots[0].schedule_id)
            expect(res.body[0].timeslot).to.eql(newTimeslots[0].timeslot)
            expect(res.body[0].day_name).to.eql(newTimeslots[0].day_name)
            expect(res.body[1].schedule_id).to.eql(newTimeslots[1].schedule_id)
            expect(res.body[1].timeslot).to.eql(newTimeslots[1].timeslot)
            expect(res.body[1].day_name).to.eql(newTimeslots[1].day_name)
            expect(res.body[0]).to.have.property('id')
            expect(res.body[1]).to.have.property('id')
          })
          .then(res =>
            supertest(app)
              .get(`/api/timeslots/${res.body[0].id}`)
              .expect(res.body[0])
          )
      })
  
      const requiredFields = ['schedule_id', 'timeslot', 'day_name']
  
      requiredFields.forEach(field => {
          const newTimeslot = {
            schedule_id: 3,
            timeslot: "2:00PM",
            day_name: "Tuesday, Dec 29"
          }
  
          it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newTimeslot[field]
  
          return supertest(app)
              .post('/api/timeslots')
              .send([newTimeslot])
              .expect(400, {
              error: { message: `Missing '${field}' in request body` }
              })
          })
      })
      
    })
  
    describe(`DELETE /timeslots/:timeslot_id`, () => {
      context(`Given no timeslots`, () => {
        it(`responds with 404`, () => {
          const timeslotId = 123456
          return supertest(app)
            .delete(`/api/timeslots/${timeslotId}`)
            .expect(404, { error: { message: `Timeslot doesn't exist` } })
        })
      })
  
      context('Given there are timeslots in the database', () => {
          const testPeople = makePeopleArray()
          const testSchedules = makeSchedulesArray()
          const testTimeslots = makeTimeslotsArray()
  
          beforeEach('insert people', () => {
            return db
              .into('people')
              .insert(testPeople)
              .then(() =>{
                  return db
                  .into('schedules')
                  .insert(testSchedules)
                  .then(() => {
                    return db
                    .into('timeslots')
                    .insert(testTimeslots)
                  })
              })
          })
  
            it('responds with 204 and removes the role', () => {
            const idToRemove = 2
            const expectedTimeslot = testTimeslots.filter(ts => ts.id !== idToRemove)
            return supertest(app)
                .delete(`/api/timeslots/${idToRemove}`)
                .expect(204)
                .then(res =>
                supertest(app)
                    .get(`/api/timeslots`)
                    .expect(expectedTimeslot)
                )
            })
        })
    })
  
    describe(`PATCH /api/timeslots/:timeslot_id`, () => {
        context(`Given no timeslots`, () => {
            it(`responds with 404`, () => {
            const timeslotId = 123456
            return supertest(app)
                .patch(`/api/timeslots/${timeslotId}`)
                .expect(404, { error: { message: `Timeslot doesn't exist` } })
            })
        })
    
        context(`Given there are roles in the database`, () => {
            const testPeople = makePeopleArray()
            const testSchedules = makeSchedulesArray()
            const testTimeslots = makeTimeslotsArray()
    
            beforeEach('insert people', () => {
                return db
                .into('people')
                .insert(testPeople)
                .then(() => {
                    return db
                    .into('schedules')
                    .insert(testSchedules)
                    .then(() => {
                      return db
                      .into('timeslots')
                      .insert(testTimeslots)
                    })
                })
            })
    
            it('responds with 204 and updates the timeslot', () => {
            const idToUpdate = 3
            const updatedTimeslot = {
                timeslot: "7:00PM",
                day_name: "Friday, Dec 25"
            }
            const expectedTimeslot = {
                ...testTimeslots[idToUpdate - 1],
                ...updatedTimeslot
            }
            return supertest(app)
                .patch(`/api/timeslots/${idToUpdate}`)
                .send(updatedTimeslot)
                .expect(204)
                .then(res =>
                supertest(app)
                    .get(`/api/timeslots/${idToUpdate}`)
                    .expect(expectedTimeslot)
                )
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 3
                const updatedTimeslot = {
                    timeslot: "7:00PM",
                }
                const expectedTimeslot = {
                  ...testTimeslots[idToUpdate - 1],
                  ...updatedTimeslot
                }
                return supertest(app)
                  .patch(`/api/timeslots/${idToUpdate}`)
                  .send({
                    ...updatedTimeslot,
                    fieldToIgnore: 'should not be in GET response'
                  })
                  .expect(204)
                  .then(res =>
                    supertest(app)
                      .get(`/api/timeslots/${idToUpdate}`)
                      .expect(expectedTimeslot)
                  )
            })
  
            it(`responds with 400 when no required fields supplied`,() => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/timeslots/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                error: { message: `Request body must contain something to edit`}
                })
            })

            it(`responds with 400 when schedule_id is in the body request`, () => {
                const idToUpdate = 3
                return supertest(app)
                .patch(`/api/timeslots/${idToUpdate}`)
                .send({ schedule_id: 20 })
                .expect(400, {
                error: { message: `Cannot update schedule_id`}
                })
            })
            
        })
    })

    describe(`GET /api/timeslots/schedule/:schedule_id`, () => {
        context(`Given the schedule has no timeslots or doesn't exist`, () => {
            it(`responds with 404`, () => {
              const scheduleId = 123456
              return supertest(app)
                .get(`/api/timeslots/schedule/${scheduleId}`)
                .expect(404, { error: { message: `Schedule doesn't have any timeslots or doesn't exist` } })
            })
        })
      
        context('Given the schedule has roles in the database', () => {
            const testPeople = makePeopleArray()
            const testSchedules = makeSchedulesArray()
            const testTimeslots = makeTimeslotsArray()
      
            beforeEach('insert people', () => {
                return db
                  .into('people')
                  .insert(testPeople)
                  .then(() => {
                    return db
                        .into('schedules')
                        .insert(testSchedules)
                        .then(() => {
                          return db 
                          .into('timeslots')
                          .insert(testTimeslots)
                        })
                })
            })
      
            it(`responds with 200 and all the schedule's timeslots`, () => {
              const scheduleId = 1
              const expectedTimeslots = [ testTimeslots[0], testTimeslots[1], testTimeslots[2] ]
              return supertest(app)
                .get(`/api/timeslots/schedule/${scheduleId}`)
                .expect(200, expectedTimeslots)
            })
        })
    })

    //end of big describe
  })