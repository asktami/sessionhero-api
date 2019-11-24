const xss = require('xss');
let table = 'comments';

const commentService = {
	getById(knex, id) {
		return knex
			.from(table)
			.select('*')
			.leftJoin('users', 'comments.userId', 'user.id')
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

	// TBD HOW DOES THIS WORK???
	// what is "user"??? where does it come from???
	serializeComment(comment) {
		return {
			id: comment.id,
			rating: comment.rating,
			text: xss(comment.text),
			sessionId: comment.sessionId,
			userId: comment.userId,
			date_created: comment.date_created,
			date_modified: comment.date_modified,
			user: comment.user || {}
		};
	}
};

module.exports = commentService;
