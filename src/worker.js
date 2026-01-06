const queue = require("./queue");

setInterval(() => {
  if (!queue.running && !queue.paused && queue.tasks.length > 0) {
    queue.run();
  }
}, 3000);