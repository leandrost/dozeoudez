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
      db.changes({ since: "now", include_docs: true, live: true }).on('change', function(change) {
        console.log(change);
        var needReload = isNew && change.doc.status == "finished";
        if (change.deleted || needReload) return;
        console.log("reload");
        db.load("Game", self, change.doc);
        self.resume();
      });
    }

    var isNew = function () {
      return self.id === null;
    };

    var setIdAndRevision = function(response){
      self.id = response.id;
      self._id = response.id;
      self.rev = response.rev;
      self._rev = response.rev;
    };

    var hasAWinner =  function () {
      try {
        return (self.homeTeam.points >= MAX_POINTS ||
                self.awayTeam.points >= MAX_POINTS);
      } catch (e) {
        return false;
      }
    };

    var hasFinished = function () {
      try {
        return self.clock.isTimesUp() || hasAWinner();
      } catch (e) {
        return false;
      }
    };

    var play = function () {
      if (hasFinished()) {
        self.finish();
        return;
      }
      self.clock.start();
      self.status = STATUSES.running;
    };

    var refreshClock = function () {
      var now = moment();
      console.log(now.toString());
      var updatedAt = self.updatedAt || self.startedAt;
      if (!updatedAt) return;
      console.log(updatedAt.toString());
      var diffSeconds = now.diff(updatedAt, "s");
      console.log(diffSeconds);
      console.log(self.clock.toString());
      self.clock.time.subtract(diffSeconds, "s");
      console.log("refreshed Clock:", self.clock.toString());
    };

    var public = {
      toJSON: function () {
        var doc = { };
        var attrs = _.keys(self.schema.attributes);
        _.each(attrs, function(attr) {
          var value = self[attr];
          if (!value) { return; }
          if (value.toJSON){
            doc[attr] = value.toJSON();
          } else if (moment.isMoment(value)){
            doc[attr] = value.format();
          } else {
            doc[attr] = value;
          }
        });
        doc.clock = self.clock.toJSON();
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
      _touch: function () {
        self.createdAt = self.createdAt || moment();
        self.updatedAt = moment();
      },
      //TODO: move
      _save: function (obj) {
        console.log("saving object", obj);
        var putOrPost = self.id ? db.put(obj) : db.post(obj);
        return putOrPost.
          then(setIdAndRevision).
          catch(function (err) { console.log(err.stack); });
      },
      //TODO: move
      save: function () {
        console.log("#save");
        self._touch();
        var obj = self.toJSON();
        return self._save(obj);
      },
      //TODO: spec
      isRunning: function () { return (self.status == "running"); },
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
