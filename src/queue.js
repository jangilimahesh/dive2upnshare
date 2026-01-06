class Queue {
  constructor() {
    this.tasks = [];
    this.running = false;
  }

  add(task) {
    this.tasks.push(task);
    this.run();
  }

  async run() {
    if (this.running || this.tasks.length === 0) return;
    this.running = true;

    const task = this.tasks.shift();
    try {
      await task();
    } catch (e) {
      console.error("Queue error:", e.message);
    }

    this.running = false;
    this.run();
  }
}

module.exports = new Queue();