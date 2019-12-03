const { NODE_ENV } = require('./config');
const logger = require('./logger');

function errorHandler(error, req, res, next) {
	let response;
	if (NODE_ENV === 'production') {
		response = {
			message: 'server error: ' + error.message + ' ' + error
		};
	} else {
		// include winston logging
		// to log message:
		logger.error('XXX ERROR-HANDLER-LOGGER XXX');
		logger.error(error.message);
		logger.error(
			`${error.status || 500} - ${error.message} - ${req.originalUrl} - ${
				req.method
			} - ${req.ip}`
		);
		response = {
			message:
				'server error: ' + error.message + ' ' + error + ' in errorHandler'
		};
	}

	// console.error(error.message, error);
	res.status(500).json(response);
}

module.exports = errorHandler;
