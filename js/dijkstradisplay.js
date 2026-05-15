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

    this.algorithmGraphics_ = scene.make.graphics({
      x: 0,
      y: 0,
      add: true
    });
    this.algorithmGraphics_.depth = Depths.PATH_DISPLAY - 1;

    this.stepText_ = scene.add.text(10, 10, '');
    this.stepText_.setFontSize(14);
    this.stepText_.setColor('#FFFF00');
    this.stepText_.setBackgroundColor('#000000');
    this.stepText_.setPadding(5, 5);
    this.stepText_.depth = Depths.PATH_DISPLAY + 1;
    this.stepText_.visible = false;

    this.stepIndex_ = 0;
    this.currentResult_ = null;
    this.isShowingAlgorithm_ = false;
    this.visitedNodes_ = new Set();
    this.currentNode_ = null;
    this.tempTexts_ = [];
  }

  displayPath(result) {
    this.currentResult_ = result;
    this.stepIndex_ = 0;
    this.isShowingAlgorithm_ = true;
    this.visitedNodes_.clear();
    this.currentNode_ = null;
    this.updateDisplay_();
  }

  nextStep() {
    if (!this.currentResult_ || !this.isShowingAlgorithm_) return;
    
    this.stepIndex_ = Math.min(
        this.currentResult_.steps.length - 1,
        this.stepIndex_ + 1);
    
    if (this.stepIndex_ >= this.currentResult_.steps.length - 1) {
      this.isShowingAlgorithm_ = false;
      this.stepText_.visible = false;
      this.algorithmGraphics_.clear();
    }
    
    this.updateDisplay_();
  }

  previousStep() {
    if (!this.currentResult_ || !this.isShowingAlgorithm_) return;
    this.stepIndex_ = Math.max(0, this.stepIndex_ - 1);
    this.updateDisplay_();
  }

  updateDisplay_() {
    if (!this.currentResult_) {
      return;
    }

    if (this.isShowingAlgorithm_) {
      this.drawAlgorithmStep_();
    } else {
      this.drawPath_();
    }
  }

  drawAlgorithmStep_() {
    this.algorithmGraphics_.clear();
    this.pathGraphics_.clear();

    if (this.stepIndex_ >= this.currentResult_.steps.length) {
      return;
    }

    
    this.visitedNodes_.clear();
    this.currentNode_ = null;
    const distances = {};

    for (let i = 0; i <= this.stepIndex_; i++) {
      const step = this.currentResult_.steps[i];

      if (step.type === 'init') {
        this.visitedNodes_.add(`${step.tile.x},${step.tile.y}`);
        this.currentNode_ = step.tile;
        distances[`${step.tile.x},${step.tile.y}`] = step.distance;
      } else if (step.type === 'update') {
        this.visitedNodes_.add(`${step.from.x},${step.from.y}`);
        this.currentNode_ = step.from;
        distances[`${step.tile.x},${step.tile.y}`] = step.distance;
      }
    }

    const tileSize = Config.GRID_TILE_SIZE_PX;

    
    for (let x = 0; x < Config.GRID_WIDTH_IN_TILES; x++) {
      for (let y = 0; y < Config.GRID_HEIGHT_IN_TILES; y++) {
        const key = `${x},${y}`;
        const center = this.grid_.getTileCenter(x, y);

        
        if (this.visitedNodes_.has(key)) {
          this.algorithmGraphics_.fillStyle(0xff0000, 0.4);
          this.algorithmGraphics_.fillRect(
              center.x - tileSize / 2,
              center.y - tileSize / 2,
              tileSize,
              tileSize);
        }

        
        if (this.currentNode_ && this.currentNode_.x === x && this.currentNode_.y === y) {
          this.algorithmGraphics_.fillStyle(0xffff00, 0.6);
          this.algorithmGraphics_.fillRect(
              center.x - tileSize / 2,
              center.y - tileSize / 2,
              tileSize,
              tileSize);
          
          
          this.algorithmGraphics_.lineStyle(3, 0xffff00, 1);
          this.algorithmGraphics_.strokeRect(
              center.x - tileSize / 2,
              center.y - tileSize / 2,
              tileSize,
              tileSize);
        }

        
        if (distances[key] !== undefined) {
          const distText = this.scene_.add.text(center.x, center.y, 
              String(distances[key]), {
                fontSize: '12px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 2, y: 2 }
              });
          distText.setOrigin(0.5);
          distText.depth = Depths.PATH_DISPLAY + 2;
          this.tempTexts_.push(distText);
        }
      }
    }

    
    this.tempTexts_.forEach(t => t.destroy());
    this.tempTexts_ = [];

    
    const currentStep = this.currentResult_.steps[this.stepIndex_];
    let displayText = `Step ${this.stepIndex_ + 1}/${this.currentResult_.steps.length}\n`;
    displayText += `${currentStep.message}\n\n`;
    displayText += `[SPACE] Next Step | [BACKSPACE] Prev Step`;

    this.stepText_.setText(displayText);
    this.stepText_.visible = true;
  }

  drawPath_() {
    if (!this.currentResult_ || !this.currentResult_.path) {
      return;
    }

    this.algorithmGraphics_.clear();
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

    
    const displayText = `Path found!\nDistance: ${this.currentResult_.distance}\n\n[R] Reset`;
    this.stepText_.setText(displayText);
    this.stepText_.visible = true;
  }

  hide() {
    this.pathGraphics_.visible = false;
    this.algorithmGraphics_.visible = false;
    this.stepText_.visible = false;
    
    if (this.tempTexts_) {
      this.tempTexts_.forEach(t => t.destroy());
      this.tempTexts_ = [];
    }
  }

  show() {
    this.pathGraphics_.visible = true;
    this.algorithmGraphics_.visible = true;
    if (this.isShowingAlgorithm_) {
      this.stepText_.visible = true;
    }
  }

  clear() {
    this.currentResult_ = null;
    this.stepIndex_ = 0;
    this.isShowingAlgorithm_ = false;
    this.visitedNodes_.clear();
    this.currentNode_ = null;
    this.pathGraphics_.clear();
    this.algorithmGraphics_.clear();
    this.stepText_.visible = false;
    
    if (this.tempTexts_) {
      this.tempTexts_.forEach(t => t.destroy());
      this.tempTexts_ = [];
    }
  }
}
