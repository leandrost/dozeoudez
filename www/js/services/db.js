angular.module("dozeoudez.services")

.factory("db", function (pouchDB, $window, $injector) {
  var config = AppConfig.database;
  var syncURL = config.host + ":" + config.port + "/" + config.name;
  var db = pouchDB(config.name);
  db.Sync = db.sync(syncURL, {live: true, retry: true});

  $window.db = db;

  db.schema =  {
    "Game": {
      attributes: {
        status: { default: "paused" },
        startedAt: { type: "Moment", default: null },
        finishedAt: { type: "Moment", default: null },
        createdAt: { type: "Moment", default: null },
        updatedAt: { type: "Moment", default: null },
        homeTeam: { default: { points: 0 } },
        awayTeam: { default: { points: 0 } },
      },
      associations: {
        clock: "GameClock",
      }
    }
  };

  var defaultSchema = {
    _id: { default: null },
    _rev: { default: null },
    createdAt: { type: "Moment", default: null },
    updatedAt: { type: "Moment", default: null },
  };

  db.load = function (type, obj, attrs) {
    obj.schema = db.schema[type];
    _.extend(obj.schema.attributes, { type: { default: type } }, defaultSchema);
    attrs = attrs || {};
    loadAttributes(obj, attrs);
    loadAssociations(obj, attrs);
  };

  var loadAttributes = function (obj, attrs) {
    var schema = obj.schema;
    _.forIn(schema.attributes, function (schema, field) {
      obj[field] = parseAttribute(schema, attrs[field]);
    });
    obj.id = obj._id;
    obj.rev = obj._rev;
  };

  var parseAttribute = function (schema, value) {
    if (schema.type == "Moment") {
      value = value ? moment(value) : schema.default;
    }
    return value || schema.default;
  };

  var loadAssociations = function (obj, attrs) {
    var schema = obj.schema;
    _.forIn(schema.associations, function (schema, field) {
      var assoc = $injector.get("GameClock");
      obj[field] = new assoc(obj, attrs[field]);
    });
  };

  return db;
});
