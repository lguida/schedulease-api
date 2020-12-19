const CompleteService = {
    getAllComplete(knex) {
      return knex.select('*').from('complete')
    },
  
    insertComplete(knex, newComplete) {
      return knex
        .insert(newComplete)
        .into('complete')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('complete')
        .select('*')
        .where('id', id)
        .first()
    },

    getByScheduleId(knex, scheduleId) {
        return knex 
            .from('complete')
            .select("*")
            .where('schedule_id', scheduleId)
    },
  
    deleteComplete(knex, id) {
      return knex('complete')
        .where({ id })
        .delete()
    },
  
    updateComplete(knex, id, newCompleteFields) {
      return knex('complete')
        .where({ id })
        .update(newCompleteFields)
    },
}
  
module.exports = CompleteService