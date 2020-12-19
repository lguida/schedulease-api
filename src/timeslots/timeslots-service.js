const TimeslotsService = {
    getAllTimeslots(knex) {
      return knex.select('*').from('timeslots')
    },
  
    insertTimeslot(knex, newTimeslot) {
      return knex
        .insert(newTimeslot)
        .into('timeslots')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('timeslots')
        .select('*')
        .where('id', id)
        .first()
    },

    getByScheduleId(knex, scheduleId) {
        return knex 
            .from('timeslots')
            .select("*")
            .where('schedule_id', scheduleId)
    },
  
    deleteTimeslot(knex, id) {
      return knex('timeslots')
        .where({ id })
        .delete()
    },
  
    updateTimeslot(knex, id, newTimeslotFields) {
      return knex('timeslots')
        .where({ id })
        .update(newTimeslotFields)
    },
}
  
module.exports = TimeslotsService