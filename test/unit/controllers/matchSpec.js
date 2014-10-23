describe("MatchCtrl", function () {

    var $scope, ctrl, $timeout;

    beforeEach(function () {

        module("dozeoudez");

        // INJECT! This part is critical
        // $rootScope - injected to create a new $scope instance.
        // $controller - injected to create an instance of our controller.
        // $q - injected so we can create promises for our mocks.
        // _$timeout_ - injected to we can flush unresolved promises.
        inject(function ($rootScope, $controller, $q, _$timeout_) {

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

    it("set clock by default with 12 minutes remaing", function() {
      expect($scope.clock.format("mm:ss")).to.equal("12:00");
    });

    describe("#clockTick()", function () {
      it("subtract 1 second from clock", function () {
        $scope.clockTick();
        expect($scope.clock.format("mm:ss")).to.equal("11:59");
      });
    });

    describe("#start()", function () {
      it("start clock tick", function () {
        $scope.start();
        expect($timeout).to.have.been.calledWith($scope.clockTick, 1000);
      });
    });

});
