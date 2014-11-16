/*jshint expr:true */
var Controller = "GameCtrl";

describe(Controller, function () {

    var $scope, ctrl, Game, $timeout;

    beforeEach(function () {

        module("dozeoudez");

        inject(function ($rootScope, $controller, _Game_, _$timeout_, $httpBackend) {
          Game = _Game_;
          $scope = $rootScope.$new();
          $timeout = sinon.spy(_$timeout_);
          $httpBackend.when("GET", "templates/game.html").respond(null);
          $httpBackend.when("GET", "contact-modal.html").respond(null);
          ctrl = $controller(Controller, {
            $scope: $scope,
            $timeout: $timeout
          });
        });

    });

    it("has a $scope variable", function() {
      expect($scope).to.exist;
    });

    it("assigns a game", function() {
      expect($scope.game).to.be.an.instanceOf(Game);
    });

    describe("#playPause()", function () {

      it("starts the game if it's paused", function () {
        $scope.game.status = "paused";
        $scope.game.start = sinon.spy();
        $scope.playPause();
        expect($scope.game.start).to.have.been.called;
      });

      it("pauses the game if it's runnig", function () {
        $scope.game.status = "running";
        $scope.game.pause = sinon.spy();
        $scope.playPause();
        expect($scope.game.pause).to.have.been.called;
      });
    });

    describe("#reset()", function () {

      it("assigns a new game", function () {
        $scope.game.status = "finished";
        var oldGame = $scope.game;
        $scope.reset();
        expect($scope.game.status).to.equal("paused");
        expect($scope.game).to.not.equal(oldGame);
      });

      it("re-assigns clock", function () {
        $scope.reset();
        expect($scope.clock).to.equal($scope.game.clock);
      });

      it("re-assigns teams", function () {
        $scope.reset();
        expect($scope.homeTeam).to.eq($scope.game.homeTeam);
        expect($scope.awayTeam).to.eq($scope.game.awayTeam);
      });

    });

    describe("#score()", function () {
      beforeEach(function () {
        $scope.game.status = "running";
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
          $scope.game.status = "paused";
        });

        it("does not change number of points made by a team", function () {
          var team = { points: 3 };
          $scope.score(team, 3);
          expect(team.points).to.equal(3);
        });
      });

      context("when match is finished", function () {
        beforeEach(function () {
          $scope.game.status = "finished";
        });

        it("does not change number of points made by a team", function () {
          var team = { points: 10 };
          $scope.score(team, 3);
          expect(team.points).to.equal(10);
        });
      });
    });

    describe("$watch()", function () {
      beforeEach(function () {
        $scope.game.finish = sinon.spy();
      });

      context("when a team has 12 points", function () {
        it("sets the game status to finished", function () {
          $scope.homeTeam.points = 12;
          $scope.$digest();
          expect($scope.game.finish).to.have.been.called;
        });
      });

      context("when a team has more than 12 points", function () {
        it("sets the game status to finished", function () {
          $scope.awayTeam.points = 13;
          $scope.$digest();
          expect($scope.game.finish).to.have.been.called;
        });
      });
    });

});
