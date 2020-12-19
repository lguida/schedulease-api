const PeopleService = {
    getAllPeople(knex){
        return knex.select('*').from('people')
    },
    insertPerson(knex, newPerson) {
        return knex
            .insert(newPerson)
            .into('people')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex
            .from('people')
            .select('*')
            .where('id', id)
            .first()
    },
    deletePerson(knex, id) {
        return knex('people')
            .where({ id })
            .delete()
    },
    updatePerson(knex, id, newPersonFields){
        return knex('people')
            .where({ id })
            .update(newPersonFields)
    }
}

module.exports = PeopleService