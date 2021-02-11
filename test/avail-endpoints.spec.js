const knex = require('knex')
const app = require('../src/app')
const { makePeopleArray, makeSchedulesArray, makeTimeslotsArray, makeAvailArray } = require('./people.fixures')

describe('Avail Endpoints', function() {
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
  
    describe(`GET /api/avail`, () => {
      context(`Given no avail`, () => {
        it(`responds with 200 and an empty list`, () => {
          return supertest(app)
            .get('/api/avail')
            .expect(200, [])
        })
      })
  
      context('Given there are avail in the database', () => {
        const testPeople = makePeopleArray()
        const testSchedules = makeSchedulesArray()
        const testTimeslots = makeTimeslotsArray()
        const testAvail = makeAvailArray()
  
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
                        .into('avail')
                        .insert(testAvail)
                    })
                })
            })
        })
  
        it('responds with 200 and all of the avail', () => {
          return supertest(app)
            .get('/api/avail')
            .expect(200, testAvail)
        })
      })
  
    })
  
    describe(`GET /api/avail/:avail_id`, () => {
      context(`Given no avail`, () => {
        it(`responds with 404`, () => {
          const availId = 123456
          return supertest(app)
            .get(`/api/avail/${availId}`)
            .expect(404, { error: { message: `Avail entry doesn't exist` } })
        })
      })
  
      context('Given there are avail entries in the database', () => {
          const testPeople = makePeopleArray()
          const testSchedules = makeSchedulesArray()
          const testTimeslots = makeTimeslotsArray()
          const testAvail = makeAvailArray()
  
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
                            .into('avail')
                            .insert(testAvail)
                        })
                    })
              })
          })
  
        it('responds with 200 and the specified avail', () => {
          const availId = 2
          const expectedAvail = testAvail[availId - 1]
          return supertest(app)
            .get(`/api/avail/${availId}`)
            .expect(200, expectedAvail)
        })
      })
  
    })
  
    describe(`POST /api/avail`, () => {
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

      it(`creates a list of new avail, responding with 201 and the new avail`, function() {
        const newAvail = [
            {
                schedule_id: 2,
                timeslot: 4,
                people_id: 3,
                role_name: "Proctor"
            },
            {
                schedule_id: 2,
                timeslot: 5,
                people_id: 3,
                role_name: "Proctor"
            }
        ]
        
        return supertest(app)
          .post('/api/avail')
          .send(newAvail)
          .expect(201)
          .expect(res => {
            expect(res.body[0].schedule_id).to.eql(newAvail[0].schedule_id)
            expect(res.body[0].timeslot).to.eql(newAvail[0].timeslot)
            expect(res.body[0].people_id).to.eql(newAvail[0].people_id)
            expect(res.body[0].role_name).to.eql(newAvail[0].role_name)
            expect(res.body[1].schedule_id).to.eql(newAvail[1].schedule_id)
            expect(res.body[1].timeslot).to.eql(newAvail[1].timeslot)
            expect(res.body[1].people_id).to.eql(newAvail[1].people_id)
            expect(res.body[1].role_name).to.eql(newAvail[1].role_name)
            expect(res.body[0]).to.have.property('id')
            expect(res.body[1]).to.have.property('id')
          })
          .then(res =>
            supertest(app)
              .get(`/api/avail/${res.body[0].id}`)
              .expect(res.body[0])
          )
      })
  
      const requiredFields = ['schedule_id', 'timeslot', 'people_id','role_name']
  
      requiredFields.forEach(field => {
          const newAvail = {
            schedule_id: 2,
            timeslot: 4,
            people_id: 3,
            role_name: "Proctor"
          }
  
          it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newAvail[field]
  
          return supertest(app)
              .post('/api/avail')
              .send([newAvail])
              .expect(400, {
              error: { message: `Missing '${field}' in request body` }
              })
          })
      })
      
    })
  
    describe(`DELETE /avail/:avail_id`, () => {
      context(`Given no avail`, () => {
        it(`responds with 404`, () => {
          const availId = 123456
          return supertest(app)
            .delete(`/api/avail/${availId}`)
            .expect(404, { error: { message: `Avail entry doesn't exist` } })
        })
      })
  
      context('Given there are avail entries in the database', () => {
          const testPeople = makePeopleArray()
          const testSchedules = makeSchedulesArray()
          const testTimeslots = makeTimeslotsArray()
          const testAvail = makeAvailArray()
  
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
                        .into('avail')
                        .insert(testAvail)
                    })
                  })
              })
          })
  
            it('responds with 204 and removes the avail', () => {
            const idToRemove = 2
            const expectedAvail = testAvail.filter(avail => avail.id !== idToRemove)
            return supertest(app)
                .delete(`/api/avail/${idToRemove}`)
                .expect(204)
                .then(res =>
                supertest(app)
                    .get(`/api/avail`)
                    .expect(expectedAvail)
                )
            })
        })
    })
  
    describe(`PATCH /api/avail/:avail_id`, () => {
        context(`Given no avail`, () => {
            it(`responds with 404`, () => {
            const availId = 123456
            return supertest(app)
                .patch(`/api/avail/${availId}`)
                .expect(404, { error: { message: `Avail entry doesn't exist` } })
            })
        })
    
        context(`Given there are avail entries in the database`, () => {
            const testPeople = makePeopleArray()
            const testSchedules = makeSchedulesArray()
            const testTimeslots = makeTimeslotsArray()
            const testAvail = makeAvailArray()
    
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
                          .into('avail')
                          .insert(testAvail)
                      })
                    })
                })
            })
    
            it('responds with 204 and updates the avail', () => {
            const idToUpdate = 3
            const updatedAvail = {
                timeslot: 5,
                role_name: "Proctor"
            }
            const expectedAvail = {
                ...testAvail[idToUpdate - 1],
                ...updatedAvail
            }
            return supertest(app)
                .patch(`/api/avail/${idToUpdate}`)
                .send(updatedAvail)
                .expect(204)
                .then(res =>
                supertest(app)
                    .get(`/api/avail/${idToUpdate}`)
                    .expect(expectedAvail)
                )
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 3
                const updatedAvail = {
                    role_name: "Updated",
                }
                const expectedAvail = {
                  ...testAvail[idToUpdate - 1],
                  ...updatedAvail
                }
                return supertest(app)
                  .patch(`/api/avail/${idToUpdate}`)
                  .send({
                    ...updatedAvail,
                    fieldToIgnore: 'should not be in GET response'
                  })
                  .expect(204)
                  .then(res =>
                    supertest(app)
                      .get(`/api/avail/${idToUpdate}`)
                      .expect(expectedAvail)
                  )
            })
  
            it(`responds with 400 when no required fields supplied`,() => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/avail/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                error: { message: `Request body must contain something to edit`}
                })
            })

            it(`responds with 400 when schedule_id is in the body request`, () => {
                const idToUpdate = 3
                return supertest(app)
                .patch(`/api/avail/${idToUpdate}`)
                .send({ schedule_id: 20 })
                .expect(400, {
                error: { message: `Cannot update schedule_id`}
                })
            })

            it(`responds with 400 when people_id is in the body request`, () => {
                const idToUpdate = 3
                return supertest(app)
                .patch(`/api/avail/${idToUpdate}`)
                .send({ people_id: 20 })
                .expect(400, {
                error: { message: `Cannot update people_id`}
                })
            })
            
        })
    })

    describe(`GET /api/avail/schedule/:schedule_id`, () => {
        context(`Given the schedule has no avail or doesn't exist`, () => {
            it(`responds with 404`, () => {
              const scheduleId = 123456
              return supertest(app)
                .get(`/api/avail/schedule/${scheduleId}`)
                .expect(404, { error: { message: `Schedule doesn't have any avail or doesn't exist` } })
            })
        })
      
        context('Given the schedule has avail in the database', () => {
            const testPeople = makePeopleArray()
            const testSchedules = makeSchedulesArray()
            const testTimeslots = makeTimeslotsArray()
            const testAvail = makeAvailArray()
      
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
                              .into('avail')
                              .insert(testAvail)
                          })
                        })
                })
            })
      
            it(`responds with 200 and all the schedule's avail`, () => {
              const scheduleId = 2
              const expectedAvail = [ testAvail[0], testAvail[1], testAvail[4]]
              return supertest(app)
                .get(`/api/avail/schedule/${scheduleId}`)
                .expect(200, expectedAvail)
            })
        })
    })

    describe(`DELETE /avail//delete/:peopleId/:schedId`, () => {
        context(`Given no avail`, () => {
          it(`responds with 404`, () => {
            const peopleId = 123456
            const scheduleId = 123456
            return supertest(app)
              .delete(`/api/avail/delete/${peopleId}/${scheduleId}`)
              .expect(204, {})
          })
        })
    
        context('Given there are avail entries in the database', () => {
            const testPeople = makePeopleArray()
            const testSchedules = makeSchedulesArray()
            const testTimeslots = makeTimeslotsArray()
            const testAvail = makeAvailArray()
    
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
                          .into('avail')
                          .insert(testAvail)
                      })
                    })
                })
            })
    
            it('responds with 204 and removes the avail', () => {
                const peopleId = 1
                const scheduleId = 2
                const expectedAvail = [
                    {
                        id: 2,
                        schedule_id: 2,
                        timeslot: 4,
                        people_id: 2,
                        role_name: "Participant"
                    },
                    {
                        id: 3,
                        schedule_id: 3,
                        timeslot: 5,
                        people_id: 1,
                        role_name: "Manager"
                    },
                    {
                        id: 4,
                        schedule_id: 3,
                        timeslot: 5,
                        people_id: 2,
                        role_name: "Employee"
                    },
                ]
                return supertest(app)
                    .delete(`/api/avail/delete/${peopleId}/${scheduleId}`)
                    .expect(204)
                    .then(res =>
                    supertest(app)
                        .get(`/api/avail`)
                        .expect(expectedAvail)
                    )
            })
        })
    })

    //end of big describe
  })