angular.module("dozeoudez.services")
.factory("GameClock", function($timeout) {
  function GameClock() {
    var time = moment().minutes(10).seconds(0);

    this.time = time;

    this._tick = function _tick () {
      time = time.subtract(1, "s");
    };

    this.start = function () {
      this._tick();
      $timeout(this._tick, 1000);
    };

    this.stop = function () {
      $timeout.cancel($timeout);
    };
  }
  return GameClock;
});
