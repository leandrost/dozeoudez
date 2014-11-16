angular.module("dozeoudez.services")

.factory("GameClock", function($timeout) {
  function GameClock(game) {
    var self = this;
    var time = moment().minutes(10).seconds(0);

    var isTimesUp = function () {
      var minute = time.get("minute");
      var second = time.get("second");
      return (minute === 0 && second === 0);
    };

    var stopTimerAndFinishGame = function () {
      game.finish();
      self.stop();
    };

    self.time = time;
    self.game = game;

    self._tick = function _tick () {
      time = time.subtract(1, "s");
      if(isTimesUp()) {
        stopTimerAndFinishGame();
      }
      self.timer = $timeout(self._tick, 1000); //what to test that ?
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
