class Board {
  constructor(owner){
    this.owner = owner;
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
    this.shotsfired = 0;
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
  // Used for ship placement. Given a coordinate, direction and size of the ship,
  // will return a list of cooresponding coordinates with length equal to size of ship.


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
  // places your ship

  isValidPlacement(size, x, y, direction){
    let grids = this.identifyGrids(size, x, y, direction);
    return grids.every((coordinate)=>{
      let [x, y] = coordinate;
      let cell = this.grid[y][x];
      return cell.ship === 0;
    });
  }
  //Used for validating ship placement by checking if all cells to be occupied currently has no ship (cell.ship === 0)

  fireOnCoordinate(coordinate){
    this.shotsfired += 1;
    if (!this.isValidFire(coordinate)){
      this.message = "You've already fired on this coordinate!";
      return false;
    }

    let [col, row] = coordinate;
    let cell = this.grid[row][col];
    if (cell.ship !== 0) {
      cell.hit = true;
      this.shipstatus["" + cell.ship] -= 1;
      if (this.shipstatus["" + cell.ship] === 0) {
        this.message = `You've sunk my ship of size ${cell.ship}!`;
      } else {
        this.message = "Hit!";
      }
      return true;
    } else {
      cell.miss = true;
      this.message = "You've Missed!";
      return false;
    }
  }
  // conducts firing on a coordinate. Returns false on invalid coordinate, true on valid coordinate, and false on invalid coordinate
  // also sets appropriate message.


  isValidFire(coordinate){
    let [col, row] = coordinate;
    return !(this.grid[row][col].hit || this.grid[row][col].miss);
  }

  // checks that a square has not been fired on before


  isDefeated(){
    let life = 0;
    for (let ship in this.shipstatus){
      life += this.shipstatus[ship];
    }
    return life === 0;
  }
  // checks the total sum of shipstatuses will return true if sum of ship statuses are zero

}


export default Board;
