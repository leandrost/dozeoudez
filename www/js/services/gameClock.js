angular.module("dozeoudez.services")

.factory("GameClock", function($timeout) {
  function GameClock(game) {
    var self = this;
    var time = moment.duration(10, "minutes");


    var isTimesUp = function () {
      var minutes = time.minutes();
      var seconds = time.seconds();
      return (minutes === 0 && seconds === 0);
    };

    var stopTimerAndFinishGame = function () {
      game.finish();
      self.stop();
    };

    self.time = time;
    self.game = game;
    self.isTimesUp = isTimesUp;

    var calculateLeftTime = function() {
      var elapsedTime = moment().diff(self.game.startAt, "s");
      if (elapsedTime > time.seconds()) {
        time = moment.duration(0, "minutes");
        return;
      }
      time.subtract(elapsedTime, "s");
    };

    if (game.startAt) {
      calculateLeftTime();
    }

    self._tick = function _tick () {
      time = time.subtract(1, "s");
      console.log("********************************************************************************");
      console.log(time);
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
