const { MongoClient } = require("mongodb");

let memory = new Map();
let collection = null;

async function init(uri) {
  if (!uri) return;
  const client = new MongoClient(uri);
  await client.connect();
  collection = client.db("upnshare").collection("uploads");
}

async function exists(id) {
  if (collection)
    return !!(await collection.findOne({ fileId: id, status: "done" }));
  return memory.has(id);
}

async function save(data) {
  if (collection)
    await collection.updateOne(
      { fileId: data.fileId },
      { $set: data },
      { upsert: true }
    );
  else memory.set(data.fileId, data);
}

async function count() {
  if (collection) return await collection.countDocuments({ status: "done" });
  return memory.size;
}

module.exports = { init, exists, save, count };