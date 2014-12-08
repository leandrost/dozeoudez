angular.module("dozeoudez.services")

.factory("db", function (pouchdb, $window) {
  var db = pouchdb.create("dozeoudez");
  PouchDB.replicate('dozeoudez', 'http://localhost:5984/dozeoudez', {live: true});
  $window.db = db;
  return db;
});
