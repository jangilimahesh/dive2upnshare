const axios = require("axios");
const fs = require("fs");
const path = require("path");

function extractId(url) {
  return url.match(/[-\w]{25,}/)?.[0];
}

async function downloadFile(url, outDir, onProgress) {
  const id = extractId(url);
  if (!id) throw new Error("Invalid Drive link");

  const res = await axios({
    url: `https://drive.google.com/uc?export=download&id=${id}`,
    method: "GET",
    responseType: "stream"
  });

  const total = Number(res.headers["content-length"]);
  let done = 0;

  const file = path.join(outDir, `${id}.bin`);
  const writer = fs.createWriteStream(file);

  res.data.on("data", c => {
    done += c.length;
    if (onProgress && total)
      onProgress(Math.floor((done / total) * 100));
  });

  res.data.pipe(writer);
  return new Promise(r => writer.on("finish", () => r(file)));
}

module.exports = { downloadFile };