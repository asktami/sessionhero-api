const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
	return [
		{
			id: 1,
			username: 'test-user-1',
			password: 'password',
			fullname: 'Test user 1',
			date_created: new Date('2029-01-22T16:28:32.615Z')
		},
		{
			id: 2,
			username: 'test-user-2',
			password: 'password',
			fullname: 'Test user 2',
			date_created: new Date('2029-01-22T16:28:32.615Z')
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
			id: 1,
			rating: 2,
			text: 'First test comment!',
			session_id: sessions[0].id,
			user_id: users[0].id,
			date_created: new Date('2029-01-22T16:28:32.615Z')
		},
		{
			id: 2,
			rating: 3,
			text: 'Second test review!',
			session_id: sessions[0].id,
			user_id: users[1].id,
			date_created: new Date('2029-01-22T16:28:32.615Z')
		},
		{
			id: 3,
			rating: 1,
			text: 'Third test review!',
			session_id: sessions[1].id,
			user_id: users[0].id,
			date_created: new Date('2029-01-22T16:28:32.615Z')
		},
		{
			id: 4,
			rating: 5,
			text: 'Fourth test review!',
			session_id: sessions[1].id,
			user_id: users[1].id,
			date_created: new Date('2029-01-22T16:28:32.615Z')
		}
	];
}

function makeScheduleArray(users, sessions) {
	return [
		{
			id: 1,
			session_id: sessions[0].id,
			user_id: users[0].id,
			date_created: new Date('2029-01-22T16:28:32.615Z')
		},
		{
			id: 2,
			session_id: sessions[1].id,
			user_id: users[0].id,
			date_created: new Date('2029-01-22T16:28:32.615Z')
		},
		{
			id: 3,
			session_id: sessions[2].id,
			user_id: users[0].id,
			date_created: new Date('2029-01-22T16:28:32.615Z')
		},
		{
			id: 4,
			session_id: sessions[0].id,
			user_id: users[1].id,
			date_created: new Date('2029-01-22T16:28:32.615Z')
		},
		{
			id: 5,
			session_id: sessions[1].id,
			user_id: users[1].id,
			date_created: new Date('2029-01-22T16:28:32.615Z')
		},
		{
			id: 6,
			session_id: sessions[2].id,
			user_id: users[1].id,
			date_created: new Date('2029-01-22T16:28:32.615Z')
		}
	];
}

// sessions + comments + users join table
function makeExpectedSession(sessions, comments = [], users = []) {
	const user = users.find(user => user.id === comments.user_id);

	const sessionComments = comments.filter(
		comment => comment.session_id === sessions.id
	);

	const number_of_comments = comments.filter(
		comment => comment.session_id === sessions.id
	).length;

	const average_comment_rating = calculateAverageReviewRating(sessionComments);

	return {
		id: sessions.id,
		date_created: sessions.date_created,
		track: sessions.track,
		day: sessions.day,
		date: sessions.date,
		time_start: sessions.time_start,
		time_end: sessions.time_end,
		location: sessions.location,
		name: sessions.name,
		description: sessions.description,
		background: sessions.background,
		objective_1: sessions.objective_1,
		objective_2: sessions.objective_2,
		objective_3: sessions.objective_3,
		objective_4: sessions.objective_4,
		speaker: sessions.speaker,
		number_of_comments,
		average_comment_rating,
		user: {
			id: user.id,
			username: user.username,
			fullname: user.fullname,
			date_created: user.date_created.toISOString()
		}
	};
}

// schedule table
// pass in testSessions[0], testUsers[0]
function makeExpectedSchedule(session, user) {
	return {
		id: schedule.id,
		user_id: user_id,
		session_id: session_id
	};
}

function calculateAverageReviewRating(comments) {
	if (!comments.length) return 0;

	const sum = comments.map(comment => comment.rating).reduce((a, b) => a + b);

	return Math.round(sum / comments.length);
}

// session + comments + users join table
function makeExpectedSessionComments(users, sessionId, comments) {
	const expectedComments = comments.filter(
		comment => comment.session_id === sessionId
	);

	return expectedComments.map(comment => {
		const commentUser = users.find(user => user.id === comment.user_id);

		return {
			id: comment.id,
			text: comment.text,
			rating: comment.rating,
			date_created: comment.date_created.toISOString(),
			user: {
				id: commentUser.id,
				username: commentUser.username,
				fullname: commentUser.fullname,
				date_created: commentUser.date_created.toISOString(),
				date_modified: commentUser.date_modified || null
			}
		};
	});
}

//  users can only add/update/delete Comments
// pass in testUsers[0], testSessions[0]
function makeMaliciousComment(user, session) {
	const maliciousComment = {
		id: 911,
		user_id: user.id,
		session_id: session.id,
		date_created: new Date(),
		text: 'Naughty naughty very naughty <script>alert("xss");</script>',
		rating: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
	};

	const expectedComment = {
		...makeExpectedComment(user, session, maliciousComment),
		text:
			'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
		rating: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
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

function cleanTables(db) {
	return db.raw(
		`TRUNCATE
		comments,
		schedule,
		sessions,
		users,
      RESTART IDENTITY CASCADE`
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
		.then(() =>
			// update the auto sequence to stay in sync
			db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
		);
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

// with bcrypt passwords
// pass in testUsers[0], maliciousComment
function seedMaliciousComment(db, user, comment) {
	return seedUsers(db, [user]).then(() =>
		db.into('comments').insert([comment])
	);
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
	const token = jwt.sign({ user_id: user.id }, secret, {
		subject: user.username,
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
	seedMaliciousComment,
	makeAuthHeader,
	seedUsers
};
