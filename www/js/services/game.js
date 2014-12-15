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
    self.homeTeam = { points: 0 };
    self.awayTeam = { points: 0 };
    self.clock = new GameClock(self);

    var setIdAndRevision = function(response){
      self.id = response.id;
      self.rev = response.rev;
      self._rev = response.rev;
    };

    var parseToDoc = function (obj) {
      var doc = { _id: obj.id, _rev: obj.rev };
      console.log(doc);
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
        console.log(7);
        console.log(self);
        self.save();
      },
      resume: function () {
        self.clock.refresh();
        if (self.isRunning()) {
          if (self.clock.isTimesUp()) {
            self.status = STATUSES.finished;
          } else {
            self.start();
          }
        }
        console.log(8);
        console.log(self);
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
        console.log(10);
        console.log(self.id);
        var doc = parseToDoc(self);
        console.log(doc);
        var putOrPost = self.id ? db.put : db.post;
        return putOrPost(doc).then(setIdAndRevision).catch(function (err) {
          console.log(err);
        });
      },
      isRunning: function () {
        return self.status == "running";
      },
      clockTime: function () {
        return moment.utc(self.clock.time.asMilliseconds()).format("mm:ss");
      },
    };

    _.extend(this, public);

    return this;
  }

  // TODO spec
  Game.current = function () {
    var lastGame = function (doc) {
      emit(doc);
    };
    var returnGame = function (response) {
      if (response.rows.length === 0) {
        return null;
      }
      return Game.load(response.rows[0].key);
    };
    return db.query(lastGame, { limit: 1 }).then(returnGame);
  };

  // TODO spec
  Game.load = function (attrs) {
    var game = new Game();
    attrs.startAt = moment(attrs.startAt);
    attrs.id = attrs._id;
    attrs.rev = attrs._rev;
    _.extend(game, attrs);
    game.clock = new GameClock(game);
    game.resume();
    return game;
  };

  return Game;
});
