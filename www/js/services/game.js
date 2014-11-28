angular.module("dozeoudez.services")

.factory("Game", function(GameClock, db) {
  var STATUSES = {
    paused: "paused",
    running: "running",
    finished: "finished"
  };

  function Game() {
    this.startAt = null;
    this.status = STATUSES.paused;
    this.clock = new GameClock(this);
    this.homeTeam = { points: 0 };
    this.awayTeam = { points: 0 };
  }

  var parseToDoc = function (obj) {
    var doc = {};
    _.each(obj.dbFields, function(field) {
      var value = obj[field];
      if (moment.isMoment(value)){
        doc[field] = value.format();
      } else {
        doc[field] = value;
      }
    });
    return doc;
  };

  var parseType = function (value) {
    if (value instanceof moment) {
      value = value.format();
    }
    return value;
  };

  Game.STATUSES = STATUSES;

  Game.prototype = {
    dbFields: ["status", "startAt", "homeTeam", "awayTeam"],
    start: function () {
      this.startAt = moment();
      this.status = STATUSES.running;
      this.clock.start();
    },
    pause: function () {
      this.clock.stop();
      this.status = STATUSES.paused;
    },
    finish: function () {
      this.clock.stop();
      this.status = STATUSES.finished;
    },
    save: function () {
      var doc = parseToDoc(this);
      db.put(doc);
    }
  };

  return Game;
});
