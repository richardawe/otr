// Dependency-free export. PDF export uses the browser/webview's native print
// pipeline (Save as PDF) via a print stylesheet. PNG export rasterises the
// node through an SVG <foreignObject> and the Canvas API. Neither path uses
// fetch, XMLHttpRequest, or WebSocket — everything here is local DOM/CSSOM
// and Canvas/Blob APIs, so it stays inside the app's no-network guarantee.

function collectStylesheetText(): string {
  let css = "";
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        css += rule.cssText + "\n";
      }
    } catch {
      // Cross-origin sheets throw on cssRules access; none are expected in
      // this app (all styles are bundled locally), so this is a no-op guard.
    }
  }
  return css;
}

export async function exportNodeAsPng(elementId: string, filename: string): Promise<boolean> {
  const node = document.getElementById(elementId);
  if (!node) return false;

  const rect = node.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);
  const css = collectStylesheetText();
  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.margin = "0";

  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;background:#d9dbd3;">
        <style>${css}</style>
        ${clone.outerHTML}
      </div>
    </foreignObject>
  </svg>`;

  try {
    const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not rasterise export"));
    });
    image.src = url;
    await loaded;

    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0, width, height);
    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = filename;
    a.click();
    return true;
  } catch {
    return false;
  }
}

export function exportNodeAsPdf(elementId: string, _filename: string): void {
  const node = document.getElementById(elementId);
  if (!node) return;

  document.querySelectorAll(".print-target").forEach((el) => el.classList.remove("print-target"));
  node.classList.add("print-target");
  document.body.classList.add("printing");

  const cleanup = () => {
    node.classList.remove("print-target");
    document.body.classList.remove("printing");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);

  window.print();
}
