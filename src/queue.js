class Queue {
  constructor() {
    this.tasks = [];
    this.running = false;
    this.paused = false;
  }

  add(task) {
    this.tasks.push(task);
    this.run();
  }

  async run() {
    if (this.running || this.paused || this.tasks.length === 0) return;
    this.running = true;

    const task = this.tasks.shift();
    try {
      await task();
    } catch (e) {
      console.error("Task error:", e.message);
    }

    this.running = false;
    this.run();
  }
}

module.exports = new Queue();