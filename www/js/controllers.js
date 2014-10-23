angular.module('dozeoudez.controllers', []).

controller("AddPlayerCtrl", function($scope, $ionicNavBarDelegate) {
  $scope.goBack = function () {
    $ionicNavBarDelegate.back();
  };
  $scope.players = [
    "Kobe",
    "King James",
    "CP3"
  ];
});
