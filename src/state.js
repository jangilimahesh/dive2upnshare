let memory = [];

function save(job) {
  const i = memory.findIndex(j => j.fileId === job.fileId);
  if (i === -1) memory.push(job);
  else memory[i] = job;
}

function exists(fileId) {
  return memory.find(j => j.fileId === fileId && j.status === "uploaded");
}

function stats() {
  return {
    total: memory.length,
    uploaded: memory.filter(j => j.status === "uploaded").length
  };
}

module.exports = { save, exists, stats };