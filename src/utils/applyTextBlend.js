export const applyTextBend = (textbox, curve = 0) => {
  if (!textbox || textbox.type !== "textbox") return;

  textbox._curve = curve;
  textbox.set({ objectCaching: false });

  if (!textbox._arcPatched) {
    textbox._arcPatched = true;

    const originalRender = textbox._renderTextLine;
    const originalGetDims = textbox._getNonTransformedDimensions;

    // =====================================================
    // 🔥 CURVED TEXT RENDER
    // =====================================================
    textbox._renderTextLine = function (
      method,
      ctx,
      line,
      left,
      top,
      lineIndex
    ) {
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

      const safeStrength = Math.max(-100, Math.min(100, this._curve));

      // Measure true line width
      let totalArcLength = 0;
      const charWidths = [];

      for (let i = 0; i < charCount; i++) {
        const bounds = this.__charBounds?.[lineIndex]?.[i];
        const width =
          bounds?.kernedWidth ||
          bounds?.width ||
          this.fontSize * 0.6;

        charWidths.push(width);
        totalArcLength += width;
      }

      const radius =
        totalArcLength / (safeStrength * 0.05 || 0.0001);

      const totalAngle = totalArcLength / radius;
      let currentAngle = -totalAngle / 2;

      // 🔥 Horizontal true center fix
      const centerX = left + totalArcLength / 2;

      // 🔥 Vertical centering fix
      const theta = totalArcLength / radius;
      const arcHeight =
        Math.abs(radius) * (1 - Math.cos(theta / 2));

      const baseline = top - arcHeight;

      ctx.save();

      for (let i = 0; i < charCount; i++) {
        const charWidth = charWidths[i];
        const charAngle = charWidth / radius;
        const angle = currentAngle + charAngle / 2;

        const x = centerX + radius * Math.sin(angle);
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

    // =====================================================
    // 🔥 DIMENSION FIX (Selection Box Correct)
    // =====================================================
    textbox._getNonTransformedDimensions = function () {
      const dims = originalGetDims.call(this);

      if (!this._curve) return dims;

      const safeStrength = Math.max(-100, Math.min(100, this._curve));
      const textWidth = this.calcTextWidth();
      const radius =
        textWidth / (safeStrength * 0.05 || 0.0001);

      const theta = textWidth / radius;
      const arcHeight =
        Math.abs(radius) * (1 - Math.cos(theta / 2));

      return {
        x: dims.x,
        y: dims.y + arcHeight * 2
      };
    };

    // =====================================================
    // 🔥 Editing Mode Safe Handling
    // =====================================================
    textbox.on("editing:entered", function () {
      this._editingCurveBackup = this._curve;
      this._curve = 0;
      this.setCoords();
    });

    textbox.on("editing:exited", function () {
      this._curve = this._editingCurveBackup || 0;
      this.setCoords();
    });
  }

  textbox.setCoords();
};