class Pathery {
  constructor(world, grid) {
    this.world_ = world;
    this.grid_ = grid;
  }

  solve() {
    const results = {};
    const frontier = [];

    
    for (var tileX = 0; tileX < Config.GRID_WIDTH_IN_TILES; tileX++) {
      for (var tileY = 0; tileY < Config.GRID_HEIGHT_IN_TILES; tileY++) {
        const center = this.grid_.getTileCenter(tileX, tileY);
        if (this.world_.anyPathBlockingObstacleInRegion(
            center.x,
            center.y,
            Config.PATHERY_COLLISION_DETECTION_SIZE,
            Config.PATHERY_COLLISION_DETECTION_SIZE)) {
          const tile = {x: tileX, y: tileY};
          results[this.tileKey_(tile, 0)] = {
            tile: tile,
            targetCount: 0,
            distance: 99999,
            parentResult: null
          };
          results[this.tileKey_(tile, 1)] = {
            tile: tile,
            targetCount: 1,
            distance: 99999,
            parentResult: null
          };
        }
      }
    }

    
    this.grid_.getEndTiles().forEach(tileEnd => {
      this.visit_(
          results,
          frontier,
          tileEnd,
          1,
          null);
    });

    
    while (frontier.length) {
      const tileKey = frontier.splice(0, 1)[0];
      const result = results[tileKey];
      if (tileKey == this.tileKey_(this.grid_.getTargetTile(), 1)) {
        
        
        this.visit_(
            results, frontier, result.tile, 0, result);
      }
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(d => {
        this.visit_(
            results,
            frontier,
            {x: result.tile.x + d[0], y: result.tile.y + d[1]},
            result.targetCount,
            result);
      });
    }

    
    var bestTileStart = null;
    var bestDistance = 99999;
    this.grid_.getStartTiles().forEach(tileStart => {
      const tileKey = this.tileKey_(tileStart, 0);
      const result = results[tileKey];
      if (result && result.distance < bestDistance) {
        bestTileStart = tileStart;
        bestDistance = result.distance;
      }
    });

    
    return bestTileStart ? this.constructPath_(results, bestTileStart) : null;
  }

  visit_(results, frontier, tile, targetCount, parentResult) {
    if (tile.x < 0
        || tile.x >= Config.GRID_WIDTH_IN_TILES
        || tile.y < 0
        || tile.y >= Config.GRID_HEIGHT_IN_TILES) {
      
      return;
    }

    const tileKey = this.tileKey_(tile, targetCount);
    if (results[tileKey]) {
      
      return;
    }

    const result = {
      tile: tile,
      targetCount: targetCount,
      distance: parentResult ? parentResult.distance + 1 : 0,
      parentResult: parentResult
    };
    results[tileKey] = result;
    frontier.push(tileKey);
  }

  constructPath_(results, tile) {
    const tileKey = this.tileKey_(tile, 0);
    var currentResult = results[tileKey];
    if (!currentResult) {
      console.error('No result for tile key.');
      return null;
    }
    const path = [];
    while (currentResult != null) {
      if (!currentResult.parentResult || currentResult.targetCount
          == currentResult.parentResult.targetCount) {
        
        path.push({
          tile: currentResult.tile,
          targetCount: currentResult.targetCount
        });
      }
      currentResult = currentResult.parentResult;
    }
    return path;
  }

  tileKey_(tile, targetCount) {
    return tile.x + ',' + tile.y + ',' + targetCount;
  }
}