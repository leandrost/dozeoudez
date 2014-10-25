angular.module("dozeoudez.controllers", []).

controller("MatchCtrl", function($scope, $timeout, $ionicModal) {
  $scope.homeTeam = { id: 1, name: "Home", points: 0 };
  $scope.awayTeam = { id: 2, name: "Away", points: 0 };
  $scope.status = "paused";

  $scope.clock = moment().minutes(12).second(0);

  $scope.clockTick = function () {
    $scope.clock.subtract(1, "s");
    var minutes = $scope.clock.get("minute");
    var seconds = $scope.clock.get("second");
    if (minutes === 0 && seconds === 0) {
      $scope.stop();
      $scope.status = "finished";
    } else {
      $scope.timeout = $timeout($scope.clockTick, 1000);
    }
  };

  $scope.start = function() {
    if ($scope.status != "running") {
      $scope.clockTick();
      $scope.status = "running";
    }
  };

  $scope.stop = function() {
    $timeout.cancel($scope.timeout);
    $scope.status = "paused";
  };

  $scope.playPause = function () {
    if ($scope.status != "running") {
      $scope.start();
    } else {
      $scope.stop();
    }
  };

  $scope.reset = function () {
    $scope.stop();
    $scope.clock = moment().minutes(12).second(0);
  };

  $scope.score = function (team, points) {
    team.points += points;
  };

  //modal
  $ionicModal.fromTemplateUrl('contact-modal.html', {
    scope: $scope,
    animation: 'fade-in'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function(team) {
    $scope.modal.team = team;
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

});
