const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const API_BASE = "https://upnshare.com/api/v1";

/**
 * Upload file to Upnshare and WAIT until completed
 */
async function uploadToUpnshare(filePath, apiKey) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  // STEP 1: create upload task
  const create = await axios.post(
    `${API_BASE}/video/upload`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        "X-API-KEY": apiKey
      },
      maxBodyLength: Infinity
    }
  );

  if (!create.data || !create.data.id) {
    throw new Error("Upnshare: upload task not created");
  }

  const taskId = create.data.id;

  // STEP 2: poll task status
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));

    const status = await axios.get(
      `${API_BASE}/video/advance-upload/${taskId}`,
      {
        headers: { "X-API-KEY": apiKey }
      }
    );

    if (!status.data) continue;

    if (status.data.status === "failed") {
      throw new Error("Upnshare upload failed");
    }

    if (status.data.status === "completed") {
      if (!status.data.download_url) {
        throw new Error("Upload completed but no file URL returned");
      }

      return status.data.download_url;
    }
  }

  throw new Error("Upload timeout: file never completed");
}

module.exports = { uploadToUpnshare };