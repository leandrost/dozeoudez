angular.module("dozeoudez.services")

.factory("GameClock", function($timeout) {
  function GameClock(game) {
    var defaultTime = moment.duration(10, "seconds");
    var self = this;

    // TODO spec
    var leftTime = function() {
      var elapsedTime = game.elapsedTime();
      if (elapsedTime >= defaultTime.asSeconds()) {
        return moment.duration(0, "minutes");
      }
      return defaultTime.subtract(elapsedTime, "s");
    };

    self.time = game.startAt ? leftTime() : defaultTime;
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

  }
  return GameClock;
});
