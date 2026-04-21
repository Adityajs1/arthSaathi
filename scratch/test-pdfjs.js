const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

async function testPdf() {
  try {
    console.log("PDF.js version:", pdfjs.version);
    // If this works, then the library is loaded correctly
  } catch (e) {
    console.error("PDF.js load error:", e);
  }
}
testPdf();
