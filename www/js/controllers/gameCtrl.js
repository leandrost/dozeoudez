angular.module("dozeoudez.controllers")

.controller("GameCtrl", function($scope, Game, $timeout, $ionicModal) {
  var game;

  var isWinner = function (team) {
    return team.points >= 12;
  };

  var finishByWinner = function () {
    if (isWinner($scope.awayTeam) || isWinner($scope.homeTeam)) {
      game.finish();
    }
  };

  $scope.$watch("homeTeam.points", finishByWinner, true);
  $scope.$watch("awayTeam.points", finishByWinner, true);

  $scope.playPause = function () {
    if (game.status == "running") {
      game.pause();
    } else {
      game.start();
    }
  };

  $scope.reset = function () {
    game = new Game();
    $scope.game = game;
    $scope.homeTeam = game.homeTeam;
    $scope.awayTeam = game.awayTeam;
    $scope.clock = game.clock;
  };

  $scope.reset();

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
    if (game.status != "running") { return ; }
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
