class DijkstraDisplay {
  constructor(scene, grid) {
    this.scene_ = scene;
    this.grid_ = grid;
    this.outputPanel_ = null; 

    this.pathGraphics_ = scene.make.graphics({
      x: 0,
      y: 0,
      add: true
    });
    this.pathGraphics_.depth = Depths.PATH_DISPLAY;

    this.stepIndex_ = 0;
    this.maxStepsToDisplay_ = 15;
    this.currentResult_ = null;
  }

  displayPath(result) {
    this.currentResult_ = result;
    this.stepIndex_ = Math.max(0, result.steps.length - this.maxStepsToDisplay_);
    this.updateDisplay_();
  }

  nextStep() {
    if (!this.currentResult_) return;
    this.stepIndex_ = Math.min(
        this.currentResult_.steps.length,
        this.stepIndex_ + 1);
    this.updateDisplay_();
  }

  previousStep() {
    if (!this.currentResult_) return;
    this.stepIndex_ = Math.max(0, this.stepIndex_ - 1);
    this.updateDisplay_();
  }

  updateDisplay_() {
    if (!this.currentResult_) {
      return;
    }
    this.drawPath_();
  }

  drawPath_() {
    if (!this.currentResult_ || !this.currentResult_.path) {
      return;
    }

    this.pathGraphics_.clear();

    const path = this.currentResult_.path;

    for (let i = 0; i < path.length; i++) {
      const tile = path[i];
      const center = this.grid_.getTileCenter(tile.x, tile.y);

      if (i === 0) {
        this.pathGraphics_.fillStyle(0x00ff00, 0.5);
      } else if (i === path.length - 1) {
        this.pathGraphics_.fillStyle(0xff0000, 0.5);
      } else {
        this.pathGraphics_.fillStyle(0x0000ff, 0.3);
      }

      const tileSize = Config.GRID_TILE_SIZE_PX;
      this.pathGraphics_.fillRect(
          center.x - tileSize / 2,
          center.y - tileSize / 2,
          tileSize,
          tileSize);

      if (i > 0) {
        const prevTile = path[i - 1];
        const prevCenter = this.grid_.getTileCenter(prevTile.x, prevTile.y);

        this.pathGraphics_.lineStyle(2, 0xffff00, 0.8);
        this.pathGraphics_.lineBetween(
            prevCenter.x, prevCenter.y,
            center.x, center.y);
      }
    }
  }

  hide() {
    this.pathGraphics_.visible = false;
  }

  show() {
    this.pathGraphics_.visible = true;
  }

  clear() {
    this.currentResult_ = null;
    this.stepIndex_ = 0;
    this.pathGraphics_.clear();
  }
}
