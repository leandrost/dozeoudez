/*jshint expr:true */
describe("GameClock", function () {

    var subject;

    beforeEach(function () {
      module("dozeoudez.services");

      inject(function(GameClock, _$timeout_) {
        subject = GameClock;
        $timeout = sinon.spy(_$timeout_);
      });
    });

    it("time is 10:00 by default", function () {
      var time = subject.time;
      expect(time.get("minute")).to.equal(10);
      expect(time.get("second")).to.equal(0);
    });

    describe("#start()", function () {
      it("subtracts 1 second from clock", function () {
        subject.start();
        var time = subject.time;
        expect(time.get("minute")).to.equal(9);
        expect(time.get("second")).to.equal(59);
      });
      it("initiates the timer", function () {
        subject.start();
        expect($timeout).to.have.been.calledWith(subject._tick, 1000);
      });
    });

    describe("#stop()", function () {
      it("initiates the timer", function () {
        $timeout.cancel = sinon.spy($timeout.cancel);
        subject.stop();
        expect($timeout.cancel).to.have.been.calledWith($timeout);
      });
    });
});
