const knex = require('knex')
const app = require('../src/app')
const { makePeopleArray, makeSchedulesArray, makeRolesArray } = require('./people.fixures')

describe('Roles Endpoints', function() {
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
  
    describe(`GET /api/roles`, () => {
      context(`Given no roles`, () => {
        it(`responds with 200 and an empty list`, () => {
          return supertest(app)
            .get('/api/roles')
            .expect(200, [])
        })
      })
  
      context('Given there are roles in the database', () => {
        const testPeople = makePeopleArray()
        const testSchedules = makeSchedulesArray()
        const testRoles = makeRolesArray()
  
        beforeEach('insert roles', () => {
          return db
            .into('people')
            .insert(testPeople)
            .then(() => {
                return db
                  .into('schedules')
                  .insert(testSchedules)
                .then(() => {
                    return db
                    .into('roles')
                    .insert(testRoles)
                })
            })
        })
  
        it('responds with 200 and all of the roles', () => {
          return supertest(app)
            .get('/api/roles')
            .expect(200, testRoles)
        })
      })
  
    })
  
    describe(`GET /api/roles/:role_id`, () => {
      context(`Given no roles`, () => {
        it(`responds with 404`, () => {
          const roleId = 123456
          return supertest(app)
            .get(`/api/roles/${roleId}`)
            .expect(404, { error: { message: `Role doesn't exist` } })
        })
      })
  
      context('Given there are roles in the database', () => {
          const testPeople = makePeopleArray()
          const testSchedules = makeSchedulesArray()
          const testRoles = makeRolesArray()
  
          beforeEach('insert roles', () => {
            return db
              .into('people')
              .insert(testPeople)
              .then(() => {
                return db
                    .into('schedules')
                    .insert(testSchedules)
                    .then(() => {
                        return db
                        .into('roles')
                        .insert(testRoles)
                    })
              })
          })
  
        it('responds with 200 and the specified role', () => {
          const roleId = 2
          const expectedRole = testRoles[roleId - 1]
          return supertest(app)
            .get(`/api/roles/${roleId}`)
            .expect(200, expectedRole)
        })
      })
  
    })
  
    describe(`POST /api/roles`, () => {
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

      it(`creates a list of new roles, responding with 201 and the new role(s)`, function() {
        const newRole = [
          {
            schedule_id: 3,
            role_name: "New Role"
          },
          {
            schedule_id: 3,
            role_name: "Second New Role"
          }
        ]
        
        return supertest(app)
          .post('/api/roles')
          .send(newRole)
          .expect(201)
          .expect(res => {
            expect(res.body[0].schedule_id).to.eql(newRole[0].schedule_id)
            expect(res.body[0].role_name).to.eql(newRole[0].role_name)
            expect(res.body[1].schedule_id).to.eql(newRole[1].schedule_id)
            expect(res.body[1].role_name).to.eql(newRole[1].role_name)
            expect(res.body[0]).to.have.property('id')
          })
          .then(res =>
            supertest(app)
              .get(`/api/roles/${res.body[0].id}`)
              .expect(res.body[0])
          )
      })
  
      const requiredFields = ['schedule_id', 'role_name']
  
      requiredFields.forEach(field => {
          const newRole = {
            schedule_id: 3,
            role_name: "New"
          }
  
          it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newRole[field]
  
          return supertest(app)
              .post('/api/roles')
              .send([newRole])
              .expect(400, {
              error: { message: `Missing '${field}' in request body` }
              })
          })
      })
      
    })
  
    describe(`DELETE /schedule/:schedule_id`, () => {
      context(`Given no roles`, () => {
        it(`responds with 404`, () => {
          const roleId = 123456
          return supertest(app)
            .delete(`/api/roles/${roleId}`)
            .expect(404, { error: { message: `Role doesn't exist` } })
        })
      })
  
      context('Given there are schedules in the database', () => {
          const testPeople = makePeopleArray()
          const testSchedules = makeSchedulesArray()
          const testRoles = makeRolesArray()
  
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
                    .into('roles')
                    .insert(testRoles)
                  })
              })
          })
  
            it('responds with 204 and removes the role', () => {
            const idToRemove = 2
            const expectedRole = testRoles.filter(role => role.id !== idToRemove)
            return supertest(app)
                .delete(`/api/roles/${idToRemove}`)
                .expect(204)
                .then(res =>
                supertest(app)
                    .get(`/api/roles`)
                    .expect(expectedRole)
                )
            })
        })
    })
  
    describe(`PATCH /api/roles/:role_id`, () => {
        context(`Given no roles`, () => {
            it(`responds with 404`, () => {
            const roleId = 123456
            return supertest(app)
                .patch(`/api/roles/${roleId}`)
                .expect(404, { error: { message: `Role doesn't exist` } })
            })
        })
    
        context(`Given there are roles in the database`, () => {
            const testPeople = makePeopleArray()
            const testSchedules = makeSchedulesArray()
            const testRoles = makeRolesArray()
    
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
                      .into('roles')
                      .insert(testRoles)
                    })
                })
            })
    
            it('responds with 204 and updates the role', () => {
            const idToUpdate = 3
            const updatedRole = {
              role_name: "Updated"
            }
            const expectedRole = {
                ...testRoles[idToUpdate - 1],
                ...updatedRole
            }
            return supertest(app)
                .patch(`/api/roles/${idToUpdate}`)
                .send(updatedRole)
                .expect(204)
                .then(res =>
                supertest(app)
                    .get(`/api/roles/${idToUpdate}`)
                    .expect(expectedRole)
                )
        })
  
        it(`responds with 400 when no required fields supplied`,() => {
          const idToUpdate = 2
          return supertest(app)
            .patch(`/api/roles/${idToUpdate}`)
            .send({ irrelevantField: 'foo' })
            .expect(400, {
              error: { message: `Request body must contain something to edit`}
            })
        })

        it(`responds with 400 when schedule_id is in the body request`, () => {
            const idToUpdate = 3
            return supertest(app)
            .patch(`/api/roles/${idToUpdate}`)
            .send({ schedule_id: 20 })
            .expect(400, {
              error: { message: `Cannot update schedule_id`}
            })
        })
            
      })
    })

    describe(`GET /api/roles/schedule/:schedule_id`, () => {
        context(`Given the schedule has no roles or doesn't exist`, () => {
            it(`responds with 404`, () => {
              const scheduleId = 123456
              return supertest(app)
                .get(`/api/roles/schedule/${scheduleId}`)
                .expect(404, { error: { message: `Schedule doesn't have any roles or doesn't exist` } })
            })
        })
      
        context('Given the schedule has roles in the database', () => {
            const testPeople = makePeopleArray()
            const testSchedules = makeSchedulesArray()
            const testRoles = makeRolesArray()
      
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
                          .into('roles')
                          .insert(testRoles)
                        })
                })
            })
      
            it(`responds with 200 and all the schedule's roles`, () => {
              const scheduleId = 2
              const expectedRoles = [ testRoles[1], testRoles[2] ]
              return supertest(app)
                .get(`/api/roles/schedule/${scheduleId}`)
                .expect(200, expectedRoles)
            })
        })
    })

    //end of big describe
  })