const path = require('path')
const express = require('express')
const xss = require('xss')
const AvailService = require('./avail-service')

const availRouter = express.Router()
const jsonParser = express.json()

const serializeAvail = avail => ({
  id: avail.id,
  schedule_id: avail.schedule_id,
  timeslot: avail.timeslot,
  people_id: avail.people_id,
  role_name: xss(avail.role_name)
})

availRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    AvailService.getAllAvail(knexInstance)
      .then(avail => {
        res.json(avail.map(serializeAvail))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { schedule_id, timeslot, role_name, people_id } = req.body
    const newAvail = { schedule_id, timeslot, role_name, people_id }

    for (const [key, value] of Object.entries(newAvail))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    AvailService.insertAvail(
      req.app.get('db'),
      newAvail
    )
      .then(avail => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${avail.id}`))
          .json(serializeAvail(avail))
      })
      .catch(next)
  })

availRouter
  .route('/schedule/:schedule_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    AvailService.getByScheduleId(
        knexInstance,
        req.params.schedule_id
    )
      .then(avail => {
          if(avail.length === 0) {
              return res.status(404).json({
                  error: { message: `Schedule doesn't have any avail or doesn't exist`}
              })
          }
        res.json(avail.map(serializeAvail))
      })
      .catch(next)
  })

availRouter
  .route('/:avail_id')
  .all((req, res, next) => {
    AvailService.getById(
      req.app.get('db'),
      req.params.avail_id
    )
      .then(avail => {
        if (!avail) {
          return res.status(404).json({
            error: { message: `Avail entry doesn't exist` }
          })
        }
        res.avail = avail
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeAvail(res.avail))
  })
  .delete((req, res, next) => {
    AvailService.deleteAvail(
      req.app.get('db'),
      req.params.avail_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { schedule_id, timeslot, role_name, people_id } = req.body
    const availToUpdate = { timeslot, role_name }

    if (schedule_id){
        return res.status(400).json({
            error:{
                message: `Cannot update schedule_id`
            }
        })
    }
    if (people_id) {
        return res.status(400).json({
            error:{
                message: `Cannot update people_id`
            }
        })
    }
    
    const numberOfValues = Object.values(availToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain something to edit'`
        }
      })
    

    AvailService.updateAvail(
      req.app.get('db'),
      req.params.avail_id,
      availToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
})

module.exports = availRouter