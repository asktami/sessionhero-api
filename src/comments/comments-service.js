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

	getById(knex, id) {
		return knex
			.from(`comments as comm`)
			.select(
				'comm.id',
				'comm.text',
				'comm.rating',
				'comm.date_created',
				'comm.session_id',
				knex.raw(
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
			.leftJoin('users AS usr', 'comm.user_id', 'usr.id')
			.where('comm.id', id)
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
	// TBD does this do the exact same thing???
	// insertBookmark(knex, newBookmark) {
	// 	return knex
	// 		.insert(newBookmark)
	// 		.into(`bookmarks`)
	// 		.returning('*')
	// 		.then(rows => {
	// 			return rows[0];
	// 		});
	// },

	deleteComment(knex, id) {
		return knex(table)
			.where({ id })
			.delete();
	},
	updateComment(knex, id, newCommentData) {
		return knex(table)
			.where({ id })
			.update(newCommentData);
	},

	serializeComment(comment) {
		const { user } = comment;
		return {
			id: comment.id,
			user_id: comment.user_id,
			text: xss(comment.text),
			rating: xss(comment.rating),
			session_id: comment.session_id,
			date_created: new Date(comment.date_created),
			user: {
				id: user.id,
				username: user.username,
				fullname: user.fullname,
				date_created: new Date(user.date_created),
				date_modified: new Date(user.date_modified) || null
			}
		};
	}
};

module.exports = commentService;
