import React from 'react';
import Board from './board';
import Grid from './grid';
import ComputerPlayer from './computer_player';

class Game extends React.Component {
  constructor(props){
    super(props);
    this.renderShadow = this.renderShadow.bind(this);
    this.updateSelector = this.updateSelector.bind(this);
    this.placeShip = this.placeShip.bind(this);
    this.fire = this.fire.bind(this);

    let choice = window.prompt("Human vs AI or AI vs AI (h/a)?").toLowerCase();
    if (choice === "h") {
      this.setUpHumanGame();
    } else {
      this.setUpComputerGames();
    }
    this.computerLibrary = {experience: this.computerPlayer1.experience};
  }

  setUpHumanGame(){
    this.state = {};
    this.state.yourBoard = new Board("Human");
    this.state.opponentBoard = new Board("AI1");
    this.computerPlayer1 = new ComputerPlayer(this.state.yourBoard ,this.state.opponentBoard);
    this.state.direction = "h";
    this.state.phase = 5;
    this.state.selector = [0,0];
  }

  setUpComputerGames(){
    this.cyclesRan = 0;
    this.targetCycles = window.prompt("How many Cycles do you want run?");
    this.state = {yourBoard: {}, opponentBoard: {}};
    let yourBoard = new Board("AI1");
    let opponentBoard = new Board("AI2");
    this.computerPlayer1 = new ComputerPlayer(opponentBoard, yourBoard);
    this.computerPlayer2 = new ComputerPlayer(yourBoard, opponentBoard);
    this.setState({yourBoard, opponentBoard})
  }

  resetComputerGame(){
    let yourBoard = new Board("AI1");
    let opponentBoard = new Board("AI2");
    this.computerPlayer1.enemyboard = opponentBoard;
    this.computerPlayer1.board = yourBoard;
    this.computerPlayer2.enemyboard = yourBoard;
    this.computerPlayer2.board = opponentBoard;
    this.computerPlayer1.reset();
    this.computerPlayer2.reset();
    this.setState({yourBoard, opponentBoard});
  }

  runComputerCycle(){
    while(!(this.state.yourboard.isDefeated || this.state.opponentBoard.isDefeated)) {
      this.computerPlayer1.fireShot();
      this.computerPlayer2.fireShot();
      this.setState({yourboard: this.computerPlayer1.board, opponentBoard: this.computerPlayer2.board});
    }
    debugger;
    console.log(`${this.cyclesRan} cycles ran so far`)
  }


  componentWillMount(){
    document.body.addEventListener("keydown", this.switchDirections.bind(this) );
  }

  componentDidUpdate(){
    window.state = this.state;
  }

  switchDirections(){
    let direction = this.state.direction === "h" ? "v" : "h";
    this.clearShadows();
    this.setState({direction}, this.renderShadow);
  }

  updateSelector(e){
    let data = e.target.getAttribute("data");
    if (data) {
      let selector = data.split("-").map((int)=> parseInt(int));
      this.setState({selector}, this.renderShadow);
    }
  }

  renderShadow(){
    let coordinate = this.state.selector;
    if (this.state.phase < 2){
      return false;
    }
    this.clearShadows();
    let [x,y] = coordinate;
    let coordinates = this.state.yourBoard.identifyGrids(this.state.phase, x, y, this.state.direction);
    coordinates.forEach((_coordinate)=>{
      let [x,y] = _coordinate;
      this.state.yourBoard.grid[y][x].shadow = true;
    });
    this.setState({yourBoard: this.state.yourBoard});
  }

  clearShadows(){
    this.state.yourBoard.allGrids().forEach((cell)=>{
      if (cell.ship === 0){
        cell.shadow = false;
      }
    });
  }


  placeShip(){
    if (this.state.phase < 2){
      return false;
    }
    let [x, y] = this.state.selector;
    let {phase, direction} = this.state;
    let board = this.state.yourBoard;
    if (board.isValidPlacement(phase, x, y, direction)) {
      board.placeShip(phase, x, y, direction);
      phase -= 1;
      let message = phase > 1 ? "Ship Successfully Placed" : "You can now fire on your opponent's board"
      this.setState({board, phase, message});
    } else {
      this.setState({message: "Invalid Placement. Please Try Again"});
    }
  }

  generateExperienceURL(text){
    var textFile = null
    var data = new Blob([text], {type: 'text/plain'});
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return textFile;
  }

  renderOpponentBoard(){
    return (<div className="board">
      <h1> Opponent's Board </h1>
      <div onClick={this.fire}>
        <Grid  grid={this.state.opponentBoard.grid} updateSelector={this.updateSelector} />
      </div>
    </div>);
  }

  fire(){
    let {selector, opponentBoard} = this.state;
    opponentBoard.fireOnCoordinate(selector);
    let message = opponentBoard.message;
    this.setState({opponentBoard, message});
    if (opponentBoard.isDefeated()) {
      window.alert("You've sunk all of the enemy's  ships!");
    }
    this.computerPlayer1.fireShot();
    if (this.state.yourBoard.isDefeated()) {
      window.alert("The enemy has sunk all of your ships!");
    }
    this.setState({yourboard: this.state.yourboard});
  }


  render(){
    return(
      <div className="Game">
        <h2> {this.state.message} </h2>
        <h2> Shots Fired: {this.state.opponentBoard.shotsfired} </h2>
        <div className="boards">
          <div className="board">
            <h1> Your Board </h1>
            {this.state.phase > 1 ? <h2> Place your ships.  Press any key to change placement direction </h2> : " "}
            <div onClick={this.placeShip}>
              <Grid  grid={this.state.yourBoard.grid} updateSelector={this.updateSelector} />
            </div>
          </div>
          {this.state.phase === 1 ? this.renderOpponentBoard() : ""}
        </div>
        <a href={this.generateExperienceURL(this.computerPlayer1.renderExperience())} download={"experience.txt"}> Download AI Experience text </a>
      </div>
    );
  }
}

export default Game;
