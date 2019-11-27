const xss = require('xss');
let table = 'comments';

const commentService = {
	// getById(knex, id) {
	// 	return knex
	// 		.from(table)
	// 		.select('comments.*', 'users.username')
	// 		.leftJoin('users', 'comments.user_id', 'users.id')
	// 		.where('comments.id', id)
	// 		.first();
	// },

	getById(db, id) {
		return db
			.from(table)
			.select(
				'*',
				db.raw(
					`row_to_json(
				  (SELECT tmp FROM (
					SELECT
					  usr.id,
					  usr.username,
					  usr.fullname,
					  usr.date_created,
					  usr.date_modified
				  ) tmp)
				) AS "user"`
				)
			)
			.leftJoin('users AS usr', 'comments.user_id', 'usr.id')
			.where('comments.id', id)
			.first();
	},

	// after insert, return comments record joined to users record
	// with all fields from comments and users tables
	insertComment(knex, newComment) {
		return knex
			.insert(newComment)
			.into(table)
			.returning('*')
			.then(([comment]) => comment)
			.then(comment => commentService.getById(knex, comment.id));
	},

	deleteComment(knex, id) {
		return knex(table)
			.where({ id })
			.delete();
	},
	updateComment(knex, id, commentToUpdate) {
		return knex(table)
			.where({ id })
			.update(commentToUpdate);
	},

	serializeComment(comment) {
		return {
			id: comment.id,
			user_id: comment.user_id,
			text: xss(comment.text),
			rating: xss(comment.rating),
			session_id: comment.session_id,
			date_created: new Date(comment.date_created),
			user: comment.user || {}
		};
	}
};

module.exports = commentService;
