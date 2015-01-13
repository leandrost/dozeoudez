/*jshint expr:true */
describe("Game", function () {

    var model, subject, db, fakePromise;

    beforeEach(function () {
      module("dozeoudez");

      inject(function(Game) {
        model = Game;
        subject = new Game();
        subject.clock.start = sinon.stub();
        fakePromise = {};
        var catchObj = { catch: function () { return fakePromise; } };
        var thenObj = { then: function () { return catchObj; } };
        subject._save = sinon.stub().returns(thenObj);
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

      context("with attributes", function () {
        it("assigns attributes", function () {
          var fields = {
            status: "finished",
            homeTeam: { points: 10 },
          };
          var subject = new model(fields);
          expect(subject.status).to.equal("finished");
          expect(subject.homeTeam).to.deep.equal({ points: 10 });
        });
        it("assigns a date field as moment", function () {
          var subject = new model({ startAt: "2014-10-18T18:45:02" });
          var startAtMoment = moment("2014-10-18T18:45:02");
          expect(subject.startAt.format()).to.deep.equal(startAtMoment.format());
        });

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

      beforeEach(function () {
        subject.db = sinon.stub();
        fakePromise = {};
        var catchObj = { catch: function () { return fakePromise; } };
        var thenObj = { then: function () { return catchObj; } };
        subject.db.post = sinon.stub().returns(thenObj);
      });

      it("persists a game db fields onn database", function () {
        subject.status = "running";
        subject.startAt = moment.parseZone("2014-09-10T20:30:00.000+03:00");
        subject.homeTeam = { points: 7 };
        subject.awayTeam = { points: 2 };
        subject.save();
        expect(subject._save).to.have.been.calledWith(subject.toJSON());
      });

      it("returns a promise ", function () {
        expect(subject.save()).to.equal(fakePromise);
      });
    });

    describe("#score()", function () {
      beforeEach(function () {
        subject.status = "running";
      });

      it("adds points to a team", function () {
        var team = { points: 3 };
        subject.score(team, 2);
        expect(team.points).to.equal(5);
      });

      context("when game is paused", function () {
        beforeEach(function () {
          subject.status = "paused";
        });

        it("does not change number of points made by a team", function () {
          var team = { points: 3 };
          subject.score(team, 3);
          expect(team.points).to.equal(3);
        });
      });

      context("when game is finished", function () {
        beforeEach(function () {
          subject.status = "finished";
        });

        it("does not change number of points made by a team", function () {
          var team = { points: 10 };
          subject.score(team, 3);
          expect(team.points).to.equal(10);
        });
      });

      context("when the team has 12 points", function () {
        it("finishes the game", function () {
          var team = subject.homeTeam;
          team.points = 10;
          subject.finish = sinon.stub();
          subject.score(team, 2);
          expect(subject.finish).to.have.been.called;
        });
      });

      context("when the team has more than 12 points", function () {
        it("finishes the game", function () {
          var team = subject.awayTeam;
          team.points = 10;
          subject.finish = sinon.stub();
          subject.score(team, 3);
          expect(subject.finish).to.have.been.called;
        });
      });
    });

    describe("#resume", function () {
      it("refreshs the clock time from start time", function () {
        var freezedMoment = moment("2014-10-18 19:30:00", "YYYY-MM-DD HH:mm");
        sinon.useFakeTimers(freezedMoment.toDate().getTime());
        var attrs = {
          status: "running",
          clock: { time: "00:09:59"},
          startAt: "2014-10-18 19:27:41",
        };
        subject.play = sinon.stub();
        subject = new model(attrs);
        subject.resume();
        expect(subject.clock.toString()).to.equal("07:39");
      });

      context("when game was paused", function () {
        it.only("refreshs the clock time from resume time", function () {
          var freezedMoment = moment("2014-10-18 19:30:00", "YYYY-MM-DD HH:mm");
          sinon.useFakeTimers(freezedMoment.toDate().getTime());
          var attrs = {
            status: "running",
            clock: { time: "00:09:50"},
            startAt: "2014-10-18 19:27:41",
            resumedAt: "2014-10-18 19:29:00",
          };
          subject.play = sinon.stub();
          subject = new model(attrs);
          subject.resume();
          expect(subject.clock.toString()).to.equal("08:50");
        });
      });

      it("sets resumedAt with current momment", function () {
        var now = moment();
        sinon.useFakeTimers(now.toDate().getTime());
        subject.resume();
        expect(subject.resumedAt.toDate()).to.deep.equal(now.toDate());
      });

      context("when game is running and times up", function () {
        it("finishes the game", function () {
          var freezedMoment = moment("2014-10-18 19:30", "YYYY-MM-DD HH:mm");
          sinon.useFakeTimers(freezedMoment.toDate().getTime());
          var subject = new model({
            status: "running",
            startAt: "2014-10-18T18:45:02",
            clock: { time: "00:09:59"},
          });
          subject.resume();
          expect(subject.status).to.equal("finished");
        });
      });
    });

});
