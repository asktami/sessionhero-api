// methods to store database transactions
const xss = require('xss');
let table = 'schedule';

const scheduleService = {
	// TBD
	// get schedule records for loggedIn users, join to user table and session table
	getAllSchedule(db) {
		return db
			.from(table)
			.select('*', ...userFields, ...sessionFields)
			.leftJoin('users AS usr', 'schedule.userId', 'usr.id')
			.leftJoin('sessions', 'schedule.sessionId', 'session.id');
	},

	insertSchedule(knex, newScheduleItem) {
		return knex
			.insert(newScheduleItem)
			.into(table)
			.returning('*')
			.then(rows => {
				return rows[0];
			});
	},
	getById(knex, id) {
		return knex
			.from(table)
			.select('*')
			.where('id', id)
			.first();
	},
	deleteSchedule(knex, id) {
		return knex(table)
			.where({ id })
			.delete();
	},

	// record returned after successful insert/update
	serializeSchedule(schedule) {
		return {
			id: schedule.id,
			sessionId: schedule.sessionId,
			userId: schedule.userId
		};
	}
};

const userFields = [
	'usr.id AS user:id',
	'usr.user_name AS user:username',
	'usr.full_name AS user:fullname',
	'usr.date_created AS user:date_created',
	'usr.date_modified AS user:date_modified'
];

const sessionFields = [
	// id: session.id,
	// track: session.track,
	// day: session.day,
	// date: session.date,
	// time_start: session.time_start,
	// time_end: session.time_end,
	// location: session.location,
	// name: session.name,
	// description: session.description,
	// background: session.background,
	// objective_1: session.objective_1,
	// objective_2: session.objective_2,
	// objective_3: session.objective_3,
	// objective_4: session.objective_4,
	// speaker: session.speaker,
];

module.exports = scheduleService;
