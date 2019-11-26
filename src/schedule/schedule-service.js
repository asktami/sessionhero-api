// methods to store database transactions
let table = 'schedule';

const scheduleService = {
	// TBD
	// get schedule records for logInUserId, join to user table and session table

	getAllSchedule(knex, loginUserId) {
		// return knex.from(table).select('*');
		// .where({ user_id: loginUserId });

		return knex.raw(
			`select * from schedule
				left join sessions on schedule.session_id = sessions.id
				left join users on schedule.user_id = users.id
				where schedule.user_id = :loginUserId
				order by sessions.date, sessions.time_start`,
			{ loginUserId: loginUserId }
		);
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

	// TBD HOW to return a serialized JOIN with users and sessions?
	// AND - do I need to???
	// record returned after successful insert/update
	serializeSchedule(schedule) {
		return {
			id: schedule.id,
			session_id: schedule.session_id,
			user_id: schedule.user_id
		};
	}
};

// const userFields = ['usr.id AS user:id', 'usr.fullname AS user:fullname'];

// const sessionFields = [
// 	session.id,
// 	session.track,
// 	session.day,
// 	session.date,
// 	session.time_start,
// 	session.time_end,
// 	session.location,
// 	session.name,
// 	session.description,
// 	session.background,
// 	session.objective_1,
// 	session.objective_2,
// 	session.objective_3,
// 	session.objective_4,
// 	xsession.speaker
// ];

module.exports = scheduleService;
