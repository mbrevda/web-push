'use strict';

const assert = require('assert');
const webPush = require('../src/index');
const vapidHelper = require('../src/vapid-helper');

const VALID_AUDIENCE = 'https://example.com';
const VALID_SUBJECT_MAILTO = 'mailto: example@example.com';
const VALID_SUBJECT_URL = 'https://exampe.com/contact';
const VALID_PUBLIC_KEY = new Buffer(65);
const VALID_PRIVATE_KEY = new Buffer(32);
const VALID_EXPIRATION = Math.floor(Date.now() / 1000) + (60 * 60 * 12);

suite('Test Vapid Helpers', function() {
  test('is defined', function() {
    assert(webPush.generateVAPIDKeys);
  });

  test('generate vapid keys', function() {
    const keys = webPush.generateVAPIDKeys();
    assert(keys.privateKey);
    assert(keys.publicKey);

    assert.equal(keys.privateKey instanceof Buffer, true);
    assert.equal(keys.publicKey instanceof Buffer, true);

    assert.equal(keys.privateKey.length, 32);
    assert.equal(keys.publicKey.length, 65);
  });

  test('generate new vapid keys between calls', function() {
    const keys = webPush.generateVAPIDKeys();
    assert(keys.privateKey);
    assert(keys.publicKey);

    const secondKeys = webPush.generateVAPIDKeys();
    assert.notEqual(keys.privateKey, secondKeys.privateKey);
    assert.notEqual(keys.publicKey, secondKeys.publicKey);
  });

  test('should throw errors on bad input', function() {
    const badInputs = [
      function() {
        // No args
        vapidHelper.getVapidHeaders();
      },
      function() {
        // Missing subject, public key, private key
        vapidHelper.getVapidHeaders(VALID_AUDIENCE);
      },
      function() {
        // Missing public key, private key
        vapidHelper.getVapidHeaders(VALID_AUDIENCE, VALID_SUBJECT_MAILTO);
      },
      function() {
        // Missing public key, private key
        vapidHelper.getVapidHeaders(VALID_AUDIENCE, VALID_SUBJECT_URL);
      },
      function() {
        // Missing private key
        vapidHelper.getVapidHeaders(VALID_AUDIENCE, VALID_SUBJECT_MAILTO, VALID_PUBLIC_KEY);
      },
      function() {
        vapidHelper.getVapidHeaders('Not a URL', VALID_SUBJECT_MAILTO, VALID_PUBLIC_KEY, VALID_PRIVATE_KEY);
      },
      function() {
        vapidHelper.getVapidHeaders(VALID_AUDIENCE, 'Some Random String', VALID_PUBLIC_KEY, VALID_PRIVATE_KEY);
      },
      function() {
        vapidHelper.getVapidHeaders(VALID_AUDIENCE, VALID_SUBJECT_MAILTO, 'Example key', VALID_PRIVATE_KEY);
      },
      function() {
        vapidHelper.getVapidHeaders(VALID_AUDIENCE, VALID_SUBJECT_MAILTO, Buffer.alloc(5), VALID_PRIVATE_KEY);
      },
      function() {
        vapidHelper.getVapidHeaders(VALID_AUDIENCE, VALID_SUBJECT_MAILTO, VALID_PUBLIC_KEY, 'Example Key');
      },
      function() {
        vapidHelper.getVapidHeaders(VALID_AUDIENCE, VALID_SUBJECT_MAILTO, VALID_PUBLIC_KEY, Buffer.alloc(5));
      },
      function() {
        vapidHelper.getVapidHeaders({ something: 'else' }, VALID_SUBJECT_MAILTO, VALID_PUBLIC_KEY, VALID_PRIVATE_KEY);
      },
      function() {
        vapidHelper.getVapidHeaders(VALID_AUDIENCE, { something: 'else' }, VALID_PUBLIC_KEY, VALID_PRIVATE_KEY);
      }
    ];

    badInputs.forEach(function(badInput, index) {
      assert.throws(function() {
        badInput();
        console.log('Bad Input Test Failed on test: ', index);
      });
    });
  });

  test('should get valid VAPID headers', function() {
    const validInputs = [
      function() {
        return vapidHelper.getVapidHeaders(VALID_AUDIENCE, VALID_SUBJECT_URL,
          VALID_PUBLIC_KEY, VALID_PRIVATE_KEY);
      },
      function() {
        return vapidHelper.getVapidHeaders(VALID_AUDIENCE, VALID_SUBJECT_MAILTO,
          VALID_PUBLIC_KEY, VALID_PRIVATE_KEY);
      },
      function() {
        return vapidHelper.getVapidHeaders(VALID_AUDIENCE, VALID_SUBJECT_URL,
          VALID_PUBLIC_KEY, VALID_PRIVATE_KEY, VALID_EXPIRATION);
      }
    ];

    validInputs.forEach(function(validInput, index) {
      try {
        const headers = validInput();
        assert(headers.Authorization);
        assert(headers['Crypto-Key']);
      } catch (err) {
        console.warn('Valid input call for getVapidHeaders() threw an ' +
          'error. [' + index + ']');
        throw err;
      }
    });
  });
});
