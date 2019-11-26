const { NODE_ENV } = require('./config');
const logger = require('./logger');

function errorHandler(error, req, res, next) {
	let response;
	if (NODE_ENV === 'production') {
		response = {
			error: {
				message: error.message + ' ' + error + ' in errorHandler'
			}
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
		response = { message: error.message, error };
	}

	console.error(error.message, error);
	res.status(500).json(response);
}

module.exports = errorHandler;
