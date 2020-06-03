const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

function makeUsersArray() {
	return [
		{
			id: 1,
			username: 'test-user-1',
			password: 'password',
			fullname: 'Test user 1',
			date_created: new Date('2029-01-22T16:28:32.615Z'),
		},
		{
			id: 2,
			username: 'test-user-2',
			password: 'password',
			fullname: 'Test user 2',
			date_created: new Date('2029-01-22T16:28:32.615Z'),
		},
		{
			id: 911,
			username: 'test-user-3',
			password: 'has-no-schedule',
			fullname: 'Test user 3',
			date_created: new Date('2029-01-22T16:28:32.615Z'),
		},
	];
}

function makeSessionsArray() {
	return [
		{
			track: 'Business',
			day: 'tue',
			date: '2019-08-06T00:00:00.000Z',
			time_start: '14:45:00',
			time_end: '15:15:00',
			location: 'Osceola 1 - 3',
			id: 'BUS04',
			name: 'FileMaker in Action  Custom Apps for Manufacturing and Warehouses',
			description:
				"In this session, we'll cover topics that relate well to the manufacturing/warehouse space. First, two approaches to inventory; one easy-to-implement solution with unstored calcs, and a more complex solution using static fields with scripted amount updates. Next, we'll go over the creation of labels for the warehouse and how we've used automation to save a LOT of time, including taking a 60 or 90 minute process per shipment down to 30 to 60 seconds. Optionally, as time permits in the session, we will cover some of the practicalities of using FileMaker in a warehouse space.",
			background:
				'Attendees should have a basic understanding of one to many relationships, calculation fields, and global fields.',
			objective_1: 'An easy approach to inventory using calculation fields',
			objective_2:
				'A more complex approach to inventory using script updates to static fields',
			objective_3:
				'Label creation within FileMaker to save a lot of time (looping is key)',
			objective_4: 'Practicalities of FileMaker in a warehouse space',
			speaker: 'Bradley Boggs (Chameleon Like, Inc.)',
		},
		{
			track: 'Create',
			day: 'wed',
			date: '2019-08-07T00:00:00.000Z',
			time_start: '16:15:00',
			time_end: '17:15:00',
			location: 'Osceola D',
			id: 'CRE12',
			name: 'Intent-Driven Design: Storytelling Through Visual Narratives',
			description:
				"Have you heard about storytelling in UX and how it improves usability and engagement? User intent is a starting point of a successful dialogue, and clear communication doesn't always have to be verbal. It must be concise and accessible. In this session, we will elaborate on the essence of good design: simplicity and familiarity. You will learn how to take these simple principles to demonstrate examples of visual narratives that reflect users' intent. We will be visiting a variety of user scenarios, visual elements, and interface building blocks, and learn how to sequence them to create workflows with a clear purpose and a sense of progress.",
			background: 'No prerequisites.',
			objective_1:
				'How to improve usability and engagement through visual storytelling',
			objective_2: 'What makes up good design',
			objective_3:
				'How to take simple principles to demonstrate examples of visual narratives that reflect users intent',
			objective_4:
				'How to create sequences and workflows to demonstrate purpose and a sense of progress',
			speaker: 'Chih Hsiao, Esther Kim',
		},
	];
}

function makeCommentsArray(users, sessions) {
	return [
		{
			id: 1,
			rating: 2,
			comment: 'First test comment!',
			session_id: 'BUS04',
			user_id: 1,
		},
		{
			id: 2,
			rating: 3,
			comment: 'Second test review!',
			session_id: 'BUS04',
			user_id: 1,
		},
		{
			id: 3,
			rating: 1,
			comment: 'Third test review!',
			session_id: 'CRE12',
			user_id: 2,
		},
		{
			id: 4,
			rating: 5,
			comment: 'Fourth test review!',
			session_id: 'CRE12',
			user_id: 2,
		},
	];
}

function makeScheduleArray(users, sessions) {
	return [
		{
			id: 1,
			session_id: sessions[0].id,
			user_id: users[0].id,
		},
		{
			id: 2,
			session_id: sessions[1].id,
			user_id: users[0].id,
		},
	];
}

// sessions
function makeExpectedSession(session) {
	return {
		id: session.id,
		session_id: session.id,
		track: session.track,
		day: session.day,
		date: session.date,
		time_start: session.time_start,
		time_end: session.time_end,
		location: session.location,
		name: session.name,
		description: session.description,
		background: session.background,
		objective_1: session.objective_1,
		objective_2: session.objective_2,
		objective_3: session.objective_3,
		objective_4: session.objective_4,
		speaker: session.speaker,
	};
}

// schedule + session join table
function makeExpectedSchedule(userId, schedule, testSessions = []) {
	const session = testSessions.find(
		(session) => session.id === schedule.session_id
	);

	return {
		id: schedule.id,
		schedule_id: schedule.id,
		user_id: schedule.user_id,
		session_id: session.id,
		track: session.track,
		day: session.day,
		date: session.date,
		time_start: session.time_start,
		time_end: session.time_end,
		location: session.location,
		name: session.name,
		description: session.description,
		background: session.background,
		objective_1: session.objective_1,
		objective_2: session.objective_2,
		objective_3: session.objective_3,
		objective_4: session.objective_4,
		speaker: session.speaker,
	};
}

// session + comments + users join table
function makeExpectedSessionComments(comment, testUsers) {
	const user = testUsers.find((user) => user.id === comment.user_id);

	return {
		id: comment.id,
		user_id: comment.user_id,
		comment: comment.comment,
		rating: String(comment.rating),
		session_id: comment.session_id,
		fullname: user.fullname,
	};
}

function makeExpectedComment(comment) {
	return {
		id: comment.id,
		comment: comment.comment,
		rating: comment.rating,
		session_id: comment.id,
		user_id: comment.user_id,
	};
}

//  users can add/update/delete Comments
// pass in testUsers[0], testSessions[0]
function makeMaliciousComment() {
	const maliciousComment = {
		id: 911,
		user_id: 1,
		session_id: 'BUS04',
		comment: 'Naughty naughty very naughty <script>alert("xss");</script>',
		rating: 1,
	};

	const expectedComment = {
		...maliciousComment,
		comment:
			'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
	};
	return {
		maliciousComment,
		expectedComment,
	};
}

function makeFixtures() {
	const testUsers = makeUsersArray();
	const testSessions = makeSessionsArray();
	const testComments = makeCommentsArray(testUsers, testSessions);
	const testSchedules = makeScheduleArray(testUsers, testSessions);
	return { testUsers, testSessions, testComments, testSchedules };
}

// sessions_id is a user generated text string
function cleanTables(db) {
	return db.transaction((trx) =>
		trx.raw(`TRUNCATE comments RESTART IDENTITY CASCADE;
	TRUNCATE schedule  RESTART IDENTITY CASCADE;
	TRUNCATE sessions  RESTART IDENTITY CASCADE;
	TRUNCATE users RESTART IDENTITY CASCADE;`)
	);
}

// to bcrypt passwords
function seedUsers(db, users) {
	const preppedUsers = users.map((user) => ({
		...user,
		password: bcrypt.hashSync(user.password, 1),
	}));
	return db
		.into('users')
		.insert(preppedUsers)
		.then(() => {
			// update the auto sequence to stay in sync
			db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id]);
		});
}

function seedTables(db, users, sessions, comments = [], schedule = []) {
	return seedUsers(db, users)
		.then(() => db.into('sessions').insert(sessions))
		.then(() => comments.length && db.into('comments').insert(comments))
		.then(() => schedule.length && db.into('schedule').insert(schedule));
}

function makeAuthHeader(user, secret = config.JWT_SECRET) {
	const token = jwt.sign({ user_id: user.id }, secret, {
		subject: user.username,
		expiresIn: config.JWT_EXPIRY,
		algorithm: 'HS256',
	});

	return `Bearer ${token}`;
}

module.exports = {
	makeUsersArray,
	makeSessionsArray,
	makeCommentsArray,
	makeScheduleArray,

	makeExpectedComment,
	makeExpectedSession,
	makeExpectedSessionComments,
	makeExpectedSchedule,

	makeMaliciousComment,

	makeFixtures,
	cleanTables,
	seedTables,
	// seedMaliciousComment,
	makeAuthHeader,
	seedUsers,
};
