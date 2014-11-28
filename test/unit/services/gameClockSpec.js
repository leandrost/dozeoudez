/*jshint expr:true */
describe("GameClock", function () {

    var subject, $timeout, game;

    beforeEach(function () {
      module("dozeoudez");
      module("dozeoudez.services", function ($provide) {
        $timeout = sinon.stub();
        $timeout.cancel = sinon.stub();
        $provide.value("$timeout", $timeout);
      });

      inject(function(GameClock, Game) {
        game = new Game();
        subject = new GameClock(game);
        game.clock = subject;
      });
    });

    it("time is 10:00 by default", function () {
      var time = subject.time;
      expect(time.get("minute")).to.equal(10);
      expect(time.get("second")).to.equal(0);
    });

    it("belongs to a game", function () {
      expect(subject.game).to.eq(game);
    });

    describe("#start()", function () {
      it("subtracts 1 second from time", function () {
        subject.start();
        var time = subject.time;
        expect(time.get("minute")).to.equal(9);
        expect(time.get("second")).to.equal(59);
      });
      it("subtracts 1 second every 1 seconds", function () {
        subject.start();
        expect($timeout).to.have.been.calledWith(subject._tick, 1000);
      });
      it("sets timer with $timeout", function () {
        var timer = "dummy timeout";
        $timeout.returns(timer);
        subject.start();
        expect(subject.timer).to.equal(timer);
      });

      context("when times up", function () {
        beforeEach(function () {
          subject.time.minutes(0).seconds(1);
        });

        it("finishes the game", function () {
          subject.start();
          expect(game.status).to.equal("finished");
        });
        it("stops the clock", function () {
          sinon.stub(subject, "stop");
          subject.start();
          expect(subject.stop).to.have.been.called;
        });
      });
    });

    describe("#stop()", function () {
      it("cancels timer", function () {
        subject.timer = "dummy timeout";
        subject.stop();
        expect($timeout.cancel).to.have.been.calledWith(subject.timer);
      });
    });
});
