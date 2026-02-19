export const applyTextBend = (textbox, curve = 0) => {
  if (!textbox || textbox.type !== "textbox") return;

  textbox._curve = curve;
  textbox.set({ objectCaching: false });

  if (!textbox._arcPatched) {
    textbox._arcPatched = true;

    const originalRender = textbox._renderTextLine;

    textbox._renderTextLine = function (
      method,
      ctx,
      line,
      left,
      top,
      lineIndex
    ) {
      // If no curve → render normally
      if (!this._curve) {
        return originalRender.call(
          this,
          method,
          ctx,
          line,
          left,
          top,
          lineIndex
        );
      }

      const charCount = line.length;
      if (!charCount) return;

      // =============================
      // 🔥 Dynamic radius (professional)
      // =============================
      const textWidth = this.calcTextWidth();
      const strength = this._curve;

      // Prevent extreme distortion
      const safeStrength = Math.max(-100, Math.min(100, strength));

      const radius =
        textWidth / (safeStrength * 0.05 || 0.0001);

      // =============================
      // 🔥 Accurate char widths (Fabric 6)
      // =============================
      let totalArcLength = 0;
      const charWidths = [];

      for (let i = 0; i < charCount; i++) {
        const bounds = this.__charBounds?.[lineIndex]?.[i];
        const width = bounds?.kernedWidth || bounds?.width || this.fontSize * 0.6;

        charWidths.push(width);
        totalArcLength += width;
      }

      const totalAngle = totalArcLength / radius;
      let currentAngle = -totalAngle / 2;

      const baseline = top;

      ctx.save();

      for (let i = 0; i < charCount; i++) {
        const charWidth = charWidths[i];
        const charAngle = charWidth / radius;
        const angle = currentAngle + charAngle / 2;

        const x = left + radius * Math.sin(angle);
        const y = baseline - radius * Math.cos(angle) + radius;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        this._renderChar(
          method,
          ctx,
          lineIndex,
          i,
          line[i],
          -charWidth / 2,
          0
        );

        ctx.restore();

        currentAngle += charAngle;
      }

      ctx.restore();
    };

    // =============================
    // Editing Mode Handling
    // =============================
    textbox.on("editing:entered", function () {
      this._editingCurveBackup = this._curve;
      this._curve = 0;
      this.setCoords();
    });

    textbox.on("editing:exited", function () {
      this._curve = this._editingCurveBackup || 0;
      applyTextBend(this, this._curve);
    });
  }

  // =============================
  // Bounding Box Adjustment
  // =============================
  const extraHeight = Math.abs(curve) * 1.5;

  textbox.set({
    height: textbox.fontSize + extraHeight
  });

  textbox.setCoords();
};
