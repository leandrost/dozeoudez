angular.module("dozeoudez.controllers", ["dozeoudez.services"]).

controller("MatchCtrl", function($scope, $timeout, $ionicModal) {
  $scope.homeTeam = { id: 1, name: "Home", points: 0 };
  $scope.awayTeam = { id: 2, name: "Away", points: 0 };
  $scope.status = "paused";
  $scope.clock = moment();

  var start = function() {
    if ($scope.status == "running") { return; }
    $scope.status = "running";
    $scope.clockTick();
  };

  var pause = function() {
    stopClock();
    $scope.status = "paused";
  };

  var finish = function () {
    stopClock();
    $scope.status = "finished";
  };

  var stopClock = function () {
    $timeout.cancel($scope.timeout);
  };

  var clockTimeIsZero = function (clock) {
    var minutes = clock.get("minute");
    var seconds = clock.get("second");
    return (minutes === 0 && seconds === 0);
  };

  var resetClock = function () {
    $scope.clock.minutes(10).second(0);
  };

  var isWinner = function (team) {
    return team.points >= 12;
  };

  var finishiByWinner = function () {
    if (isWinner($scope.awayTeam) || isWinner($scope.homeTeam)) {
      finish();
    }
  };

  resetClock();

  $scope.$watch("homeTeam.points", finishiByWinner, true);
  $scope.$watch("awayTeam.points", finishiByWinner, true);

  $scope.clockTick = function () {
    $scope.clock.subtract(1, "s");
    $scope.timeout = $timeout($scope.clockTick, 1000);
    if (clockTimeIsZero($scope.clock)) {
      finish();
    }
  };

  $scope.playPause = function () {
    if ($scope.status != "running") {
      start();
    } else {
      pause();
    }
  };

  $scope.reset = function () {
    pause();
    resetClock();
    $scope.homeTeam.points = 0;
    $scope.awayTeam.points = 0;
  };

  //modal
  $ionicModal.fromTemplateUrl("contact-modal.html", {
    scope: $scope,
    animation: "fade-in"
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function(team) {
    $scope.modal.team = team;
    $scope.modal.show();
  };

  $scope.score = function (team, points) {
    if ($scope.status != "running") { return ; }
    team.points += points;
    $scope.closeModal();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

});
