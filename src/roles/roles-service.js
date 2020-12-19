const RoleService = {
    getAllRoles(knex) {
      return knex.select('*').from('roles')
    },
  
    insertRole(knex, newRole) {
      return knex
        .insert(newRole)
        .into('roles')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('roles')
        .select('*')
        .where('id', id)
        .first()
    },

    getByScheduleId(knex, scheduleId) {
        return knex 
            .from('roles')
            .select("*")
            .where('schedule_id', scheduleId)
    },
  
    deleteRole(knex, id) {
      return knex('roles')
        .where({ id })
        .delete()
    },
  
    updateRole(knex, id, newRoleFields) {
      return knex('roles')
        .where({ id })
        .update(newRoleFields)
    },
}
  
module.exports = RoleService