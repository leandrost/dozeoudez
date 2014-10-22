angular.module('starter.controllers', []).

controller("MatchCtrl", function($scope) {
  $scope.homeTeam = { id: 1, name: "Home", score: 0 };
  $scope.awayTeam = { id: 2, name: "Away", score: 0 };
  $scope.clock = "00:00";
})
.controller("AddPlayerCtrl", function($scope, $ionicNavBarDelegate) {
  $scope.goBack = function () {
    $ionicNavBarDelegate.back();
  };
  $scope.players = [
    "Kobe",
    "King James",
    "CP3"
  ];
});
