/**
 * ArcadeUiKit centralizes the Phaser-only UI drawing helpers.
 * Keeping panels, chips, and button-like labels here prevents the Scene from
 * duplicating low-level graphics code every time the UI is refreshed.
 */
export default class ArcadeUiKit {
  constructor(scene) {
    this.scene = scene;
  }

  panel(x, y, width, height, options = {}) {
    const g = this.scene.add.graphics();
    const fill = options.fill ?? 0x10152d;
    const alpha = options.alpha ?? 0.94;
    const line = options.line ?? 0x6ee7ff;
    const lineAlpha = options.lineAlpha ?? 0.55;
    const radius = options.radius ?? 24;
    g.fillStyle(fill, alpha).fillRoundedRect(x, y, width, height, radius);
    g.lineStyle(options.lineWidth ?? 3, line, lineAlpha).strokeRoundedRect(x, y, width, height, radius);
    return g;
  }

  pill(x, y, text, options = {}) {
    const paddingX = options.paddingX ?? 16;
    const width = options.width ?? Math.max(90, text.length * 13 + paddingX * 2);
    const height = options.height ?? 34;
    const bg = options.bg ?? 0x1b2450;
    const fg = options.fg ?? '#ffffff';
    const g = this.scene.add.graphics();
    g.fillStyle(bg, options.alpha ?? 0.95).fillRoundedRect(x, y, width, height, height / 2);
    if (options.line) g.lineStyle(2, options.line, 0.8).strokeRoundedRect(x, y, width, height, height / 2);
    this.scene.add.text(x + width / 2, y + height / 2, text, {
      fontFamily: 'Arial Black',
      fontSize: options.fontSize ?? 14,
      color: fg,
    }).setOrigin(0.5);
    return { x, y, width, height };
  }

  label(x, y, text, size = 18, color = '#ffffff', options = {}) {
    return this.scene.add.text(x, y, text, {
      fontFamily: 'Arial Black',
      fontSize: size,
      color,
      stroke: options.stroke ?? '#050718',
      strokeThickness: options.strokeThickness ?? 0,
      wordWrap: options.wordWrap,
      align: options.align ?? 'left',
    }).setOrigin(options.originX ?? 0, options.originY ?? 0);
  }

  headline(x, y, text, size = 46, color = '#ffe66d') {
    return this.label(x, y, text, size, color, {
      originX: 0.5,
      originY: 0.5,
      stroke: '#050718',
      strokeThickness: 9,
      align: 'center',
    });
  }
}
