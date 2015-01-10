angular.module("dozeoudez.services")

.factory("db", function (AppConfig, pouchdb, $window) {
  var db = pouchdb.create("dozeoudez");
  $window.db = db;
  PouchDB.sync("dozeoudez", AppConfig.dbHost + AppConfig.database, {live: true, retry: true});

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
    //loadAssociations(schema, obj, attrs);
  };

  var loadAttributes = function (schema, obj, attrs) {
    _.each(schema.attributes, function (attribute) {
      console.log(attribute);
      obj[attribute] = parseAttribute(attribute, attrs[attribute]);
    });
  };

  var parseAttribute = function (schema, value) {
    if (schema.type == "Moment") {
      value = moment(value);
    }
    return value || schema.default;
  };

  return db;
});
