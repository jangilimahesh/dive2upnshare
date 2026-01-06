const axios = require("axios");

async function listFolder(url) {
  const id = url.match(/folders\/([a-zA-Z0-9_-]+)/)?.[1];
  if (!id) throw new Error("Invalid folder link");

  const res = await axios.get(
    `https://drive.google.com/drive/folders/${id}`,
    { headers: { "User-Agent": "Mozilla/5.0" } }
  );

  const match = res.data.match(/_DRIVE_ivd'\s*,\s*(\[.*?\]);/s);
  if (!match) throw new Error("Folder parse failed");

  const files = JSON.parse(match[1])[0][1];

  return files
    .filter(f => f[3])
    .map(f => ({
      id: f[3],
      link: `https://drive.google.com/uc?id=${f[3]}&export=download`
    }));
}

module.exports = { listFolder };