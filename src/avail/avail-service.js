const AvailService = {
    getAllAvail(knex) {
      return knex.select('*').from('avail')
    },
  
    insertAvail(knex, newAvail) {
      return knex
        .insert(newAvail)
        .into('avail')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('avail')
        .select('*')
        .where('id', id)
        .first()
    },

    getByScheduleId(knex, scheduleId) {
      return knex 
          .from('avail')
          .select("*")
          .where('schedule_id', scheduleId)
    },

    getByPeopleIdAndSched(knex, peopleId, scheduleId){
      return knex
        .from('avail')
        .where('people_id', peopleId)
        .where('schedule_id', scheduleId)
        .select('*')
    },
  
    deleteAvail(knex, id) {
      return knex('avail')
        .where({ id })
        .delete()
    },
  
    updateAvail(knex, id, newAvailFields) {
      return knex('avail')
        .where({ id })
        .update(newAvailFields)
    },
}
  
module.exports = AvailService