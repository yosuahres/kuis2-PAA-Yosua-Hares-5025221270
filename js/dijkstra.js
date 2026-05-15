class Dijkstra {
  constructor(grid, world) {
    this.grid_ = grid;
    this.world_ = world;
    this.distances_ = {};
    this.previous_ = {};
    this.unvisited_ = new Set();
    this.visited_ = new Set();
    this.steps_ = [];
  }

  findShortestPath(startTile, endTile) {
    this.steps_ = [];
    this.distances_ = {};
    this.previous_ = {};
    this.unvisited_ = new Set();
    this.visited_ = new Set();

    for (let x = 0; x < Config.GRID_WIDTH_IN_TILES; x++) {
      for (let y = 0; y < Config.GRID_HEIGHT_IN_TILES; y++) {
        const key = `${x},${y}`;
        this.distances_[key] = Infinity;
        this.previous_[key] = null;
        this.unvisited_.add(key);
      }
    }

    const startKey = `${startTile.x},${startTile.y}`;
    this.distances_[startKey] = 0;

    this.steps_.push({
      type: 'init',
      tile: startTile,
      distance: 0,
      message: `Start: (${startTile.x}, ${startTile.y})`
    });

    const endKey = `${endTile.x},${endTile.y}`;
    let stepCount = 0;

    while (this.unvisited_.size > 0) {
      
      let currentKey = null;
      let minDistance = Infinity;

      for (const key of this.unvisited_) {
        if (this.distances_[key] < minDistance) {
          minDistance = this.distances_[key];
          currentKey = key;
        }
      }

      if (currentKey === null || minDistance === Infinity) {
        break;
      }

      if (currentKey === endKey) {
        this.steps_.push({
          type: 'reached',
          message: `Reached destination: (${endTile.x}, ${endTile.y}) with distance ${this.distances_[endKey]}`
        });
        break;
      }

      this.unvisited_.delete(currentKey);
      this.visited_.add(currentKey);

      const [x, y] = currentKey.split(',').map(Number);
      const currentTile = { x, y };
      const currentDist = this.distances_[currentKey];

      
      const neighbors = this.getWalkableNeighbors_(currentTile);

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (!this.unvisited_.has(neighborKey)) {
          continue;
        }

        const newDistance = currentDist + 1;

        if (newDistance < this.distances_[neighborKey]) {
          this.distances_[neighborKey] = newDistance;
          this.previous_[neighborKey] = currentKey;

          stepCount++;
          this.steps_.push({
            type: 'update',
            tile: neighbor,
            distance: newDistance,
            from: currentTile,
            message: `Update: (${neighbor.x}, ${neighbor.y}) = ${newDistance} from (${x}, ${y})`
          });
        }
      }
    }

    
    const path = [];
    let currentKey = endKey;

    while (currentKey !== null) {
      const [x, y] = currentKey.split(',').map(Number);
      path.unshift({ x, y });
      currentKey = this.previous_[currentKey];
    }

    this.steps_.push({
      type: 'path',
      path: path,
      distance: this.distances_[endKey],
      message: `Final path length: ${path.length}, Total distance: ${this.distances_[endKey]}`
    });

    return {
      path: path,
      distance: this.distances_[endKey],
      steps: this.steps_
    };
  }

  getWalkableNeighbors_(tile) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 }, 
      { x: 1, y: 0 },  
      { x: 0, y: 1 },  
      { x: -1, y: 0 }  
    ];

    for (const dir of directions) {
      const newX = tile.x + dir.x;
      const newY = tile.y + dir.y;

      
      if (newX < 0 || newX >= Config.GRID_WIDTH_IN_TILES ||
          newY < 0 || newY >= Config.GRID_HEIGHT_IN_TILES) {
        continue;
      }

      const newTile = { x: newX, y: newY };
      const center = this.grid_.getTileCenter(newX, newY);

      
      if (!this.world_.anyPathBlockingObstacleInRegion(
          center.x,
          center.y,
          Config.PATHERY_COLLISION_DETECTION_SIZE,
          Config.PATHERY_COLLISION_DETECTION_SIZE)) {
        neighbors.push(newTile);
      }
    }

    return neighbors;
  }

  getSteps() {
    return this.steps_;
  }
}
