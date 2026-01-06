const axios = require("axios");

async function listFolder(url) {
  const id = url.match(/folders\/([a-zA-Z0-9_-]+)/)?.[1];
  if (!id) throw new Error("Invalid folder link");

  const res = await axios.get(
    `https://drive.google.com/drive/folders/${id}`,
    { headers: { "User-Agent": "Mozilla/5.0" } }
  );

  const m = res.data.match(/_DRIVE_ivd'\s*,\s*(\[.*?\]);/s);
  const data = JSON.parse(m[1])[0][1];

  return data
    .filter(f => f[3])
    .map(f => ({
      id: f[3],
      name: f[2],
      link: `https://drive.google.com/file/d/${f[3]}/view`
    }));
}

module.exports = { listFolder };