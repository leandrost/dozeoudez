angular.module("dozeoudez.services")

.factory("db", function (pouchdb, $window) {
  var db = pouchdb.create("dozeoudez");
  $window.db = db;
  PouchDB.sync("dozeoudez", "http://192.168.1.2:5984/dozeoudez", {live: true, retry: true});
  return db;
});
