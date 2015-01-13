angular.module("dozeoudez.services")

.factory("Game", function(GameClock, db) {
  function Game(attrs) {
    var self = this;

    var STATUSES = {
      paused: "paused",
      running: "running",
      finished: "finished"
    };

    var MAX_POINTS = 12;

    function init() {
      db.load("Game", self, attrs);
    }

    var setIdAndRevision = function(response){
      self.id = response.id;
      self._id = response.id;
      self.rev = response.rev;
      self._rev = response.rev;
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
      dbFields: [
        "status",
        "startAt",
        "pausedAt",
        "finishedAt",
        "resumedAt",
        "homeTeam",
        "clock",
        "awayTeam"
      ],
      toJSON: function () {
        var doc = { _id: self.id, _rev: self.rev };
        _.each(self.dbFields, function(field) {
          var value = self[field];
          if (!value) { return; }
          if (value.toJSON){
            doc[field] = value.toJSON();
          } else if (moment.isMoment(value)){
            doc[field] = value.format();
          } else {
            doc[field] = value;
          }
        });
        return doc;
      },
      play: function () {
        if (self.clock.isTimesUp()) {
          self.finish();
          return;
        }
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
        if (self.isRunning()) {
          self.refreshClock();
          self.play();
        }
        self.resumedAt = moment();
      },
      pause: function () {
        console.log("pause");
        self.clock.stop();
        self.pausedAt = moment();
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
      _save: function (obj) {
        var putOrPost = self.id ? db.put : db.post;
        return putOrPost(obj);
      },
      save: function () {
        console.log("#save");
        var obj = self.toJSON();
        return self._save(obj)
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
      refreshClock: function () {
        var now = moment();
        var time =  self.resumedAt || self.startAt;
        var diffFromStart = now.diff(time, "s");
        console.log(0);
        console.log(self.resumedAt.toDate());
        console.log(now.toDate());
        console.log(diffFromStart);
        self.clock.time.subtract(diffFromStart, "s");
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
    init();

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
      return new Game(response.rows[0].doc);
    };

    return db.query(lastGame,
                    { descending: true, limit: 1, include_docs: true }
                   ).then(returnGame);
  };

  return Game;
});
