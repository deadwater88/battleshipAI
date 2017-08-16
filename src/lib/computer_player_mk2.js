import math from 'mathjs';

class ComputerPlayerMk2 {
  constructor(enemyboard, board){
    this.enemyboard = enemyboard;
    this.board = board;
    this.past_states = [];
    this.setupboard();
    this.state = this.initializeState();
    this.state_vector = this.generateStateVector(this.state);
    this.transformation = this.initializeTransformationMatrix();
    this.p_state = this.applyTransformationMatrix(this.state_vector, this.transformation);
    this.transformations = [];
    // return this.read("/experience.txt");
  }

  read(textFile){
      var xhr = new XMLHttpRequest;
      xhr.open("GET",textFile);
      xhr.onload = (res) => {
        this.experience = JSON.parse(res.currentTarget.response);
      };
      xhr.send();
  }
  // loads experience txt. Currently not used.
  initializeState(){
    return Array(3).fill(0).map(()=> Array(3).fill(.5));
  }

  generateStateVector(state){
    return state.reduce((a,b)=> a.concat(b));
  }

  initializeTransformationMatrix(){
    let transformation = Array(9).fill(1).map(()=> []);
    for (let x = 0; x < 9; x++) {
      for (let y = 0; y < 9; y ++) {
        transformation[x][y] = parseInt(Math.random() * 100);
      }
    }
    return transformation;
  }

  calculate_average_error(pastStates, endState){
    let errors = pastStates.map((pastState)=> {
      var error = 0;
      for (let i = 0; i < pastState.length; i++){
        error += pastState[i] - endState[i];
      }
      return error;
    });
    return errors.reduce((a,b)=> a + b) / errors.length;
  }

  updateTransformationMatrix(score, transformation){
    let nextTransformationBase;
    let lastTransformationObject = this.transformations[this.transformations.length - 1];
    if ( this.transformations.length === 0 || lastTransformationObject.score > score) {
      nextTransformationBase = transformation;
      this.recordTransformationScore(score, transformation);
    } else {
      nextTransformationBase = lastTransformationObject.transformation;
    }
  }

  recordTransformationScore(score, transformation){
    this.transformations.push({score, transformation});
  }

  generateNewTransformationMatrix(score){
    let diff = Math.abs(this.lastScore - score);
    let mutation_chance
    let mutation_rate
    this.last_transformuation = this.transformation;
    this.transformation = this.transformation.map((row)=>{
      return row.map((val)=>{
        return Math.random() < mutation_chance ? Math.random() : val;
      });
    });
  }

  applyTransformationMatrix(transformation, state){
    let t_matrix = math.matrix(transformation);
    let p_state = math.multiply(state, t_matrix)._data;
    return this.normalizeVector(p_state);
  }

  normalizeVector(vector){
    let total = vector.reduce((a,b)=> a + b);
    return vector.map((val) => val/total);
  }


  reset(){
    this.setupboard();
    this.state = this.initializeState();
    this.state_vector = this.generateStateVector(this.state);
    this.p_state = this.applyTransformationMatrix(this.state_vector, this.transformation);
    this.past_states = [];
  }
  //prepares computer for new game by regenerating candidates and resetting hunted queue,
  //newboard should be fed into the player from outside.

  //Generates string version of computer's experience

  setupboard(){
    while (this.board.phase > 1) {
      let {x,y,direction} = this.randomPlacementPosition();
      this.board.placeShip(this.board.phase, x, y, direction);
    }
  }
  // setsup board by placing new ships

  randomPlacementPosition(){
    let x = parseInt(Math.random(1) * 3 );
    let y = parseInt(Math.random(1) * 3 );
    let direction;
    if (Math.random() > .5) {
      direction = "h";
    } else {
      direction = "v";
    }
    return {x, y, direction};
  }
  // generates a random placement object for placing ship randomly


  fireShot(){
    let strCoordinate = this.selectByWeightedProbability();
    this.fire(strCoordinate);
  }
  // fires a shot either blind or hunting; blind shots are generated probablistically
  // hunted shots are fired based on neighbors of successful hits;



  fire(strCoordinate){
    this.past_states.push(JSON.parse(JSON.stringify(this.generateStateVector(this.state))));
    let targetCoordinate = strCoordinate.split("-").map((num)=> parseInt(num));
    let [x,y] = targetCoordinate;
    let result = this.enemyboard.fireOnCoordinate(targetCoordinate);
    if (result) {
      this.state[y][x] = 1;
    } else {
      this.state[y][x] = 0;
    }
    this.p_state = this.calculate_p_state(this.state);
  }

  // After firing, candidate coordinate is removed from both candidate lists

  calculate_p_state(state){
    this.state_vector = this.generateStateVector(state);
    this.transformation = this.initializeTransformationMatrix();
    return this.applyTransformationMatrix(this.state_vector, this.transformation);
  }

  selectByWeightedProbability(){
    this.weights = {};
    let {p_state} = this;
    let i = 0;
    for (let x = 0; x < 3; x++){
      for (let y = 0; y < 3; y++) {
        let strCoord = `${x}-${y}`;
        this.weights[strCoord] = p_state[i];
        i++;
      }
    }
    let totalweight = 0;
    for (let candidate in this.weights) {
      totalweight += this.weights[candidate];
    }
    for (let candidate in this.weights) {
      if (Math.random() < this.weights[candidate]/totalweight) {
        return candidate;
      }
      else {
        totalweight -= this.weights[candidate];
      }
    }
  }
  //Targeting heuristics. Initially assumes that all grids are equally likely.
  //The computer will track the total number of hits generated for each coordinate.
  //And will proportionally have a higher chance of selecting those coordinates in selection.
  //Will likely require several hundred games before effects are significant.


}



export default ComputerPlayerMk2;
