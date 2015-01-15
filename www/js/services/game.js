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

    var play = function () {
      if (self.clock.isTimesUp()) {
        self.finish();
        return;
      }
      self.clock.start();
      self.status = STATUSES.running;
    };

    var refreshClock = function () {
      var now = moment();
      var updatedAt =  self.updatedAt || self.startedAt;
      var diffSeconds = now.diff(updatedAt, "s");
      self.clock.time.subtract(diffSeconds, "s");
    };

    var public = {
      //TODO: spec
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
      start: function () {
        console.log("start");
        if (!self.startedAt) {
          self.startedAt = moment();
        }
        play();
        self.save();
      },
      resume: function () {
        if (self.isNotRunning()) { return; }
        refreshClock();
        play();
      },
      pause: function () {
        console.log("pause");
        self.clock.stop();
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
      //TODO: move
      _touch_dates: function () {
        self.createdAt = self.createdAt || moment();
        self.updatedAt = moment();
      },
      //TODO: move
      _save: function (obj) {
        var putOrPost = self.id ? db.put : db.post;
        self._touch_dates();
        return putOrPost(obj).
          then(setIdAndRevision).
          catch(function (err) { console.error(err); });
      },
      //TODO: move
      save: function () {
        console.log("#save");
        var obj = self.toJSON();
        return self._save(obj)
      },
      //TODO: spec
      isRunning: function () { return self.status == "running"; },
      //TODO: spec
      isNotRunning: function () { return !self.isRunning(); },
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
      emit(doc.startedAt);
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
