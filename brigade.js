const { events, Job } = require("brigadier");

events.on("push", function(e, project) {
  var driver = project.secrets.DOCKER_DRIVER || "overlay"

// Build and push a Docker image.
  const docker = new Job("dind", "docker:stable-dind")
  docker.privileged = true;
  docker.env = {
    DOCKER_DRIVER: driver
  }
  docker.tasks = [
    "dockerd-entrypoint.sh &",
    "sleep 20",
    "cd /src",
    "docker pull deis/kashti:canary || true",
    "docker build -t deis/kashti:canary ."
  ];

// If a Docker user is specified, we push.
  if (project.secrets.DOCKER_USER) {
    docker.env.DOCKER_USER = project.secrets.DOCKER_USER
    docker.env.DOCKER_PASS = project.secrets.DOCKER_PASS
    docker.env.DOCKER_REGISTRY = project.secrets.DOCKER_REGISTRY
    docker.tasks.push("docker login -u $DOCKER_USER -p $DOCKER_PASS $DOCKER_REGISTRY")
    docker.tasks.push("docker push deis/kashti:canary")
  } else {
    console.log("skipping push. DOCKER_USER is not set.");
  }
  var job = new Job("print", "alpine:3.4")
  job.tasks = [
    "echo revision " + e.revision.commit
  ]

  job.run()
})
