const path = require('path')
const express = require('express')
const xss = require('xss')
const ScheduleService = require('./schedule-service')

const scheduleRouter = express.Router()
const jsonParser = express.json()

const serializeSchedule = schedule => ({
  id: schedule.id,
  people_id: schedule.people_id,
  schedule_name: xss(schedule.schedule_name),
  status: schedule.status,
  responses: schedule.responses,
  start_date: schedule.start_date,
  end_date: schedule.end_date
})

scheduleRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    ScheduleService.getAllSchedules(knexInstance)
      .then(schedules => {
        res.json(schedules.map(serializeSchedule))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { people_id, schedule_name, status, responses, start_date, end_date } = req.body
    const newSchedule = { people_id, schedule_name, responses, start_date, end_date }

    for (const [key, value] of Object.entries(newSchedule))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    newSchedule.status = status

    ScheduleService.insertSchedule(
      req.app.get('db'),
      newSchedule
    )
      .then(schedule => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${schedule.id}`))
          .json(serializeComment(schedule))
      })
      .catch(next)
  })

scheduleRouter
  .route('/user/:user_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    ScheduleService.getByPeopleId(
        knexInstance,
        req.params.user_id
    )
      .then(schedules => {
          if(schedules.length === 0) {
              return res.status(404).json({
                  error: { message: `User doesn't have any schedules`}
              })
          }
        res.json(schedules.map(serializeSchedule))
      })
      .catch(next)
  })

scheduleRouter
  .route('/:schedule_id')
  .all((req, res, next) => {
    ScheduleService.getById(
      req.app.get('db'),
      req.params.schedule_id
    )
      .then(schedule => {
        if (!schedule) {
          return res.status(404).json({
            error: { message: `Schedule doesn't exist` }
          })
        }
        res.schedule = schedule
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeSchedule(res.schedule))
  })
  .delete((req, res, next) => {
    ScheduleService.deleteSchedule(
      req.app.get('db'),
      req.params.schedule_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { people_id, schedule_name, status, responses, start_date, end_date } = req.body
    const scheduleToUpdate = { schedule_name, status, responses, start_date, end_date }

    if (people_id){
        return res.status(400).json({
            error:{
                message: `Cannot update people_id`
            }
        })
    }
    
    const numberOfValues = Object.values(scheduleToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain something to edit'`
        }
      })
    

    ScheduleService.updateSchedule(
      req.app.get('db'),
      req.params.schedule_id,
      scheduleToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
})

module.exports = scheduleRouter