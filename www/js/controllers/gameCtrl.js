angular.module("dozeoudez.controllers")

.controller("GameCtrl", function($scope, Game, $timeout, $ionicModal) {
  var game;

  // TODO move this code to game
  var isWinner = function (team) {
    return team.points >= 12;
  };

  var finishByWinner = function () {
    console.log("#finishByWinner");
    if (isWinner($scope.game.awayTeam) || isWinner($scope.game.homeTeam)) {
      $scope.game.finish();
    }
  };
  //

  $scope.playPause = function () {
    if ($scope.game.status == "running") {
      $scope.game.pause();
    } else {
      $scope.game.start();
    }
  };

  $scope.reset = function () {
    $scope.game = new Game();
  };

  $scope.reset();

  // TODO spec
  Game.current().then(function (game) {
    console.log("current");
    console.log(game);
    if (!game) { return; }
    $scope.game = game;
  });

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
    if ($scope.game.status != "running") { return ; }
    team.points += points;
    $scope.game.save();
    $scope.closeModal();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
});
