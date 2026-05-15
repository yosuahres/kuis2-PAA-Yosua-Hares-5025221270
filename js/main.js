function main() {
  const config = {
    parent: 'game',
    type: Phaser.AUTO,
    width: Config.CAMERA_WIDTH_PX,
    height: Config.CAMERA_HEIGHT_PX,
    physics: {
      default: 'arcade'
    },
    scene: {
      preload: preloadFn,
      create: createFn,
      update: updateFn
    }
  };
  const game = new Phaser.Game(config);
  var blockList;
  var cursorKeys;
  var directorState;
  var dijkstra;
  var dijkstraDisplay;
  var gridObj;
  var patty;
  var santa;
  var world;
  var isRunning = false;

  function preloadFn() {
    this.load.spritesheet('santarun', 'img/santarun.png', {
      frameWidth: Config.SANTA_RUN_SPRITE_WIDTH,
      frameHeight: Config.SANTA_RUN_SPRITE_HEIGHT
    });
    this.load.spritesheet('girl', 'img/patty.png', {
      frameWidth: Config.PATTY_SPRITE_WIDTH,
      frameHeight: Config.PATTY_SPRITE_HEIGHT
    });
    this.load.spritesheet('tree', 'img/tree.png', {
      frameWidth: Config.TREE_SPRITE_WIDTH,
      frameHeight: Config.TREE_SPRITE_HEIGHT
    });
    this.load.image('crate', 'img/crate.png');
    this.load.image('fireplace', 'img/fireplace.png');
    this.load.image('glow', 'img/glow.png');
    this.load.image('welcome', 'img/welcome.png');
    this.load.image('walltop', 'img/walltop.png');
    this.load.image('wallright', 'img/wallright.png');
    this.load.image('walltopright', 'img/walltopright.png');
    this.load.image('wood', 'img/wood.png');
    this.load.image('rugtopleft', 'img/rugtopleft.png');
    this.load.image('rugtop', 'img/rugtop.png');
    this.load.image('rugleft', 'img/rugleft.png');
    this.load.image('rugmiddle', 'img/rugmiddle.png');
    this.load.image('pathmarker', 'img/pathmarker.png');
  }

  function createFn() {
    cursorKeys = this.input.keyboard.createCursorKeys();

    directorState = new DirectorState({});
    world = new World(this);
    gridObj = new Grid(this, world);
    blockList = new BlockList(this, world, gridObj, directorState);
    patty = new Patty(this, world, gridObj, cursorKeys);
    santa = new Santa(this, gridObj, directorState);
    dijkstra = new Dijkstra(gridObj, world);
    dijkstraDisplay = new DijkstraDisplay(this, gridObj);

    this.grid_ = gridObj;

    this.anims.create({
      key: 'standUp',
      frames: [{key: 'girl', frame: 1}],
      frameRate: Config.PATTY_ANIMATION_SPEED
    });
    this.anims.create({
      key: 'standRight',
      frames: [{key: 'girl', frame: 18}],
      frameRate: Config.PATTY_ANIMATION_SPEED
    });
    this.anims.create({
      key: 'standDown',
      frames: [{key: 'girl', frame: 35}],
      frameRate: Config.PATTY_ANIMATION_SPEED
    });
    this.anims.create({
      key: 'moveUp',
      frames: this.anims.generateFrameNumbers('girl', {
        start: 3,
        end: 5
      }),
      frameRate: Config.PATTY_ANIMATION_SPEED,
      repeat: -1,
      yoyo: true
    });
    this.anims.create({
      key: 'moveRight',
      frames: this.anims.generateFrameNumbers('girl', {
        start: 20,
        end: 22
      }),
      frameRate: Config.PATTY_ANIMATION_SPEED,
      repeat: -1,
      yoyo: true
    });
    this.anims.create({
      key: 'moveDown',
      frames: this.anims.generateFrameNumbers('girl', {
        start: 37,
        end: 39
      }),
      frameRate: Config.PATTY_ANIMATION_SPEED,
      repeat: -1,
      yoyo: true
    });

    
    this.input.keyboard.on('keydown', (e) => {
      if (e.keyCode === 71) { 
        calculateAndDisplayPath();
        isRunning = true;
      }
      if (e.keyCode === 32) { 
        dijkstraDisplay.nextStep();
        
        if (!dijkstraDisplay.isShowingAlgorithm_ && dijkstraDisplay.currentResult_) {
          
          if (dijkstraDisplay.currentResult_.path && dijkstraDisplay.currentResult_.path.length > 0) {
            santa.moveAlongPath(dijkstraDisplay.currentResult_.path);
          }
        }
      }
      if (e.keyCode === 8) { 
        dijkstraDisplay.previousStep();
      }
      if (e.keyCode === 82) { 
        isRunning = false;
        resetPuzzle(this);
      }
      if (e.keyCode === 73) { 
        const instructionsDiv = document.getElementById('instructions');
        instructionsDiv.style.display = instructionsDiv.style.display === 'none' ? 'block' : 'none';
      }
    });

    
    this.anims.create({
      key: 'santaRunRight',
      frames: this.anims.generateFrameNumbers('santarun', {
        start: 0,
        end: 9
      }),
      frameRate: Config.SANTA_ANIMATION_SPEED,
      repeat: -1
    });

    resetPuzzle(this);
  }

  function updateFn() {
    
    if (!isRunning) {
      
      blockList.update(patty.getSprite(), cursorKeys);
      
      
      world.checkCollisions(patty.getSprite());
      
      
      patty.update();
    }
    
    
    santa.update();
  }

  function calculateAndDisplayPath() {
    
    const startTile = { x: 0, y: 4 }; 
    const endTile = { x: 10, y: 1 }; 

    
    const result = dijkstra.findShortestPath(startTile, endTile);
    dijkstraDisplay.displayPath(result);

    
    
    
  }

  function resetPuzzle(scene) {
    world.reset();
    gridObj.reset(4, 1, { x: 10, y: 1 });

    
    const rightWallGapCenter = gridObj.getTileCenter(10, 1);
    world.renderRightWall(
        rightWallGapCenter.y - Config.GRID_TILE_SIZE_PX / 2,
        rightWallGapCenter.y + Config.GRID_TILE_SIZE_PX / 2);

    blockList.reset();
    blockList.addBlockInGrid(1, 2, 'crate');
    blockList.addBlockInGrid(2, 4, 'crate');
    blockList.addBlockInGrid(4, 6, 'crate');
    blockList.addBlockInGrid(7, 1, 'crate');
    blockList.addBlockInGrid(7, 2, 'crate');
    blockList.addBlockInGrid(8, 5, 'crate');
    blockList.addBlockInGrid(9, 4, 'crate');

    
    patty.reset();
    patty.teleportTo(0, 4);

    santa.reset();
    santa.teleportTo(0, 4); 

    
    dijkstraDisplay.clear();
  }

}

window.onload = main;
