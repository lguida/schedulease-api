INSERT INTO people (email, account, first_name, last_name, username, password)
VALUES
    ('lguida@sas.upenn.edu', 'true', 'Lucy', 'Guida', 'lguida', 'lucypass1200'),
    ('shomles@gmail.com', 'false', 'Sherlock', 'Holmes', null, null),
    ('mholmes@gmail.com', 'false', 'Mycroft', 'Holmes', null, null),
    ('glestrade@scotlandyard.com', 'false', 'Greg', 'Lestrade', null, null)
;


INSERT INTO schedules (people_id, schedule_name, status, responses, start_date, end_date, meeting_duration)
VALUES
    (1, 'My First Schedule', 'open', 3, now(), now(), '30 minutes'),
    (1, 'End of year meetings', 'open', 0, now(), now(), '1 hour')
;

INSERT INTO roles (schedule_id, role_name)
VALUES
    (1, 'Manager'),
    (1, 'Participant')
;

INSERT INTO timeslots (schedule_id, timeslot, day_name)
VALUES
    (1, '10:00AM', 'Thursday Dec 17'),
    (1, '10:00AM', 'Friday, Dec 18'),
    (1, '11:00AM', 'Friday, Dec 18')
;

INSERT INTO avail (timeslot, schedule_id, people_id, role_name)
VALUES
    (1, 1, 1, 'Manager'),
    (2, 1, 1, 'Manager'),
    (3, 1, 1, 'Manager'),
    (3, 1, 2, 'Participant'),
    (3, 1, 3, 'Participant'),
    (2, 1, 3, 'Participant'),
    (1, 1, 4, 'Manager'),
    (2, 1, 4, 'Manager'),
    (3, 1, 4, 'Manager')
;

    