# Schedulease-api

This repo includes the back-end for the app Schedulease. 

The front-end client can be found here: https://schedulease.vercel.app/
The back-end is deployed to Heroku here: https://secret-bayou-29151.herokuapp.com/api

The database is relational and includes 6 tables: `people`, `schedules`, `roles`, `timeslots`, `avail`, and `complete`.

## Endpoints
The base fetch url is `https://secret-bayou-29151.herokuapp.com/api/[insert table name]`

Note: Regular brackets `[]` here are used to show fields that require customized entries. There are no `[]` used in the actual fetch urls.

### General endpoints
All six tables include basic CRUD endpoints by using the following syntax:
* GET all tables -- [base url]/[table name]/
* POST content in header -- [base url]/[table name]/
* GET entry with a given id -- [base url]/[table name]/[entry id]
* DELETE entry with a given id -- [base url]/[table name]/[entry id]
* PATCH entry with a given id -- [base url]/[table name]/[entry id]

### Special endpoints
Below are the additional endpoints that are available.
1. **People:**
* GET person by username and password combo `[base url]/people/auth/[username]/[password]`
* GET person by id `[base url]/people/id/[target id]`
* PATCH and DELETE for `people` both require this syntax as well: `[base url]/people/id/[target id]`

2. **Schedules:**
* GET all schedules for a given user `[base url]/schedules/user/[user id]`


3. **Roles:**
* GET all roles for a given schedule `[base url]/roles/schedule/[schedule id]`

4. **Timeslots:**
* GET all timeslots for a given schedule `[base url]/roles/schedule/[schedule id]`

5. **Avail:**
* DELETE all avail matching a peopleId/scheduleId combo `[base url]/avail/delete/[user id]/[schedule id]`
* GET all avail for a given schedule `[base url]/avail/schedule/[schedule id]`

6. **Complete:**
* GET all complete schedule entries for a given schedule `[base url]/complete/schedule/[schedule id]`

## Header Object syntax for POST and PATCH
For all POST requests, send a JSON object in the header with all of the required fields. For all PATCH requests, it is only necessary to send the field you wish to change in the JSON object header. Some fields cannot be changed once they are POSTed. The id for each entry is auto generated and returned with the POST request response. Unless otherwise indicated, all id's are integers and all other data types are strings.

### Required and Optional fields 

1. **People:**
* email -- required
* account -- required, boolean
* first_name -- required
* last_name -- required
* username
* password

2. **Schedules:**
* people_id -- required, not editable
* schedule_name -- required
* status
* responses -- required, integer
* start_date -- required
* end_date -- required
* meeting_duration -- required

3. **Roles:**
* schedule_id -- required, not editable
* role_name -- required

4. **Timeslots:**
* schedule_id -- required, not editable
* timeslot -- required (note: this is the time of day of the slot)
* day_name -- required (note: this is the day of the week and the date of the timeslots)

5. **Avail:**
* schedule_id -- required, not editable
* timeslot -- required (note: this is the integer id of the corresponding entry in the `timeslots` table)
* people_id -- required, not editable
* role_name -- required (note: this is the string value of the role name, NOT the id from the `roles` table)

6. **Complete:**
* schedule_id -- required, not editable
* timeslot -- required (note: this is the integer id of the corresponding entry in the `timeslots` table)
* people_name -- required (note: this is the string value of the user's first and last name concatenated, NOT the id from the `people` table)
* role_name -- required (note: this is the string value of the role name, NOT the id from the `roles` table)

### POSTing multiple objects in one request

In some of the tables, it is possible to POST multiple objects in one request. For the `timeslots`, `roles`, `avail` and `complete` tables, you can send a list of objects by wrapping each object in curly brackets {}, separating each object using a comma, and wrapping the whole list of objects in regular brackets []. See example below:

[ <br/>
    {<br/>
        "Field1": "Obj1_value"<br/>
    },<br/>
    {<br/>
        "Field1": "Obj2_value"<br/>
    }<br/>
]<br/>

When you post multiple objects using this method, the response will include all of the added objects using the same syntax as is used to send the request.

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

Deploy the updated project `npm run deploy`

## Tech Used
* Node.js
* Express 
* PostgreSQL
* Knex
* NPM
* Chai
* Mocha