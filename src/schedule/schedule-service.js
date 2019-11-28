let table = 'schedule';

const scheduleService = {
	// get schedule records for logInUserId, join to user table and session table
	getSchedule(knex, loginUserId) {
		console.log('SCHEDULE LOGIN USER ID = ', loginUserId);
		return knex
			.select(
				'schedule.id',
				'session_id',
				'user_id',
				'track',
				'day',
				'date',
				'time_start',
				'time_end',
				'location',
				'name',
				'description',
				'background',
				'objective_1',
				'objective_2',
				'objective_3',
				'objective_4',
				'speaker',
				'fullname'
			)
			.from(table)
			.leftJoin('sessions', 'sessions.id', 'schedule.session_id')
			.leftJoin('users', 'users.id', 'schedule.user_id')
			.where('schedule.user_id', loginUserId);
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
	deleteSchedule(knex, session_id, loginUserId) {
		return knex(table)
			.where('id', session_id, 'user_id', loginUserId)
			.delete();
	},

	// record returned after successful Read/Create/Update
	serializeSchedule(schedule) {
		// console.log('schedule = ', schedule);
		// const { sessions, users } = schedule;

		return schedule;
		// return {
		// 	id: schedule.id,
		// 	session_id: schedule.session_id,
		// 	user_id: schedule.user_id,
		// 	sessions: {
		// 		track: sessions.track,
		// 		day: sessions.day,
		// 		date: sessions.date,
		// 		time_start: sessions.time_start,
		// 		time_end: sessions.time_end,
		// 		location: sessions.location,
		// 		name: sessions.name,
		// 		description: sessions.description,
		// 		background: sessions.background,
		// 		objective_1: sessions.objective_1,
		// 		objective_2: sessions.objective_2,
		// 		objective_3: sessions.objective_3,
		// 		objective_4: sessions.objective_4,
		// 		speaker: sessions.speaker
		// 	},
		// 	users: {
		// 		fullname: users.fullname,
		// 		username: users.username
		// 	}
		// };
	}
};

// const userFields = ['usr.id AS user:id', 'usr.fullname AS user:fullname'];

// const sessionFields = [
// 	'sessions:id',
// 	'sessions:track',
// 	'sessions:day',
// 	'sessions:date',
// 	'sessions:time_start',
// 	'sessions:time_end',
// 	'sessions:location',
// 	'sessions:name',
// 	'sessions:description',
// 	'sessions:background',
// 	'sessions:objective_1',
// 	'sessions:objective_2',
// 	'sessions:objective_3',
// 	'sessions:objective_4',
// 	'sessions:speaker'
// ];

module.exports = scheduleService;
