angular.module("dozeoudez.services")

.factory("db", function (pouchdb) {
  return pouchdb.create("dozeoudez");
});
