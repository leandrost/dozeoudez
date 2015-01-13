angular.module("dozeoudez.services")

.factory("GameClock", function($timeout) {
  function GameClock(game, attrs) {
    var self = this;
    var defaultTime = moment.duration(10, "minutes");
    attrs = attrs || {};

    var time = moment.duration(attrs.time || { minutes: 10 });
    self.time = time;
    self.game = game;

    var isTimesUp = function () {
      return self.time.asSeconds() <= 0;
    };

    self.isTimesUp = isTimesUp;

    self._tick = function _tick () {
      if(isTimesUp()) {
        game.finish();
        return;
      }
      self.time = self.time.subtract(1, "s");
      self.timer = $timeout(self._tick, 1000); //how to test that ?
    };

    self.start = function () {
      self._tick();
    };

    self.stop = function () {
      $timeout.cancel(self.timer);
    };

    self.toString = function () {
      var ms = self.time.asMilliseconds();
      return moment(ms).format("mm:ss");
    };

    self.toJSON = function () {
      return { time:  "00:" + self.toString() };
    };

  }
  return GameClock;
});
