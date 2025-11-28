import { Rect, Circle, Triangle, Textbox, Shadow, Gradient } from "fabric";

export const addSquare = (canvas) => {
  canvas.add(
    new Rect({
      top: 100,
      left: 50,
      width: 100,
      stroke: "#000000",
      strokeWidth: 2,
      height: 100,
      fill: "#000000",
      opacity: 1,
    })
  );
};

export const addRoundedSquare = (canvas) => {
  canvas.add(
    new Rect({
      top: 100,
      left: 50,
      width: 100,
      height: 100,
      stroke: "#000000",
      strokeWidth: 2,
      fill: "#000000",
      rx: 10,
      ry: 10,
      opacity: 1,
    })
  );
};

export const addCircle = (canvas) => {
  canvas.add(
    new Circle({
      radius: 50,
      fill: "#000000",
      left: 100,
      top: 100,
      stroke: "black",
      strokeWidth: 2,
      opacity: 1,
    })
  );
};

export const addTriangle = (canvas) => {
  canvas.add(
    new Triangle({
      top: 100,
      left: 70,
      width: 100,
      height: 100,
      fill: "#000",
      stroke: "black",
      strokeWidth: 2,
      opacity: 1,
    })
  );
};

export const addHeadingText = (canvas) => {
  canvas.add(
    new Textbox("Your Text Here", {
      left: 100,
      top: 100,
      fontSize: 60,
      width: 300,
      fill: "black",
      fontWeight: 700,
      textAlign: "center",
      editable: true, // Enable editing
      editingBorderColor: 'blue', // Visual indicator when editing
      opacity: 1,
    })
  );
   setTimeout(() => {
    text.enterEditing();
    text.selectAll();
  }, 100);
};

export const addSubHeadingText = (canvas) => {
  canvas.add(
    new Textbox("Your Text Here", {
      left: 100,
      top: 100,
      fontSize: 30,
      width: 250,
      fill: "black",
      fontWeight: 600,
      textAlign: "center",
    })
  );
};

export const addSimpleText = (canvas) => {
  canvas.add(
    new Textbox("Your Text Here", {
      left: 100,
      top: 100,
      fontSize: 20,
      width: 200,
      fill: "black",
      fontWeight: 500,
      textAlign: "center",
    })
  );
};
export const addBengaliText = (canvas) => {
  canvas.add(
    new Textbox("এইটা বাংলা টেক্সট", {
      left: 100,
      top: 100,
      fontSize: 20,
      width: 200,
      fill: "black",
      fontFamily: "Noto Sans Bengali",
      fontWeight: 500,
      textAlign: "center",
    })
  );
};

export const addWordArt_1 = (canvas) => {
  canvas.add(
    new Textbox("A", {
      left: 50,
      top: 150,
      fontFamily: "Impact",
      fontSize: 60,
      fontWeight: 500,
      stroke: "black",
      strokeWidth: 2,
      fill: new Gradient({
        type: "linear",
        coords: { x1: 0, y1: 0, x2: 0, y2: 55 },
        colorStops: [
          { offset: 0, color: "#ffb347" },
          { offset: 1, color: "#ff7043" },
        ],
      }),
      selectable: true,
    })
  );
};

export const addWordArt_2 = (canvas) => {
  const primaryBlue = "#4A90E2";
  const outlineBlue = "#fff";
  const shadowColor = "rgba(53, 110, 176, 0.5)";

  const softShadowText = new Textbox("A", {
    left: 50,
    top: 50,
    fontFamily: "Arial",
    fontSize: 60,
    fontWeight: 500,
    fill: primaryBlue,
    stroke: outlineBlue,
    strokeWidth: 2,
    strokeUniform: true,
    shadow: `${shadowColor} 3 3 1`,
    selectable: true,
  });

  canvas.add(softShadowText);
  canvas.renderAll();
};

export const addWordArt_4 = (canvas) => {
  const shadowColor = "rgba(0, 0, 0, 0.5)";
  const softShadowText = new Textbox("A", {
    left: 50,
    top: 50,
    fontFamily: "Arial",
    fontSize: 60,
    fill: "black",
    fontWeight: 500,

    stroke: "white",
    strokeWidth: 1,
    strokeUniform: true,
    shadow: `${shadowColor} 2 2 1`,
    selectable: true,
  });

  canvas.add(softShadowText);
  canvas.renderAll();
};

export const addWordArt_5 = (canvas) => {
  const shadowColor = "rgba(255, 106, 0, 1)";
  const softShadowText = new Textbox("A", {
    left: 50,
    top: 50,
    fontFamily: "Arial",
    fontSize: 60,
    fontWeight: 500,
    fill: "white",
    stroke: "#FF6A00",
    strokeWidth: 0.3,
    strokeUniform: true,
    shadow: `${shadowColor} 1.5 1.5 0`,
    selectable: true,
  });

  canvas.add(softShadowText);
  canvas.renderAll();
};

export const addWordArt_6 = (canvas) => {
  const shadowColor = "rgba(0, 0, 0, 0.25)";
  const softShadowText = new Textbox("A", {
    left: 50,
    top: 50,
    fontFamily: "Arial",
    fontSize: 60,
    fontWeight: 500,

    fill: "#475AE6",
    shadow: `${shadowColor} 1.5 1.5 2`,
    selectable: true,
  });

  canvas.add(softShadowText);
  canvas.renderAll();
};

export const addWordArt_7 = (canvas) => {
  const shadowColor = "rgba(0, 0, 0, 0.25)";
  const softShadowText = new Textbox("A", {
    left: 50,
    top: 50,
    fontFamily: "Arial",
    fontSize: 60,
    fontWeight: 500,

    stroke: "#2EC0FF",
    strokeWidth: 0.5,
    fill: "#ffffff",
    shadow: `${shadowColor} 1.5 1.5 2`,
    selectable: true,
  });

  canvas.add(softShadowText);
  canvas.renderAll();
};

export const addWordArt_3 = (canvas) => {
  const shadowColor = "rgba(0, 146, 209, 0.8)";
  const softShadowText = new Textbox("A", {
    left: 50,
    top: 50,
    fontFamily: "Arial",
    fontSize: 60,
    fontWeight: 500,

    fill: "black",
    stroke: "white",
    strokeWidth: 0.5,
    strokeUniform: true,
    shadow: `${shadowColor} 1.5 1.5 0`,
    selectable: true,
  });

  canvas.add(softShadowText);
  canvas.renderAll();
};
