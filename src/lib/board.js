class Board {
  constructor(owner){
    this.owner = owner
    this.grid = Array(8).fill(1);
    this.grid = this.grid.map(()=>{
      return Array(8).fill(1).map(()=> {
        return {ship: 0, hit: false, miss: false, shadow: false};
      });
    });
    this.shipstatus = {};
    for (let i = 2; i <= 5; i++){
      this.shipstatus["" + i] = i;
    }
    this.phase = 5;
    this.message = "Please Setup Board: Place a size 5 ship";
  }

  allGrids(){
    let allgrids = [];
    this.grid.forEach((row)=>{
      row.forEach((cell)=>{
        allgrids.push(cell);
      });
    });
    return allgrids;
  }

  identifyGrids(size, x, y, direction){
    let grids = [];
    let start;
    if (direction === "h") {
      start = Math.min(8 - size, x);
      for (let col = start; col < start + size; col++) {
        grids.push([col, y]);
      }
    } else {
      start = Math.min(8 - size, y);
      for (let row = start; row < start + size; row++) {
        grids.push([x, row]);
      }
    }
    return grids;
  }

  placeShip(size, x, y, direction){
    if (!this.isValidPlacement(size, x, y, direction)) {
      this.message + "A ship already exist in this spot";
      return false;
    }

    let grids = this.identifyGrids(size, x, y, direction);
    grids.forEach((coordinate)=>{
      let [col, row] = coordinate;
      this.grid[row][col].ship = size;
      return true;
    });
    this.phase -= 1;
    return true;
  }

  isValidPlacement(size, x, y, direction){
    let grids = this.identifyGrids(size, x, y, direction);
    return grids.every((coordinate)=>{
      let [x, y] = coordinate;
      let cell = this.grid[y][x];
      return cell.ship === 0;
    });
  }

  fireOnCoordinate(coordinate){
    if (!this.isValidFire(coordinate)){
      this.message = "You've already fired on this coordinate!";
      return false;
    }

    let [row, col] = coordinate;
    let cell = this.grid[row][col];
    if (cell.ship !== 0) {
      cell.hit = true;
      this.shipstatus["" + cell.ship] -= 1;
      if (this.shipstatus["" + cell.ship] === 0) {
        this.message = `You've sunk my ship of size ${cell.ship}!`;
      }
      return "hit";
    } else {
      cell.miss = true;
        this.message = "You've Missed!"
      return "miss";
    }

  }

  isValidFire(coordinate){
    let [row, col] = coordinate;
    !(this.grid[row][col].hit || this.grid[row][col].miss);
  }

}


export default Board;