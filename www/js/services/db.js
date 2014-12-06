angular.module("dozeoudez.services")

.factory("db", function (pouchdb, $window) {
  var db = pouchdb.create("dozeoudez");
  $window.db = db;
  return db;
});
