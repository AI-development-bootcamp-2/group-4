'use strict';

// helpers/index.js — barrel

const string = require('./string/string.helpers');
const date   = require('./date/date.helpers');
const array  = require('./array/array.helpers');
const crypto = require('./crypto/crypto.helpers');
const object = require('./object/object.helpers'); // does not exist

module.exports = { ...string, ...date, ...array, ...crypto, ...object };
