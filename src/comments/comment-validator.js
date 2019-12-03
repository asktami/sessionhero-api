const logger = require('../logger');

const NO_ERRORS = null;

// comment = comment, rating, sessionId, userId

function getCommentValidationError({ comment, rating }) {
	if (comment && comment.length < 5) {
		logger.error(`Invalid comment '${comment}' supplied`);
		return {
			message: `The comment must be at least 5 characters`
		};
	}

	if (rating && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
		logger.error(`Invalid rating '${rating}' supplied`);
		return {
			message: `The rating must be a number between 1 and 5`
		};
	}

	return NO_ERRORS;
}

module.exports = {
	getCommentValidationError
};
