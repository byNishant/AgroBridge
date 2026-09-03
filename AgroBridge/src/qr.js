// QR code generation utility — uses the qrcode library to render to a canvas,
// then returns a data URL for embedding in an <img> tag.
import QRCode from "qrcode";

export async function generateQRDataURL(text, opts = {}) {
  const defaultOpts = {
    width: 200,
    margin: 1,
    color: {
      dark: "#15803d",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  };
  const merged = { ...defaultOpts, ...opts };
  return QRCode.toDataURL(text, merged);
}
