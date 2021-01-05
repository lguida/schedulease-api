const path = require('path')
const express = require('express') 
const CompleteService = require('./complete-service')

const completeRouter = express.Router()
const jsonParser = express.json()

const serializeComplete = complete => ({
  id: complete.id,
  schedule_id: complete.schedule_id,
  timeslot: complete.timeslot,
  people_name: complete.people_name,
  role_name: complete.role_name,
})

completeRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    CompleteService.getAllComplete(knexInstance)
      .then(complete => {
        res.json(complete.map(serializeComplete))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    req.body.map(request => {
      const { schedule_id, timeslot, role_name, people_name } = request
      const newComplete = { schedule_id, timeslot, role_name, people_name }

      for (const [key, value] of Object.entries(newComplete))
        if (value == null)
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })

      CompleteService.insertComplete(
        req.app.get('db'),
        newComplete
      )

      .then(complete => {
        if (req.body.indexOf(request) === req.body.length -1 ){
          const { schedule_id } = complete
          CompleteService.getByScheduleId(
            req.app.get('db'),
            schedule_id
          )
          .then(entries => {
            if (entries.length === 0){
              return res.status(404).json({
                error: { message: `Schedule doesn't have any timeslots or doesn't exist`}
              })
            }
            else{
            res
              .status(201)
              .json(entries.map(serializeComplete))
            }
          })
          .catch(next)
        }
      })
      .catch(next)
    })
  })

completeRouter
  .route('/schedule/:schedule_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    CompleteService.getByScheduleId(
        knexInstance,
        req.params.schedule_id
    )
      .then(complete => {
          if(complete.length === 0) {
              return res.status(404).json({
                  error: { message: `Schedule doesn't have a complete schedules or doesn't exist`}
              })
          }
        res.json(complete.map(serializeComplete))
      })
      .catch(next)
  })

completeRouter
  .route('/:complete_id')
  .all((req, res, next) => {
    CompleteService.getById(
      req.app.get('db'),
      req.params.complete_id
    )
      .then(complete => {
        if (!complete) {
          return res.status(404).json({
            error: { message: `Complete schedule doesn't exist` }
          })
        }
        res.complete = complete
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeComplete(res.complete))
  })
  .delete((req, res, next) => {
    CompleteService.deleteComplete(
      req.app.get('db'),
      req.params.complete_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { schedule_id, timeslot, role_name, people_name } = req.body
    const completeToUpdate = { timeslot, role_name, people_name }

    if (schedule_id){
        return res.status(400).json({
            error:{
                message: `Cannot update schedule_id`
            }
        })
    }
    
    const numberOfValues = Object.values(completeToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain something to edit'`
        }
      })
    

    CompleteService.updateComplete(
      req.app.get('db'),
      req.params.complete_id,
      completeToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
})

module.exports = completeRouter