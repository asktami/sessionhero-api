const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

function makeUsersArray() {
	return [
		{
			id: 1,
			username: 'test-user-1',
			password: 'password',
			fullname: 'Test user 1'
		},
		{
			id: 2,
			username: 'test-user-2',
			password: 'password',
			fullname: 'Test user 2'
		},
		{
			id: 911,
			username: 'test-user-3',
			password: 'has-no-schedule',
			fullname: 'Test user 3'
		}
	];
}

function makeSessionsArray() {
	return [
		{
			track: 'Business',
			day: 'tue',
			date: '8/6/2019',
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
			speaker: 'Bradley Boggs (Chameleon Like, Inc.)'
		},
		{
			track: 'Create',
			day: 'wed',
			date: '8/7/2019',
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
			speaker: 'Chih Hsiao, Esther Kim'
		},
		{
			track: 'FBA',
			day: 'wed',
			date: '8/7/2019',
			time_start: '14:45:00',
			time_end: '15:45:00',
			location: 'Osceola 1 - 3',
			id: 'FBA04',
			name: 'DIY Digital Marketing',
			description:
				"Gartner Research predicted that by 2017 CMOs would spend more than CIOs on technology. We're well past that transition and see increasing responsibility for marketers. Today, it's all about customer experience; the lines are totally blurred between new and existing customers. Without a big agency and a lot of expertise, how do you grow your business and manage the demands of your day job, all while paying attention to social media, your blog, and more? Learn the concepts and technologies in digital marketing, and leave with a concrete roadmap for putting it to work for your business.",
			background:
				"You won't need a big background in marketing, but leading a product or service team, or running a business, will be helpful context for you.",
			objective_1:
				'Why digital marketing is important, and how it differs from traditional marketing',
			objective_2:
				'What are the tools, technologies, and terms? PPC, SEM, SEO, and so on',
			objective_3: 'How to measure results',
			objective_4:
				'Get a road map, scaled for your team and resources, that allows you to tackle digital marketing pragmatically',
			speaker: 'Scott Love (Codence)'
		},
		{
			track: 'General',
			day: 'tue',
			date: '8/6/2019',
			time_start: '17:30:00',
			time_end: '18:30:00',
			location: 'Wreckers',
			id: 'GEN14',
			name: 'FileMaker Pub Trivia',
			description:
				'Join your peers and the FileMaker team for an interactive FileMaker trivia quiz. Test your knowledge, have fun, and win swag.',
			background: '',
			objective_1: '',
			objective_2: '',
			objective_3: '',
			objective_4: '',
			speaker: 'FileMaker Staff'
		},
		{
			track: 'Integrate',
			day: 'tue',
			date: '8/6/2019',
			time_start: '14:45:00',
			time_end: '15:45:00',
			location: 'Osceola D',
			id: 'INT20',
			name: 'FileMaker and Peripherals',
			description:
				'You can enhance your custom apps created for iOS by using hardware peripherals that fit with FileMaker. Peripherals can add features to your app like: payment processing, bluetooth-based printing, RFcode scanning, NFC scanning,1D/2D barcode scanning, encrypted payment capture, AR, and more! This session will introduce you to examples of these peripherals and walk you through how your FileMaker app on an iOS device can communicate with peripherals so that you can take advantage of these advanced features. This session will also help you envision how peripherals can take your FileMaker Go apps to the next level.',
			background: 'Experience creating FileMaker apps.',
			objective_1: 'Introduction to peripherals that work with FileMaker Go',
			objective_2: 'How peripherals can enhance your FileMaker Go custom apps',
			objective_3:
				'Learn how FileMaker apps and peripherals speak to each other',
			objective_4:
				'Be inspired by real-world examples of FileMaker apps working with peripherals',
			speaker: 'Cris Ippolite (iSolutions)'
		},
		{
			track: 'Share',
			day: 'thu',
			date: '8/8/2019',
			time_start: '14:45:00',
			time_end: '15:45:00',
			location: 'Osceola B',
			id: 'SHA09',
			name: 'Branding Your Own FileMaker Admin Console',
			description:
				'The FileMaker Admin API allows an unparalleled amount of access towards customizing your own admin console interface.',
			background: 'No prerequisites.',
			objective_1:
				'How the FileMaker Admin API can be used to create client-specific web apps',
			objective_2:
				'Modular deployment of a console to enable or disable services',
			objective_3:
				'Discussion on the value-added prospect of the FileMaker Admin API',
			objective_4:
				"Making a web app 'Super Admin' control panel for FileMaker Servers",
			speaker: 'Mike Beargie (MainSpring, Inc.)'
		},
		{
			track: 'Training Day',
			day: 'mon',
			date: '8/5/2019',
			time_start: '9:00:00',
			time_end: '16:30:00',
			location: 'Osceola 1 - 3',
			id: 'TRA08',
			name: 'JavaScript for FileMaker Developers',
			description:
				"JavaScript is natively supported in all parts of the FileMaker Platform. The first part of this course is focused on scope, variables, and functions, connecting those concepts to your existing FileMaker skills.\n\rThe day will be packed. We'll explore a lot, and have a good time.",
			background:
				'You dont need to know any JavaScript, so come only with your FileMaker skills.',
			objective_1: 'The basics of the JavaScript language',
			objective_2:
				'The peculiarities of the web viewer object on different operating systems',
			objective_3:
				'How to integrate full JavaScript libraries into your custom app',
			objective_4:
				'How to communicate back and forth between FileMaker and JavaScript without refreshing the web viewer',
			speaker: 'Jeremy Brown (Geist Interactive)'
		},
		{
			track: 'Vendor Session',
			day: 'thu',
			date: '8/8/2019',
			time_start: '12:45:00',
			time_end: '13:15:00',
			location: 'Sun Ballroom',
			id: 'VEN09',
			name: 'Say What!?',
			description:
				'Since the beginning of time the ability to  communicate effectively has been one of the most vital necessities and cherished skills in both, personal and professional development. Whether you are an introvert, extrovert, in-house or consulting professional, every single one of us communicates with someone at some point in the day.',
			background: '',
			objective_1: '',
			objective_2: '',
			objective_3: '',
			objective_4: '',
			speaker: 'Brandon Hayes (Kalos Consulting Inc.)'
		}
	];
}

function makeCommentsArray(users, sessions) {
	return [
		{
			rating: 2,
			comment: 'First test comment!',
			session_id: sessions[0].id,
			user_id: users[0].id
		},
		{
			rating: 3,
			comment: 'Second test review!',
			session_id: sessions[0].id,
			user_id: users[1].id
		},
		{
			rating: 1,
			comment: 'Third test review!',
			session_id: sessions[1].id,
			user_id: users[0].id
		},
		{
			rating: 5,
			comment: 'Fourth test review!',
			session_id: sessions[1].id,
			user_id: users[1].id
		}
	];
}

function makeScheduleArray(users, sessions) {
	return [
		{
			session_id: sessions[0].id,
			user_id: users[0].id
		},
		{
			session_id: sessions[1].id,
			user_id: users[0].id
		},
		{
			session_id: sessions[2].id,
			user_id: users[0].id
		},
		{
			session_id: sessions[0].id,
			user_id: users[1].id
		},
		{
			session_id: sessions[1].id,
			user_id: users[1].id
		},
		{
			session_id: sessions[2].id,
			user_id: users[1].id
		}
	];
}

// convert date from YYYY-MM-DD to MM-DD-YYYY
function convertDate(dateStr) {
	return Intl.DateTimeFormat('en-US').format(new Date(dateStr));
}

// sessions
function makeExpectedSession(session) {
	return {
		id: session.id,
		session_id: session.id,
		track: session.track,
		day: session.day,
		date: new Date(session.date),
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
		speaker: session.speaker
	};
}

// schedule table
// pass in testUsers[0], testSessions[0], testSchedules[0]
function makeExpectedSchedule(schedule, user, session) {
	return {
		id: schedule.id,
		user_id: user.id,
		session_id: session.id
	};
}

function calculateAverageReviewRating(comments) {
	if (!comments.length) return 0;

	const sum = comments.map(comment => comment.rating).reduce((a, b) => a + b);

	return Math.round(sum / comments.length);
}

// session + comments + users join table
function makeExpectedSessionComments(user, session, comment) {
	return {
		user_id: user.id,
		comment: comment.comment,
		rating: comment.rating,
		session_id: session.id,
		fullname: user.fullname
	};
}

function makeExpectedComment(comment) {
	console.log('------- inside helper makeExpectedComment comment = ', comment);
	return {
		id: comment.id,
		comment: comment.comment,
		rating: comment.rating,
		session_id: comment.id,
		user_id: comment.user_id
	};
}

//  users can only add/update/delete Comments
// pass in testUsers[0], testSessions[0]
function makeMaliciousComment() {
	const maliciousComment = {
		id: 911,
		user_id: 1,
		session_id: 'BUS04',
		comment: 'Naughty naughty very naughty <script>alert("xss");</script>',
		rating: 1
	};

	const expectedComment = {
		...maliciousComment,
		comment:
			'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;'
	};
	return {
		maliciousComment,
		expectedComment
	};
}

function makeFixtures() {
	const testUsers = makeUsersArray();
	const testSessions = makeSessionsArray();
	const testComments = makeCommentsArray(testUsers, testSessions);
	const testSchedules = makeScheduleArray(testUsers, testSessions);
	return { testUsers, testSessions, testComments, testSchedules };
}

// sessions_id is a user generated comment string

function cleanTables(db) {
	return db.transaction(trx =>
		trx.raw(`TRUNCATE comments RESTART IDENTITY CASCADE;
	TRUNCATE schedule  RESTART IDENTITY CASCADE;
	TRUNCATE sessions  RESTART IDENTITY CASCADE;
	TRUNCATE users RESTART IDENTITY CASCADE;`)
	);
}

// to bcrypt passwords
function seedUsers(db, users) {
	const preppedUsers = users.map(user => ({
		...user,
		password: bcrypt.hashSync(user.password, 1)
	}));
	return db
		.into('users')
		.insert(preppedUsers)
		.then(() => {
			// update the auto sequence to stay in sync
			db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id]);
		});
}

// with bcrypt passwords
// update the auto sequence to match the forced id values
// only insert comments if there are some, also update the sequence counter

function seedTables(db, users, sessions, comments = [], schedule = []) {
	return seedUsers(db, users)
		.then(() => db.into('sessions').insert(sessions))
		.then(() => comments.length && db.into('comments').insert(comments))
		.then(() => schedule.length && db.into('schedule').insert(schedule));
}

// // with bcrypt passwords
// // pass in testUsers[0], maliciousComment
// function seedMaliciousComment(db, user, comment) {
// 	return seedUsers(db, [user]).then(() =>
// 		db.into('comments').insert([comment])
// 	);
// }

function makeAuthHeader(user, secret = config.JWT_SECRET) {
	const token = jwt.sign({ user_id: user.id }, secret, {
		subject: user.username,
		expiresIn: config.JWT_EXPIRY,
		algorithm: 'HS256'
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
	seedUsers
};
