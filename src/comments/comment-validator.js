const logger = require('../logger');

const NO_ERRORS = null;

// comment = text, rating, sessionId, userId

function getCommentValidationError({ text, rating }) {
	if (text && text.length < 5) {
		logger.error(`Invalid comment '${text}' supplied`);
		return {
			error: {
				message: `The comment must be at least 5 characters`
			}
		};
	}

	if (rating && (!Number.isInteger(rating) || rating < 0 || rating > 5)) {
		logger.error(`Invalid rating '${rating}' supplied`);
		return {
			error: {
				message: `The rating must be a number between 0 and 5`
			}
		};
	}

	return NO_ERRORS;
}

module.exports = {
	getCommentValidationError
};
