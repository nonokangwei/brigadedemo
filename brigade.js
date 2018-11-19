const { events } = require("brigadier");

events.on("push", function(e, project) {
  var job = new Job("print", "alpine:3.4")
  job.tasks = [
    "echo revision " + e.revision.commit
  ]

  job.run()
})
