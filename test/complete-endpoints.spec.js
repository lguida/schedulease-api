const knex = require('knex')
const app = require('../src/app')
const { makePeopleArray, makeSchedulesArray, makeTimeslotsArray, makeCompleteArray } = require('./people.fixures')

describe('Complete Endpoints', function() {
    let db
  
    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
      })
      app.set('db', db)
    })
  
    after('disconnect from db', () => db.destroy())
  
    before('clean the table', () => db.raw('TRUNCATE complete, avail, timeslots, roles, schedules, people RESTART IDENTITY CASCADE'))
  
    afterEach('cleanup',() => db.raw('TRUNCATE complete, avail, timeslots, roles, schedules, people RESTART IDENTITY CASCADE'))
  
    describe(`GET /api/complete`, () => {
      context(`Given no complete entries`, () => {
        it(`responds with 200 and an empty list`, () => {
          return supertest(app)
            .get('/api/complete')
            .expect(200, [])
        })
      })
  
      context('Given there are avail in the database', () => {
        const testPeople = makePeopleArray()
        const testSchedules = makeSchedulesArray()
        const testTimeslots = makeTimeslotsArray()
        const testComplete = makeCompleteArray()
  
        beforeEach('insert tables', () => {
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
                    .then(() => {
                        return db
                        .into('complete')
                        .insert(testComplete)
                    })
                })
            })
        })
  
        it('responds with 200 and all of the complete', () => {
          return supertest(app)
            .get('/api/complete')
            .expect(200, testComplete)
        })
      })
  
    })
  
    describe(`GET /api/complete/:complete_id`, () => {
      context(`Given no complete schedules`, () => {
        it(`responds with 404`, () => {
          const completeId = 123456
          return supertest(app)
            .get(`/api/complete/${completeId}`)
            .expect(404, { error: { message: `Complete schedule doesn't exist` } })
        })
      })
  
      context('Given there are complete entries in the database', () => {
          const testPeople = makePeopleArray()
          const testSchedules = makeSchedulesArray()
          const testTimeslots = makeTimeslotsArray()
          const testComplete = makeCompleteArray()
  
          beforeEach('insert tables', () => {
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
                        .then(() => {
                            return db
                            .into('complete')
                            .insert(testComplete)
                        })
                    })
              })
          })
  
        it('responds with 200 and the specified complete entry', () => {
          const completeId = 2
          const expectedComplete = testComplete[completeId - 1]
          return supertest(app)
            .get(`/api/complete/${completeId}`)
            .expect(200, expectedComplete)
        })
      })
  
    })
  
    describe(`POST /api/complete`, () => {
      const testPeople = makePeopleArray()
      const testSchedules = makeSchedulesArray()
      const testTimeslots = makeTimeslotsArray()

      beforeEach('insert tables', () => {
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

      it(`creates a list of new complete, responding with 201 and the new complete`, function() {
        const newComplete = [
            {
                schedule_id: 3,
                timeslot: 5,
                people_name: "Sherlock",
                role_name: "Proctor"
            },
            {
                schedule_id: 3,
                timeslot: 5,
                people_name: "Mycroft",
                role_name: "Participant"
            }
        ]
        
        return supertest(app)
          .post('/api/complete')
          .send(newComplete)
          .expect(201)
          .expect(res => {
            expect(res.body[0].schedule_id).to.eql(newComplete[0].schedule_id)
            expect(res.body[0].timeslot).to.eql(newComplete[0].timeslot)
            expect(res.body[0].people_name).to.eql(newComplete[0].people_name)
            expect(res.body[0].role_name).to.eql(newComplete[0].role_name)
            expect(res.body[1].schedule_id).to.eql(newComplete[1].schedule_id)
            expect(res.body[1].timeslot).to.eql(newComplete[1].timeslot)
            expect(res.body[1].people_name).to.eql(newComplete[1].people_name)
            expect(res.body[1].role_name).to.eql(newComplete[1].role_name)
            expect(res.body[0]).to.have.property('id')
            expect(res.body[1]).to.have.property('id')
          })
          .then(res =>
            supertest(app)
              .get(`/api/complete/${res.body[0].id}`)
              .expect(res.body[0])
          )
      })
  
      const requiredFields = ['schedule_id', 'timeslot', 'people_name','role_name']
  
      requiredFields.forEach(field => {
          const newComplete = {
            schedule_id: 3,
            timeslot: 5,
            people_name: "Sherlock",
            role_name: "Proctor"
            }
  
          it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newComplete[field]
  
          return supertest(app)
              .post('/api/complete')
              .send([newComplete])
              .expect(400, {
              error: { message: `Missing '${field}' in request body` }
              })
          })
      })
      
    })
  
    describe(`DELETE /complete/:complete_id`, () => {
      context(`Given no complete`, () => {
        it(`responds with 404`, () => {
          const completeId = 123456
          return supertest(app)
            .delete(`/api/complete/${completeId}`)
            .expect(404, { error: { message: `Complete schedule doesn't exist` } })
        })
      })
  
      context('Given there are complete entries in the database', () => {
          const testPeople = makePeopleArray()
          const testSchedules = makeSchedulesArray()
          const testTimeslots = makeTimeslotsArray()
          const testComplete = makeCompleteArray()
  
          beforeEach('insert table', () => {
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
                    .then(() => {
                        return db
                        .into('complete')
                        .insert(testComplete)
                    })
                  })
              })
          })
  
            it('responds with 204 and removes the complete', () => {
            const idToRemove = 2
            const expectedComplete = testComplete.filter(comp => comp.id !== idToRemove)
            return supertest(app)
                .delete(`/api/complete/${idToRemove}`)
                .expect(204)
                .then(res =>
                supertest(app)
                    .get(`/api/complete`)
                    .expect(expectedComplete)
                )
            })
        })
    })
  
    describe(`PATCH /api/complete/:complete_id`, () => {
        context(`Given no complete`, () => {
            it(`responds with 404`, () => {
            const completeId = 123456
            return supertest(app)
                .patch(`/api/complete/${completeId}`)
                .expect(404, { error: { message: `Complete schedule doesn't exist` } })
            })
        })
    
        context(`Given there are complete entries in the database`, () => {
            const testPeople = makePeopleArray()
            const testSchedules = makeSchedulesArray()
            const testTimeslots = makeTimeslotsArray()
            const testComplete = makeCompleteArray()
    
            beforeEach('insert tables', () => {
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
                      .then(() => {
                          return db
                          .into('complete')
                          .insert(testComplete)
                      })
                    })
                })
            })
    
            it('responds with 204 and updates the complete entry', () => {
            const idToUpdate = 3
            const updatedComplete = {
                timeslot: 4,
                people_name: "New Person",
                role_name: "New Role"
            }
            const expectedComplete = {
                ...testComplete[idToUpdate - 1],
                ...updatedComplete
            }
            return supertest(app)
                .patch(`/api/complete/${idToUpdate}`)
                .send(updatedComplete)
                .expect(204)
                .then(res =>
                supertest(app)
                    .get(`/api/complete/${idToUpdate}`)
                    .expect(expectedComplete)
                )
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 3
                const updatedComplete = {
                    role_name: "Updated",
                }
                const expectedComplete = {
                  ...testComplete[idToUpdate - 1],
                  ...updatedComplete
                }
                return supertest(app)
                  .patch(`/api/complete/${idToUpdate}`)
                  .send({
                    ...updatedComplete,
                    fieldToIgnore: 'should not be in GET response'
                  })
                  .expect(204)
                  .then(res =>
                    supertest(app)
                      .get(`/api/complete/${idToUpdate}`)
                      .expect(expectedComplete)
                  )
            })
  
            it(`responds with 400 when no required fields supplied`,() => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/complete/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                error: { message: `Request body must contain something to edit`}
                })
            })

            it(`responds with 400 when schedule_id is in the body request`, () => {
                const idToUpdate = 3
                return supertest(app)
                .patch(`/api/complete/${idToUpdate}`)
                .send({ schedule_id: 20 })
                .expect(400, {
                error: { message: `Cannot update schedule_id`}
                })
            })
            
        })
    })

    describe(`GET /api/complete/schedule/:schedule_id`, () => {
        context(`Given the schedule has no complete entries or doesn't exist`, () => {
            it(`responds with 404`, () => {
              const scheduleId = 123456
              return supertest(app)
                .get(`/api/complete/schedule/${scheduleId}`)
                .expect(404, { error: { message: `Schedule doesn't have a complete schedules or doesn't exist` } })
            })
        })
      
        context('Given the schedule has complete in the database', () => {
            const testPeople = makePeopleArray()
            const testSchedules = makeSchedulesArray()
            const testTimeslots = makeTimeslotsArray()
            const testComplete = makeCompleteArray()
      
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
                          .then(() => {
                              return db
                              .into('complete')
                              .insert(testComplete)
                          })
                        })
                })
            })
      
            it(`responds with 200 and all the schedule's complete entries`, () => {
              const completeId = 2
              const expectedComplete = [ testComplete[0], testComplete[1]]
              return supertest(app)
                .get(`/api/complete/schedule/${completeId}`)
                .expect(200, expectedComplete)
            })
        })
    })


    //end of big describe
  })