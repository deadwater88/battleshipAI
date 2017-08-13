class ComputerPlayer {
  constructor(enemyboard, board){
    this.enemyboard = enemyboard;
    this.board = board;
    this.setupboard();
  }

  setupboard(){
    while (this.board.phase > 1) {
      let {x,y,direction} = this.randomPlacementPosition();
      this.board.placeShip(this.board.phase, x, y, direction)
    };
  }

  randomPlacementPosition(){
    let x = parseInt(Math.random(1) * 8 );
    let y = parseInt(Math.random(1) * 8 );
    let direction;
    if (Math.random() > .5) {
      direction = "h";
    } else {
      direction = "v";
    }
    return {x, y, direction}
  }
}

export default ComputerPlayer;
