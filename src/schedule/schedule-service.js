let table = 'schedule';

const scheduleService = {
	// get schedule records for logInUserId, join to user table and session table
	getSchedule(knex, loginUserId) {
		return knex
			.select(
				'schedule.id',
				'schedule.id as schedule_id',
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
				'speaker'
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
	deleteSchedule(knex, id) {
		return knex(table)
			.where('id', id)
			.delete();
	},

	// record returned after successful Read/Create/Update
	serializeSchedule(schedule) {
		return schedule;
	}
};

module.exports = scheduleService;
