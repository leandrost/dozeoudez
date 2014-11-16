/*jshint expr:true */
describe("Game", function () {

    var subject;

    beforeEach(function () {
      module('dozeoudez.services');
      inject(function(Game) {
        subject = new Game();
        subject.clock.start = sinon.stub();
      });
    });

    describe("new", function () {
      it("#status is paused", function () {
        expect(subject.status).to.equal("paused");
      });
      it("#start_at is null", function () {
        expect(subject.start_at).to.equal(null);
      });
      it("#homeTeam points is zero", function () {
        expect(subject.homeTeam.points).to.equal(0);
      });
      it("#awayTeam points is zero", function () {
        expect(subject.awayTeam.points).to.equal(0);
      });
    });

    describe("#start()", function () {
      beforeEach(function () {
        subject.clock.start = sinon.stub();
      });

      it("starts the clock", function () {
        subject.start();
        expect(subject.clock.start).to.have.been.called;
      });

      it("sets status to running", function () {
        subject.start();
        expect(subject.status).to.equal("running");
      });

      it("sets start_at to now", function () {
        var freezedMoment = moment("2010-10-20 4:30", "YYYY-MM-DD HH:mm");
        moment = sinon.stub().returns(freezedMoment);
        subject.start();
        expect(subject.start_at).to.equal(freezedMoment);
      });
    });

    describe("#pause()", function () {
      beforeEach(function () {
        subject.clock.stop = sinon.stub();
      });

      it("stops the clock", function () {
        subject.pause();
        expect(subject.clock.stop).to.have.been.called;
      });

      it("sets status to paused", function () {
        subject.status = "running";
        subject.pause();
        expect(subject.status).to.equal("paused");
      });
    });

    describe("#finish()", function () {
      beforeEach(function () {
        subject.clock.stop = sinon.stub();
      });

      it("stops the clock", function () {
        subject.finish();
        expect(subject.clock.stop).to.have.been.called;
      });

      it("sets status to paused", function () {
        subject.status = "running";
        subject.finish();
        expect(subject.status).to.equal("finished");
      });
    });
});
