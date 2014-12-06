angular.module("dozeoudez.services")

.factory("Game", function(GameClock, db) {
  function Game() {

    var STATUSES = {
      paused: "paused",
      running: "running",
      finished: "finished"
    };

    var self = this;

    self.startAt = null;
    self.status = STATUSES.paused;
    self.clock = new GameClock(self);
    self.homeTeam = { points: 0 };
    self.awayTeam = { points: 0 };
    
    var setIdAndRevision = function(response){
      self.id = response.id;
      self.rev = response.rev;
    };

    var parseToDoc = function (obj) {
      var doc = { _id: obj.id, _rev: obj.rev };
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

    var public = {
      dbFields: ["status", "startAt", "homeTeam", "awayTeam"],
      start: function () {
        self.startAt = moment();
        self.clock.start();
        self.status = STATUSES.running;
        self.save();
      },
      pause: function () {
        self.clock.stop();
        self.status = STATUSES.paused;
        self.save();
      },
      finish: function () {
        self.clock.stop();
        self.status = STATUSES.finished;
        self.save();
      },
      save: function () {
        var doc = parseToDoc(self);
        return db.post(doc).then(setIdAndRevision);
      }
    };

    _.extend(this, public);

    return this;
  }

  // TODO spec
  Game.current = function () {
    var runningGame = function (doc) {
      if (doc.status == "running") {
        emit(doc);
      }
    };
    var returnGame = function (response) {
      if (response.rows.length == 0) {
        return null;
      }
      var game = new Game();
      _.extend(game, response.rows[0].key);
      return game;
    };
    return db.query(runningGame, { limit: 1 }).then(returnGame);
  };

  return Game;
});
