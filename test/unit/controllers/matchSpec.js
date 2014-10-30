/*jshint expr:true */
describe("MatchCtrl", function () {

    var $scope, ctrl, $timeout;

    beforeEach(function () {

        module("dozeoudez");

        // INJECT! This part is critical
        // $rootScope - injected to create a new $scope instance.
        // $controller - injected to create an instance of our controller.
        // $q - injected so we can create promises for our mocks.
        // _$timeout_ - injected to we can flush unresolved promises.
        inject(function ($rootScope, $controller, $q, _$timeout_, $httpBackend) {

          $httpBackend.when('GET', 'templates/match.html').respond(null);
          $httpBackend.when('GET', 'contact-modal.html').respond(null);
            // create a scope object for us to use.
            $scope = $rootScope.$new();

            // assign $timeout to a scoped variable so we can use
            // $timeout.flush() later. Notice the _underscore_ trick
            // so we can keep our names clean in the tests.
            //$timeout = _$timeout_;
            $timeout = sinon.spy(_$timeout_);

            // now run that scope through the controller function,
            // injecting any services or other injectables we need.
            // **NOTE**: this is the only time the controller function
            // will be run, so anything that occurs inside of that
            // will already be done before the first spec.
            ctrl = $controller("MatchCtrl", {
                $scope: $scope,
                $timeout: $timeout
            });
        });

    });

    it("has a $scope variable", function() {
      expect($scope).to.exist;
    });

    it("sets clock default state to 10 minutes", function() {
      expect($scope.clock.format("mm:ss")).to.equal("10:00");
    });

    describe("#clockTick()", function () {
      it("subtracts 1 second from clock", function () {
        $scope.clockTick();
        var clock = $scope.clock;
        expect(clock.get("minute")).to.equal(9);
        expect(clock.get("second")).to.equal(59);
      });

      context("when zero the clock", function () {
        it("sets match status to finished", function () {
          $scope.clock = moment().minute(0).second(1);
          $scope.clockTick();
          expect($scope.status).to.equal("finished");
        });
      });
    });

    describe("#playPause()", function () {
      context("when is paused", function () {
        it("starts the clock", function () {
          $scope.playPause();
          expect($timeout).to.have.been.calledWith($scope.clockTick, 1000);
        });
        it("sets match status to running", function () {
          $scope.playPause();
          expect($scope.status).to.equal("running");
        });
      });

      context("when is running", function () {
        xit("stops clock tick", function () { });

        it("sets match status to paused", function () {
          $scope.status = "running";
          $scope.playPause();
          expect($scope.status).to.equal("paused");
        });
      });
    });

    describe("#reset()", function () {
      it("sets status to paused", function () {
        $scope.status = "finished";
        $scope.reset();
        expect($scope.status).to.equal("paused");
      });

      it("resets the clock to default state", function () {
        var clock = $scope.clock;
        clock.minutes(7).second(35);
        $scope.reset();
        expect(clock.get("minute")).to.equal(10);
        expect(clock.get("second")).to.equal(0);
      });

      it("sets teams score to default state", function () {
        $scope.homeTeam.points = 7;
        $scope.awayTeam.points = 12;
        $scope.reset();
        expect($scope.homeTeam.points).to.eq(0);
        expect($scope.awayTeam.points).to.eq(0);
      });

    });

    describe("#score()", function () {
      beforeEach(function () {
        $scope.status = "running";
        $scope.closeModal = sinon.stub();
      });

      it("adds points to a team", function () {
        var team = { points: 3 };
        $scope.score(team, 2);
        expect(team.points).to.equal(5);
      });

      it("close modal", function () {
        var team = { points: 3 };
        $scope.score(team, 2);
        expect($scope.closeModal).to.have.been.called;
      });

      context("when match is paused", function () {
        beforeEach(function () {
          $scope.status = "paused";
        });

        it("does not change number of points made by a team", function () {
          var team = { points: 3 };
          $scope.score(team, 3);
          expect(team.points).to.equal(3);
        });
      });

      context("when match is finished", function () {
        beforeEach(function () {
          $scope.status = "finished";
        });

        it("does not change number of points made by a team", function () {
          var team = { points: 10 };
          $scope.score(team, 3);
          expect(team.points).to.equal(10);
        });
      });
    });

    describe("$watch()", function () {
      context("when a team has 12 points", function () {
        it("sets match status to finished", function () {
          $scope.awayTeam.points = 7;
          $scope.status = "running";
          $scope.awayTeam.points = 12;
          $scope.$digest();
          expect($scope.status).to.eq("finished");
        });
      });

      context("when a team has more than 12 points", function () {
        it("sets match status to finished", function () {
          $scope.homeTeam.points = 10;
          $scope.status = "running";
          $scope.homeTeam.points = 13;
          $scope.$digest();
          expect($scope.status).to.eq("finished");
        });
      });
    });

});
