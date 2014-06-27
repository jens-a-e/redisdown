var redisLib = require('redis');
var RedisDown = require('../');

var defaultBatchSizeKeys   = RedisDown.defaultBatchSizeKeys;
var defaultBatchSizeValues = RedisDown.defaultBatchSizeValues;

var dbidx = 0

  , location = function () {
      return '_redisdown_test_db_:' + dbidx++;
    }

  , lastLocation = function () {
      return '_redisdown_test_db_:' + dbidx;
    }

  , cleanup = function (callback) {
      RedisDown.reset();
      var client = redisLib.createClient();
      client.del('_redisdown_test_db_', function(e) {
        client.quit();
        RedisDown.reset(callback);
      });
    }

  , setUp = function (t) {
      cleanup(function (err) {
        t.notOk(err, 'cleanup returned an error');
        t.end();
      });
    }
  , setUpSmallBatches = function (t) {
      RedisDown.defaultBatchSizeKeys   = 5;
      RedisDown.defaultBatchSizeValues = 3;
      cleanup(function (err) {
        t.notOk(err, 'cleanup returned an error');
        t.end();
      });
    }

  , tearDown = function (t) {
      RedisDown.defaultBatchSizeKeys   = defaultBatchSizeKeys;
      RedisDown.defaultBatchSizeValues = defaultBatchSizeValues;
      setUp(t); // same cleanup!
    }

  , collectEntries = function (iterator, callback) {
      var data = []
        , next = function () {
            iterator.next(function (err, key, value) {
              if (err) return callback(err);
              if (!arguments.length) {
                return iterator.end(function (err) {
                  callback(err, data);
                });
              }
              data.push({ key: key, value: value });
              process.nextTick(next);
            });
          }
      next();
    };

module.exports = {
    location       : location
  , cleanup        : cleanup
  , lastLocation   : lastLocation
  , setUp          : setUp
  , tearDown       : tearDown
  , collectEntries : collectEntries
  , smallBatches : {
    location         : location
    , cleanup        : cleanup
    , lastLocation   : lastLocation
    , setUp          : setUpSmallBatches
    , tearDown       : tearDown
    , collectEntries : collectEntries
  }
};