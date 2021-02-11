function makePeopleArray() {
    return [
        {
            id: 1,
            email: "lguida@sas.upenn.edu",
            account: true,
            first_name: "Lucy",
            last_name: "Guida",
            username: "lguida",
            password: "lucypass1200",
        },
        {
            id: 2,
            account: false,
            email: "shomles@gmail.com",
            first_name: "Sherlock",
            last_name: "Holmes",
            username: null,
            password: null
        },
        {
            id: 3,
            account: false,
            email: "mholmes@gmail.com",
            first_name: "Mycroft",
            last_name: "Holmes",
            username: null,
            password: null
        },
        {
            id: 4,
            account: false,
            email: "glestrade@scotlandyard.com",
            first_name: "Greg",
            last_name: "Lestrade",
            username: null,
            password: null
        }
    ]
}

function makeSchedulesArray() {
    return [
        {
            id: 1,
            people_id: 1,
            schedule_name: "My First Schedule",
            status: "open",
            responses: 0,
            start_date: "Dec 9, 2021",
            end_date: "Dec 10, 2021",
            meeting_duration: "30 minutes"
        },
        {
            id: 2,
            people_id: 1,
            schedule_name: "My Second Schedule",
            status: "open",
            responses: 0,
            start_date: "Dec 12, 2021",
            end_date: "Dec 13, 2021",
            meeting_duration: "1 hour"
        },
        {
            id: 3,
            people_id: 2,
            schedule_name: "Sherlock's First Schedule",
            status: "open",
            responses: 0,
            start_date: "May 1, 2021",
            end_date: "May 12, 2021",
            meeting_duration: "15 minutes"
        },
    ]
}

function makeRolesArray () {
    return [
        {
            id: 1,
            schedule_id: 1,
            role_name: "General"
        },
        {
            id: 2,
            schedule_id: 2,
            role_name: "Proctor"
        },
        {
            id: 3,
            schedule_id: 2,
            role_name: "Participant"
        },
        {
            id: 4,
            schedule_id: 3,
            role_name: "Manager"
        },
        {
            id: 5,
            schedule_id: 3,
            role_name: "Employee"
        }
    ]
}

function makeTimeslotsArray () {
    return [
        {
            id: 1,
            schedule_id: 1,
            timeslot: "1:00PM",
            day_name: "Sunday, Dec 27"
        },
        {
            id: 2,
            schedule_id: 1,
            timeslot: "12:00PM",
            day_name: "Sunday, Dec 27"
        },
        {
            id: 3,
            schedule_id: 1,
            timeslot: "1:00PM",
            day_name: "Monday, Dec 28"
        },
        {
            id: 4,
            schedule_id: 2,
            timeslot: "1:00PM",
            day_name: "Tuesday, Dec 29"
        },
        {
            id: 5,
            schedule_id: 2,
            timeslot: "2:00PM",
            day_name: "Tuesday, Dec 29"
        },
        {
            id: 6,
            schedule_id: 3,
            timeslot: "1:00PM",
            day_name: "Tuesday, Dec 29"
        }
    ]
}

function makeAvailArray () {
    return [
        {
            id: 1,
            schedule_id: 2,
            timeslot: 4,
            people_id: 1,
            role_name: "Proctor"
        },
        {
            id: 2,
            schedule_id: 2,
            timeslot: 4,
            people_id: 2,
            role_name: "Participant"
        },
        {
            id: 3,
            schedule_id: 3,
            timeslot: 5,
            people_id: 1,
            role_name: "Manager"
        },
        {
            id: 4,
            schedule_id: 3,
            timeslot: 5,
            people_id: 2,
            role_name: "Employee"
        },
        {
            id: 5,
            schedule_id: 2,
            timeslot: 5,
            people_id: 1,
            role_name: "Proctor"
        },
    ]
}

function makeCompleteArray () {
    return [
        {
            id: 1,
            schedule_id: 2,
            timeslot: 5,
            people_name: "Lucy Guida",
            role_name: "Better Test Role"
        },
        {
            id: 2,
            schedule_id: 2,
            timeslot: 5,
            people_name: "Alexander The Great",
            role_name: "The Best Test Role"
        },
        {
            id: 3,
            schedule_id: 3,
            timeslot: 5,
            people_name: "Alexander The Great",
            role_name: "The Best Test Role"
        }
    ]
}



module.exports = {
    makePeopleArray,
    makeSchedulesArray,
    makeRolesArray,
    makeTimeslotsArray,
    makeAvailArray,
    makeCompleteArray
}