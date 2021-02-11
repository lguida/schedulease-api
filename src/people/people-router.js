const express = require('express')
const path = require('path')
const xss = require('xss')
const PeopleService = require('./people-service')

const peopleRouter = express.Router()
const jsonParser = express.json()

const serializePerson = person => ({
  id: person.id,
  email: person.email,
  account: person.account,
  first_name: xss(person.first_name),
  last_name: xss(person.last_name),
  username: person.username,
  password: person.password
}) //add more validtaion here for email, username and password


peopleRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    PeopleService.getAllPeople(knexInstance)
      .then(people => {
        res.json(people.map(serializePerson))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { email, account, first_name, last_name, username, password } = req.body
    const newPerson = { email, account, first_name, last_name }

    for (const [key, value] of Object.entries(newPerson))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
    newPerson.username = username
    newPerson.password = password
    PeopleService.insertPerson(
      req.app.get('db'),
      newPerson
    )
      .then(person => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${person.id}`))
          .json(serializePerson(person))
      })
      .catch(next)
  })

peopleRouter
  .route('/auth/:username/:password')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    PeopleService.getByUsernamePassword(
      knexInstance,
      req.params.username, req.params.password)
      .then(person => {
        if (person.length === 0) {
          return res.status(404).json({
            error: { message: `Person doesn't exist` }
          })
        }
        res.json(person)
      })
      .catch(next)
  })
  
peopleRouter
  .route('/id/:person_id')
  .all((req, res, next) => {
    PeopleService.getById(
      req.app.get('db'),
      req.params.person_id
    )
      .then(person => {
        if (!person) {
          return res.status(404).json({
            error: { message: `Person doesn't exist` }
          })
        }
        res.person = person
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializePerson(res.person))
  })
  .delete((req, res, next) => {
    PeopleService.deletePerson(
      req.app.get('db'),
      req.params.person_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { email, account, first_name, last_name, username, password } = req.body
    const personToUpdate = { email, account, first_name, last_name, username, password }


    const numberOfValues = Object.values(personToUpdate).filter(Boolean).length
    if (numberOfValues === 0){
      return res.status(400).json({
        error: { message: `Request must contain either something to edit`}
      })
    }

    PeopleService.updatePerson(
      req.app.get('db'),
      req.params.person_id,
      personToUpdate
    )
      .then(numRowsAffected => {
        res
          .status(204).end()
      })
      .catch(next)
  })


module.exports = peopleRouter