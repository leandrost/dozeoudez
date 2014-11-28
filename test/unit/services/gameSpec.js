/*jshint expr:true */
describe.only("Game", function () {

    var subject, db;

    beforeEach(function () {
      module("dozeoudez");
      module("dozeoudez.services", function ($provide) {
        db = sinon.stub();
        $provide.value("db", db);
      });

      inject(function(Game) {
        subject = new Game();
        subject.clock.start = sinon.stub();
      });
    });

    describe("Constructor", function () {
      it("#status is paused", function () {
        expect(subject.status).to.equal("paused");
      });
      it("#startAt is null", function () {
        expect(subject.startAt).to.equal(null);
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

      it("sets startAt to now", function () {
        var freezedMoment = moment("2010-10-20 4:30", "YYYY-MM-DD HH:mm");
        moment = sinon.stub().returns(freezedMoment);
        subject.start();
        expect(subject.startAt).to.equal(freezedMoment);
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

    //WIP
    describe.only("#save()", function () {
      beforeEach(function () {
        db.put = sinon.stub();
      });

      it.only("persist game saveable attributes on database", function () {
        subject.status = "running";
        subject.startAt = moment("2010-10-20 10:30", "YYYY-MM-DD HH:mm");
        subject.homeTeam = { points: 7 };
        subject.awayTeam = { points: 2 };
        subject.save();
        expect(db.put).to.have.been.calledWith({
          status: "running",
          startAt: "2010-10-20TZ19:30",
          homeTeam: { points: 7 },
          awayTeam: { points: 2 }
        });
      });

    });

});
