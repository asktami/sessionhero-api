const express = require('express');
const path = require('path');
const logger = require('../logger');

const scheduleService = require('./schedule-service');

const scheduleRouter = express.Router();
const jsonBodyParser = express.json();

scheduleRouter
	.route('/')
	.get((req, res, next) => {
		const knexInstance = req.app.get('db');
		scheduleService
			.getAllSchedule(knexInstance)
			.then(schedule => {
				res.json(schedule.map(scheduleService.serializeSchedule(schedule)));
			})
			.catch(next);
	})
	.post(jsonBodyParser, (req, res, next) => {
		const { sessionId } = req.body;
		const newScheduleItem = { sessionId };
		const knexInstance = req.app.get('db');

		for (const field of ['sessionId']) {
			if (!req.body[field]) {
				logger.error({
					message: `${field} is required`,
					request: `${req.originalUrl}`,
					method: `${req.method}`,
					ip: `${req.ip}`
				});
				return res.status(400).send({
					error: { message: `'${field}' is required` }
				});
			}
		}

		scheduleService
			.insertSchedule(knexInstance, newScheduleItem)
			.then(schedule => {
				logger.info({
					message: `Schedule with id ${schedule.id} created.`,
					request: `${req.originalUrl}`,
					method: `${req.method}`,
					ip: `${req.ip}`
				});
				res
					.status(201)
					.location(path.posix.join(req.originalUrl, `/${schedule.id}`))
					.json(scheduleService.serializeSchedule(schedule));
			})
			.catch(next);
	});

scheduleRouter
	.route('/:id')
	.all((req, res, next) => {
		const { id } = req.params;
		const knexInstance = req.app.get('db');
		scheduleService
			.getById(knexInstance, id)
			.then(schedule => {
				if (!schedule) {
					logger.error({
						message: `Schedule with id ${id} not found.`,
						request: `${req.originalUrl}`,
						method: `${req.method}`,
						ip: `${req.ip}`
					});
					return res.status(404).json({
						error: { message: `Schedule Not Found` }
					});
				}
				res.schedule = schedule;
				next();
			})
			.catch(next);
	})
	.get((req, res) => {
		res.json(scheduleService.serializeSchedule(res.schedule));
	})
	.delete((req, res, next) => {
		const { id } = req.params;
		const knexInstance = req.app.get('db');
		scheduleService
			.deleteSchedule(knexInstance, id)
			.then(numRowsAffected => {
				logger.info({
					message: `Schedule with id ${id} deleted.`,
					request: `${req.originalUrl}`,
					method: `${req.method}`,
					ip: `${req.ip}`
				});

				// need to send back message instead of .end()
				res.status(204).json({
					message: true
				});
			})
			.catch(next);
	});

module.exports = scheduleRouter;
