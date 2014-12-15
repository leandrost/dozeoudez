angular.module("dozeoudez.services")

.factory("GameClock", function($timeout) {
  function GameClock(game) {
    var self = this;
    var isTimesUp = function () {
      return self.time.asSeconds() <= 0;
    };

    var stopTimerAndFinishGame = function () {
      game.finish();
      self.stop();
    };

    self.time = moment.duration(10, "minutes");
    self.game = game;
    self.isTimesUp = isTimesUp;

    // TODO spec
    self.refresh = function() {
      var elapsedTime = moment().diff(self.game.startAt, "s");
      if (elapsedTime <= 0) {
        self.time = moment.duration(0, "minutes");
      } else {
        self.time.subtract(elapsedTime, "s");
      }
    };

    self._tick = function _tick () {
      self.time = self.time.subtract(1, "s");
      if(isTimesUp()) {
        stopTimerAndFinishGame();
      }
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
