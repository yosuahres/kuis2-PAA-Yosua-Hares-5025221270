function main() {
  const config = {
    parent: 'game',
    type: Phaser.AUTO,
    width: Config.CAMERA_WIDTH_PX,
    height: Config.CAMERA_HEIGHT_PX,
    input: {
      activePointers: 4
    },
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

  var world;

  function preloadFn() {
    this.load.image('bookcase', 'img/bookcase.png');
    this.load.image('flowers', 'img/flowers.png');
    this.load.image('piano', 'img/piano.png');
    this.load.image('wallright', 'img/wallright.png');
    this.load.image('walltop', 'img/walltop.png');
    this.load.image('walltopright', 'img/walltopright.png');
    this.load.image('wood', 'img/wood.png');
  }

  function createFn() {
    world = new World(this);
  }

  function updateFn() {
  }
}

window.onload = main;