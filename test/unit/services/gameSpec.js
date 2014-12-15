/*jshint expr:true */
describe("Game", function () {

    var model, subject, db;

    beforeEach(function () {
      module("dozeoudez");
      module("dozeoudez.services", function ($provide) {
        db = sinon.stub();
        var fakePromise = sinon.stub({ then: function () { } });
        db.post = sinon.stub().returns(fakePromise);
        $provide.value("db", db);
      });

      inject(function(Game) {
        model = Game;
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
        subject.save = sinon.stub();
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
        sinon.useFakeTimers(freezedMoment.toDate().getTime());
        subject.start();
        expect(subject.startAt.toString()).to.equal(freezedMoment.toString());
      });

      it("save game", function () {
        subject.start();
        expect(subject.save).to.have.been.called;
      });

    });
  
    describe("#pause()", function () {
      beforeEach(function () {
        subject.clock.stop = sinon.stub();
        subject.save = sinon.stub();
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

      it("save game", function () {
        subject.pause();
        expect(subject.save).to.have.been.called;
      });
    });

    describe("#finish()", function () {
      beforeEach(function () {
        subject.clock.stop = sinon.stub();
        subject.save = sinon.stub();
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

      it("save game", function () {
        subject.finish();
        expect(subject.save).to.have.been.called;
      });
    });

    describe("#save()", function () {
      var fakePromise;

      beforeEach(function () {
        fakePromise = sinon.stub();
        fakePromise.then = sinon.stub().returns(fakePromise);
        db.post = sinon.stub().returns(fakePromise);
      });

      it("persists a game db fields on database", function () {
        subject.status = "running";
        subject.startAt = moment.parseZone("2014-09-10T20:30:00.000+03:00");
        subject.homeTeam = { points: 7 };
        subject.awayTeam = { points: 2 };
        subject.save();
        expect(db.post).to.have.been.calledWith({
          _id: subject.id,
          _rev: subject.rev,
          status: "running",
          startAt: "2014-09-10T20:30:00+03:00",
          homeTeam: { points: 7 },
          awayTeam: { points: 2 }
        });
      });
      
      it("returns a promise ", function () {
        expect(subject.save()).to.equal(fakePromise);
      });

      xit("sets id and revision", function () {
        subject.id = undefined;
        subject.rev = undefined;
        subject.save();
        expect(subject.id).to.equal("fake-id");
        expect(subject.rev).to.equal("fake-rev");
      });
    });

    describe("#load()", function () {
      it("assigns attributes", function () {
        var fields = {
          status: "finished",
          homeTeam: { points: 10 },
        };
        var game = model.load(fields);
        expect(game.status).to.equal("finished");
        expect(game.homeTeam).to.deep.equal({ points: 10 });
      });
      it("assigns a date field as moment", function () {
        var subject = model.load({ startAt: "2014-10-18T18:45:02" });
        var startAtMoment = moment("2014-10-18T18:45:02");
        expect(subject.startAt.format()).to.deep.equal(startAtMoment.format());
      });

      context("when game is running and times up", function () {
        it("finish the game", function () {
          var freezedMoment = moment("2014-10-18 17:30", "YYYY-MM-DD HH:mm");
          sinon.useFakeTimers(freezedMoment.toDate().getTime());
          var subject = model.load({ status: "running", startAt: "2014-10-18T18:45:02" });
          expect(subject.status).to.equal("finished");
        });
      });
    });

    describe("#clockTime()", function () {
      it("returns clock.time formated", function () {
        subject.clock.time = moment.duration({ minutes: 7, seconds: 2 });
        var clockTime = subject.clockTime();
        expect(clockTime).to.equal("07:02");
      });
    });

});
