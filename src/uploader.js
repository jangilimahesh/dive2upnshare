const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

async function uploadToUpnshare(file, apiKey, onProgress) {
  const form = new FormData();
  form.append("file", fs.createReadStream(file));

  const res = await axios.post(
    "https://upnshare.com/api/upload",
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${apiKey}`
      },
      maxBodyLength: Infinity,
      onUploadProgress: e => {
        if (onProgress && e.total)
          onProgress(Math.floor((e.loaded / e.total) * 100));
      }
    }
  );

  return res.data.file_url;
}

module.exports = { uploadToUpnshare };