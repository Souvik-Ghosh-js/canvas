// utils/exportMultipleJsonToPDF.js
import { Canvas } from "fabric";
import { jsPDF } from "jspdf";

export const exportMultipleJsonToPDF = async (
  jsonList = [],
  canvas,
  fileName = "multi-page.pdf"
) => {
  if (!jsonList.length) return;
  const pdf = new jsPDF({ orientation: "p", unit: "px", format: "a4" });
  fileName = prompt("Enter Your File Name");
  const width = canvas.width;
  const height = canvas.height;
  console.log(width, height);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < jsonList.length; i++) {
    const tempCanvasEl = document.createElement("canvas");
    tempCanvasEl.width = width;
    tempCanvasEl.height = height;
    const jsonData = jsonList[i].json;

    const tempCanvas = new Canvas(tempCanvasEl, { width, height });

    await tempCanvas
      .loadFromJSON(jsonData)
      .then(() => tempCanvas.requestRenderAll());

    const imgData = tempCanvas.toDataURL({ format: "png", multiplier: 4 });
    const ratio = Math.min(pageWidth / width, pageHeight / height);
    const imgWidth = width * ratio;
    const imgHeight = height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
  }

  pdf.save(fileName);
};
