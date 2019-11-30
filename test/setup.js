process.env.TZ = 'UCT';

require('dotenv').config();

const { expect } = require('chai');
const supertest = require('supertest');

global.expect = expect;
global.supertest = supertest;
