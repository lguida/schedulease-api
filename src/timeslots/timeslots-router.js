const path = require('path')
const express = require('express')
const xss = require('xss')
const TimeslotsService = require('./timeslots-service')

const timeslotsRouter = express.Router()
const jsonParser = express.json()

const serializeTimeslot = ts => ({
  id: ts.id,
  schedule_id: ts.schedule_id,
  timeslot: ts.timeslot,
  day_name: ts.day_name
})

timeslotsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    TimeslotsService.getAllTimeslots(knexInstance)
      .then(timeslots => {
        res.json(timeslots.map(serializeTimeslot))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { schedule_id, timeslot, day_name } = req.body
    const newTimeslot = { schedule_id, timeslot, day_name }

    for (const [key, value] of Object.entries(newTimeslot))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    TimeslotsService.insertTimeslot(
      req.app.get('db'),
      newTimeslot
    )
      .then(timeslot => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${timeslot.id}`))
          .json(serializeComment(timeslot))
      })
      .catch(next)
  })

timeslotsRouter
  .route('/schedule/:schedule_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    TimeslotsService.getByScheduleId(
        knexInstance,
        req.params.schedule_id
    )
      .then(timeslots => {
          if(timeslots.length === 0) {
              return res.status(404).json({
                  error: { message: `Schedule doesn't have any timeslots or doesn't exist`}
              })
          }
        res.json(roles.map(serializeTimeslot))
      })
      .catch(next)
  })

timeslotsRouter
  .route('/:ts_id')
  .all((req, res, next) => {
    TimeslotsService.getById(
      req.app.get('db'),
      req.params.ts_id
    )
      .then(timeslot => {
        if (!timeslot) {
          return res.status(404).json({
            error: { message: `Timeslot doesn't exist` }
          })
        }
        res.timeslot = timeslot
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeTimeslot(res.timeslot))
  })
  .delete((req, res, next) => {
    TimeslotsService.deleteTimeslot(
      req.app.get('db'),
      req.params.ts_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { schedule_id, timeslot, day_name } = req.body
    const timeslotToUpdate = { timeslot, day_name }

    if (schedule_id){
        return res.status(400).json({
            error:{
                message: `Cannot update schedule_id`
            }
        })
    }
    
    const numberOfValues = Object.values(timeslotToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain something to edit'`
        }
      })
    

    TimeslotsService.updateTimeslot(
      req.app.get('db'),
      req.params.ts_id,
      timeslotToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
})

module.exports = timeslotsRouter