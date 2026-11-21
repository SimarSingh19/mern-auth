import ImageKit from "@imagekit/nodejs";
import config from "./config.js";

const imagekit = new ImageKit({
  privateKey: config.imagekitPrivateKey,
});

export default imagekit;