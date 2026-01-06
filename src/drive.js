const axios = require("axios");
const fs = require("fs");
const path = require("path");

function extractId(url) {
  return url.match(/[-\w]{25,}/)?.[0];
}

async function downloadFile(url, outDir, onProgress) {
  const id = extractId(url);
  if (!id) throw new Error("Invalid Drive link");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const res = await axios({
    url: `https://drive.google.com/uc?export=download&id=${id}`,
    method: "GET",
    responseType: "stream"
  });

  const total = Number(res.headers["content-length"]);
  let done = 0;

  const filePath = path.join(outDir, `${id}.bin`);
  const writer = fs.createWriteStream(filePath);

  res.data.on("data", chunk => {
    done += chunk.length;
    if (onProgress && total) {
      onProgress(Math.floor((done / total) * 100));
    }
  });

  res.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
}

module.exports = { downloadFile };