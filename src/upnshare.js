const axios = require("axios");
const API = "https://upnshare.com/api/v1";

async function remoteUpload(url, apiKey, onProgress) {
  const create = await axios.post(
    `${API}/video/advance-upload`,
    { url },
    { headers: { "X-API-KEY": apiKey } }
  );

  if (!create.data?.id) throw new Error("Upload task not created");

  const taskId = create.data.id;

  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));

    const res = await axios.get(
      `${API}/video/advance-upload/${taskId}`,
      { headers: { "X-API-KEY": apiKey } }
    );

    const d = res.data;
    if (!d) continue;

    if (d.progress !== undefined && onProgress) {
      onProgress(d.progress, d.status);
    }

    if (d.status === "failed") {
      throw new Error("Upnshare upload failed");
    }

    if (d.status === "completed") {
      if (!d.download_url) throw new Error("Completed but no URL");
      return d.download_url;
    }
  }

  throw new Error("Upload timeout");
}

module.exports = { remoteUpload };