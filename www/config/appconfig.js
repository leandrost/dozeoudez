var environments = {
  development: {
    database: {
      host: "http://localhost",
      port: "5984",
      name: "dozeoudez",
    },
  },
  sandbox: {
    database: {
      host: "http://" + ENV.LOCAL_IP,
      port: "5984",
      name: "dozeoudez",
    },
  },
  production: { },
};

AppConfig = environments[ENV.APP_ENV || "development"];

