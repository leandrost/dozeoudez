angular.module("dozeoudez.services")

.factory("db", function (pouchdb, $window, $injector) {
  var config = AppConfig.database;
  var dbName = config.name;
  var dbSyncURL = config.host + ":" + config.port + "/" + dbName;
  var db = pouchdb.create(dbName);
  PouchDB.sync(dbName, dbSyncURL, {live: true, retry: true});

  $window.db = db;

  var schemas = {
    "Game": {
      attributes: {
        status: { default: "paused" },
        startAt: { type: "Moment", default: null },
        pausedAt: { type: "Moment", default: null },
        finishedAt: { type: "Moment", default: null },
        resumedAtAt: { type: "Moment", default: null },
        homeTeam: { default: { points: 0 } },
        awayTeam: { default: { points: 0 } },
      },
      associations: {
        clock: "GameClock",
      }
    }
  };

  db.load = function (type, obj, attrs) {
    var schema = schemas[type];
    attrs = attrs || {};
    obj.id = attrs._id || null;
    obj.rev = attrs._rev || null;
    loadAttributes(schema, obj, attrs);
    loadAssociations(schema, obj, attrs);
  };

  var loadAttributes = function (schema, obj, attrs) {
    _.forIn(schema.attributes, function (schema, field) {
      obj[field] = parseAttribute(schema, attrs[field]);
    });
  };

  var parseAttribute = function (schema, value) {
    if (schema.type == "Moment") {
      value = value ? moment(value) : schema.default;
    }
    return value || schema.default;
  };

  var loadAssociations = function (schema, obj, attrs) {
    _.forIn(schema.associations, function (schema, field) {
      var assoc = $injector.get("GameClock");
      obj[field] = new assoc(obj, attrs[field]);
    });
  };

  return db;
});
