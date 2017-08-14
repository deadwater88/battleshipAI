class ComputerPlayer {
  constructor(enemyboard, board){
    this.enemyboard = enemyboard;
    this.board = board;
    this.setupboard();
    this.mode = "blind";
    this.hunted = [];
    this.experience = {};
    this.generateCandidates();
    // return this.read("/experience.txt");
  }

  read(textFile){
      var xhr = new XMLHttpRequest;
      xhr.open("GET",textFile);
      xhr.onload = (res) => {
        this.experience = JSON.parse(res.currentTarget.response);
        this.generateCandidates();
      };
      xhr.send();
  }
  // loads experience txt. Currently not used.


  reset(){
    this.setupboard();
    this.mode = "blind";
    this.hunted = [];
    this.generateCandidates();
  }
  //prepares computer for new game by regenerating candidates and resetting hunted queue,
  //newboard should be fed into the player from outside.

  renderExperience(){
    return JSON.stringify(this.experience);
  }
  //Generates string version of computer's experience

  setupboard(){
    while (this.board.phase > 1) {
      let {x,y,direction} = this.randomPlacementPosition();
      this.board.placeShip(this.board.phase, x, y, direction);
    }
  }
  // setsup board by placing new ships

  randomPlacementPosition(){
    let x = parseInt(Math.random(1) * 8 );
    let y = parseInt(Math.random(1) * 8 );
    let direction;
    if (Math.random() > .5) {
      direction = "h";
    } else {
      direction = "v";
    }
    return {x, y, direction};
  }
  // generates a random placement object for placing ship randomly



  smallestEnemyShip(){
    let {shipstatus} = this.enemyboard;
    let smallestShip = 5;
    for (let ship in shipstatus) {
      if (shipstatus[ship] < smallestShip) {
        smallestShip = ship;
      }
    }
    return smallestShip;
  }

  //Returns smallest ship enemy ship size available. Will have possible use in enhancing heuristics. Currently not used.

  generateCandidates(){
    let candidate_weights = {};
    let all_candidates = {};
    for (let x = 0; x < 8; x++){
      for (let y = 0; y < 8; y++) {
        let strCoord = `${x}-${y}`;
        if ((x + y) % 2 === 1){
          candidate_weights[strCoord] = (this.experience[strCoord] || 1);
        }
          all_candidates[strCoord] = true;
      }
    }
    this.all_candidates = all_candidates;
    this.candidate_weights = candidate_weights;

  }
  // Generates list of candidate_weights in the form of a hash. Values are weighted based on experience and keyed in by target coordinate.
  // all_candidates are for identifying valid candidates during hunting (conditions are that the target coordinate is on the board and has not been fired at)

  fireShot(){
    let strCoordinate;
    switch (this.mode) {
      case "blind":
        strCoordinate = this.selectByWeightedProbability();
        this.fire(strCoordinate);
        break;
      case "hunt":
        strCoordinate = this.hunted.shift();
        this.fire(strCoordinate);
        break;
    }
  }
  // fires a shot either blind or hunting; blind shots are generated probablistically
  // hunted shots are fired based on neighbors of successful hits;



  fire(strCoordinate){
    let targetCoordinate = strCoordinate.split("-").map((num)=> parseInt(num));
    let result = this.enemyboard.fireOnCoordinate(targetCoordinate);
    switch (result) {
      case true:
        this.mode = "hunt";
        this.hunted = this.hunted.concat(this.neighbors(targetCoordinate));
        this.experience[strCoordinate] = (this.experience[strCoordinate] || 0) + 1;
        break;
      case false:
        break;
    }
    if (this.hunted.length === 0) {
      this.mode = "blind";
    }
    delete this.candidate_weights[strCoordinate];
    delete this.all_candidates[strCoordinate];
  }

  // After firing, candidate coordinate is removed from both candidate lists


  neighbors(targetCoordinate){
    let neighbors = [];
    let [x, y] = targetCoordinate;
    let dir = [[0,1], [1,0], [0,-1], [-1,0]];
    dir.forEach((dir)=>{
      let [dx, dy] = dir;
      let newTarget = [dx + x, dy + y];
      let strTarget = newTarget.join("-");
      if (this.all_candidates[strTarget]){
        neighbors.push(strTarget);
      }
    });
    return neighbors;
  }

  // generates a list of valid neighbor targets given a tile that his been successfully hit;



  selectByWeightedProbability(){
    let totalweight = 0;
    let {candidate_weights} = this;
    for (let candidate in candidate_weights) {
      totalweight += candidate_weights[candidate];
    }
    for (let candidate in candidate_weights) {
      if (Math.random() < candidate_weights[candidate]/totalweight) {
        return candidate;
      }
      else {
        totalweight -= candidate_weights[candidate];
      }
    }
  }


}



export default ComputerPlayer;
