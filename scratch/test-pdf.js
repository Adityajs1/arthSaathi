const pdf = require('pdf-parse');
const fs = require('fs');

async function test() {
  try {
    console.log("Testing pdf-parse...");
    // Just a placeholder test to see if it even loads
    console.log("pdf-parse loaded successfully");
  } catch (e) {
    console.error("pdf-parse load failed:", e);
  }
}
test();
