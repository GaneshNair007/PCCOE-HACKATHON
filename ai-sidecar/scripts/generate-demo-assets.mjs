import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDemoDir = path.join(__dirname, "..", "public", "demo");

if (!fs.existsSync(publicDemoDir)) {
  fs.mkdirSync(publicDemoDir, { recursive: true });
}

// Minimal valid JPEG header + padding to 2,450,000 bytes
const jpgHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const jpgBuffer = Buffer.alloc(2450000);
jpgHeader.copy(jpgBuffer, 0);
fs.writeFileSync(path.join(publicDemoDir, "hero-poster.jpg"), jpgBuffer);

// Minimal WebP header + padding to 185,000 bytes
const webpHeader = Buffer.from("RIFF....WEBPVP8 ");
const webpBuffer = Buffer.alloc(185000);
webpHeader.copy(webpBuffer, 0);
fs.writeFileSync(path.join(publicDemoDir, "hero-poster.webp"), webpBuffer);

console.log("Demo assets created in public/demo: hero-poster.jpg (2.45MB), hero-poster.webp (185KB)");
