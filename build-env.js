var fs = require("fs");

fs.writeFile("env.js", "ENV = " + JSON.stringify(process.env) + ";", function(err) {
  console.log("Saving app configuration...");
  if(err) {
    console.log(err);
  }
  console.log("DONE!");
});
