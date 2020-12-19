const ScheduleService = {
    getAllSchedules(knex) {
      return knex.select('*').from('schedules')
    },
  
    insertSchedule(knex, newSchedule) {
      return knex
        .insert(newSchedule)
        .into('schedules')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('schedules')
        .select('*')
        .where('id', id)
        .first()
    },

    getByPeopleId(knex, peopleId) {
        return knex 
            .from('schedules')
            .select("*")
            .where('people_id', peopleId)
    },
  
    deleteSchedule(knex, id) {
      return knex('schedules')
        .where({ id })
        .delete()
    },
  
    updateSchedule(knex, id, newScheduleFields) {
      return knex('schedules')
        .where({ id })
        .update(newScheduleFields)
    },
}
  
module.exports = ScheduleService