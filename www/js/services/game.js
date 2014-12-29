angular.module("dozeoudez.services")

.factory("Game", function(GameClock, db) {
  function Game() {

    var STATUSES = {
      paused: "paused",
      running: "running",
      finished: "finished"
    };

    var MAX_POINTS = 12;

    var self = this;

    self.startAt = null;
    self.finishedAt = null;
    self.status = STATUSES.paused;
    self.homeTeam = { points: 0 };
    self.awayTeam = { points: 0 };
    self.clock = new GameClock(self);

    var setIdAndRevision = function(response){
      console.log(response);
      self.id = response.id;
      self._id = response.id;
      self.rev = response.rev;
      self._rev = response.rev;
    };

    var parseToDoc = function (obj) {
      var doc = { _id: obj.id, _rev: obj.rev };
      _.each(obj.dbFields, function(field) {
        var value = obj[field];
        if (!value) { return; }
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

    var elapsedSecondsFrom = function (time) {
      return time.diff(self.startAt, "s");
    };

    var public = {
      dbFields: ["status", "startAt", "pausedAt", "finishedAt", "homeTeam", "awayTeam"],
      play: function () {
        self.clock.start();
        self.status = STATUSES.running;
      },
      start: function () {
        console.log("start");
        if (!self.startAt) {
          self.startAt = moment();
        }
        self.play();
        self.save();
      },
      resume: function () {
        console.log("resume");
        if (self.isRunning()) {
          if (self.clock.isTimesUp()) {
            self.finish();
          } else {
            self.play();
          }
        }
      },
      pause: function () {
        console.log("pause");
        self.clock.stop();
        self.pausedAt = moment();
        console.log(self.elapsedTime());
        self.status = STATUSES.paused;
        self.save();
      },
      finish: function () {
        console.log("finish");
        self.clock.stop();
        self.finishedAt = moment();
        self.status = STATUSES.finished;
        self.save();
      },
      save: function () {
        console.log("#save");
        var doc = parseToDoc(self);
        var putOrPost = self.id ? db.put : db.post;
        return putOrPost(doc)
        .then(setIdAndRevision)
        .catch(function (err) {
          console.log("#save err");
          console.error(err);
          console.log(self);
        });
      },
      isRunning: function () {
        return self.status == "running";
      },
      clockTime: function () {
        return moment.utc(self.clock.time.asMilliseconds()).format("mm:ss");
      },
      elapsedTime: function () {
        if (!self.pausedAt && !self.startAt) {
          return 0;
        }
        var now = moment();
        return elapsedSecondsFrom(self.pausedAt || now);
      },
      score: function (team, points) {
        if (self.status != "running") { return ; }
        team.points += points;
        if (team.points >= MAX_POINTS) {
          self.finish();
          return;
        }
        self.save();
      },
    };

    _.extend(this, public);

    return this;
  }

  // TODO spec
  Game.current = function () {
    console.log("#current");
    var lastGame = function (doc) {
      emit(doc.startAt);
    };

    var returnGame = function (response) {
      console.log("#returnGame");
      if (response.rows.length === 0) {
        return null;
      }
      return Game.load(response.rows[0].doc);
    };

    return db.query(lastGame,
                    { descending: true, limit: 1, include_docs: true }
                   ).then(returnGame);
  };

  // TODO spec
  Game.load = function (attrs) {
    attrs.startAt = moment(attrs.startAt);
    attrs.pausedAt = moment(attrs.pausedAt);
    attrs.id = attrs._id;
    attrs.rev = attrs._rev;
    var game = new Game();
    _.extend(game, attrs);
    game.clock = new GameClock(game);
    game.resume();
    return game;
  };

  return Game;
});
