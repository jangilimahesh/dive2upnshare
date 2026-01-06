function bar(p) {
  const f = Math.floor(p / 10);
  return "█".repeat(f) + "░".repeat(10 - f);
}

module.exports = { bar };