angular.module("dozeoudez.controllers", []).

controller("MatchCtrl", function($scope, $timeout) {
  $scope.homeTeam = { id: 1, name: "Home", score: 0 };
  $scope.awayTeam = { id: 2, name: "Away", score: 0 };

  $scope.clock = moment().minutes(12).second(0);

  $scope.clockTick = function () {
    $scope.clock.subtract(1, "s");
    $scope.timeout = $timeout($scope.clockTick, 1000);
  };

  $scope.start = function() {
    $scope.clockTick();
  };

  // TODO: spec
  //$scope.stop = function() {
  //  $timeout.cancel($scope.timeout);
  //};
});
