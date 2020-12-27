const path = require('path')
const express = require('express')
const xss = require('xss')
const RoleService = require('./roles-service')

const rolesRouter = express.Router()
const jsonParser = express.json()

const serializeRole = role => ({
  id: role.id,
  schedule_id: role.schedule_id,
  role_name: xss(role.role_name),
})

rolesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    RoleService.getAllRoles(knexInstance)
      .then(roles => {
        res.json(roles.map(serializeRole))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { schedule_id, role_name } = req.body
    const newRole = { schedule_id, role_name }

    for (const [key, value] of Object.entries(newRole))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    RoleService.insertRole(
      req.app.get('db'),
      newRole
    )
      .then(role => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${role.id}`))
          .json(serializeRole(role))
      })
      .catch(next)
  })

rolesRouter
  .route('/schedule/:schedule_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    RoleService.getByScheduleId(
        knexInstance,
        req.params.schedule_id
    )
      .then(roles => {
          if(roles.length === 0) {
              return res.status(404).json({
                  error: { message: `Schedule doesn't have any roles or doesn't exist`}
              })
          }
        res.json(roles.map(serializeRole))
      })
      .catch(next)
  })

rolesRouter
  .route('/:role_id')
  .all((req, res, next) => {
    RoleService.getById(
      req.app.get('db'),
      req.params.role_id
    )
      .then(role => {
        if (!role) {
          return res.status(404).json({
            error: { message: `Role doesn't exist` }
          })
        }
        res.role = role
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeRole(res.role))
  })
  .delete((req, res, next) => {
    RoleService.deleteRole(
      req.app.get('db'),
      req.params.role_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { schedule_id, role_name } = req.body
    const roleToUpdate = { role_name }

    if (schedule_id){
        return res.status(400).json({
            error:{
                message: `Cannot update schedule_id`
            }
        })
    }
    
    const numberOfValues = Object.values(roleToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain something to edit'`
        }
      })
    

    RoleService.updateRole(
      req.app.get('db'),
      req.params.role_id,
      roleToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
})

module.exports = rolesRouter