import React from 'react';
import Board from './board';
import Grid from './grid';
import ComputerPlayer from './computer_player';
import ComputerPlayerMk2 from './computer_player_mk2';
import math from 'mathjs';

class Game extends React.Component {
  constructor(props){
    super(props);
    this.renderShadow = this.renderShadow.bind(this);
    this.updateSelector = this.updateSelector.bind(this);
    this.placeShip = this.placeShip.bind(this);
    this.fire = this.fire.bind(this);
    this.runComputerCycle = this.runComputerCycle.bind(this);
    this.resetComputerGame = this.resetComputerGame.bind(this);

    let choice = window.prompt("Human vs AI or AI vs AI (h/a)?").toLowerCase();
    if (choice == "h") {
      this.setUpHumanGame();
    } else {
      this.setUpComputerGames();
    }
    this.computerLibrary = {experience: this.computerPlayer1.experience};
    window.math = math;
  }

  setUpHumanGame(){
    this.state = {};
    this.state.yourBoard = new Board("Human");
    this.state.opponentBoard = new Board("AI1");
    this.computerPlayer1 = new ComputerPlayer(this.state.yourBoard ,this.state.opponentBoard);
    this.state.direction = "h";
    this.state.phase = 3;
    this.state.selector = [0,0];
  }
  //setup for human vs AI game

  setUpComputerGames(){
    this.shotsfiredLog = [];
    this.computerGame = true;
    this.cyclesRan = 0;
    this.targetCycles = window.prompt("How many Cycles do you want run?");
    let yourBoard = new Board("AI1");
    let opponentBoard = new Board("AI2");
    this.state = {yourBoard, opponentBoard};
    this.state.phase = 1;
    this.computerPlayer1 = new ComputerPlayerMk2(opponentBoard, yourBoard);
    this.computerPlayer2 = new ComputerPlayer(yourBoard, opponentBoard);
  }
  //setup for AI vs AI games


  componentDidMount(){
    if (this.computerGame) {
      setTimeout(this.runComputerCycle,0);
    }
  }
  //will start computer cycling after component mounts


  resetComputerGame(){
    let yourBoard = new Board("AI1");
    let opponentBoard = new Board("AI2");
    this.computerPlayer1.enemyboard = opponentBoard;
    this.computerPlayer1.board = yourBoard;
    this.computerPlayer2.enemyboard = yourBoard;
    this.computerPlayer2.board = opponentBoard;
    this.computerPlayer1.reset();
    this.computerPlayer2.reset();
    this.setState({yourBoard, opponentBoard}, this.runComputerCycle);
  }
  //resets computers and boards and forces re-render and then will trigger another game cycle

  runComputerCycle(){
    if (this.cyclesRan > this.targetCycles) {
      return;
    }
    if (this.state.yourBoard.isDefeated() || this.state.opponentBoard.isDefeated()){
      debugger;
      this.cyclesRan += 1;
      this.shotsfiredLog.push(this.state.opponentBoard.shotsfired);
      return this.resetComputerGame();
    } else {
      this.computerPlayer1.fireShot();
      this.computerPlayer2.fireShot();
      return this.setState({yourBoard: this.computerPlayer1.board, opponentBoard: this.computerPlayer2.board}, this.runComputerCycle);
    }
  }
  //Runs computer cycle, and then triggers re-render and and then runs more cycles


  componentWillMount(){
    document.body.addEventListener("keydown", this.switchDirections.bind(this) );
  }
  //add eventlistener for changing placement direction. Human only.

  componentDidUpdate(){
    window.state = this.state;
  }
  //makes state accessible on window

  switchDirections(){
    let direction = this.state.direction === "h" ? "v" : "h";
    this.clearShadows();
    this.setState({direction}, this.renderShadow);
  }
  //changes placement direction and force re-render; Human only.

  updateSelector(e){
    let data = e.target.getAttribute("data");
    if (data) {
      let selector = data.split("-").map((int)=> parseInt(int));
      this.setState({selector}, this.renderShadow);
    }
  }
  // updates coordinate of selector by checking data-coordinate of target event cell. Human only.

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
  // renders shadows indicating where ship will be placed. Human only.

  clearShadows(){
    this.state.yourBoard.allGrids().forEach((cell)=>{
      if (cell.ship === 0){
        cell.shadow = false;
      }
    });
  }
  // clears placement shadows. Human only.


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
      let message = phase > 1 ? "Ship Successfully Placed" : "You can now fire on your opponent's board";
      this.setState({board, phase, message});
    } else {
      this.setState({message: "Invalid Placement. Please Try Again"});
    }
  }
  //places ship based on selector coordinates, current phase, and direction

  generateExperienceURL(text){
    var textFile = null;
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
  //generates text copy of computer experience for download.


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

  // fires on cell based on current selector. Human only.

  renderOpponentBoard(){
    return (<div className="board">
    <h1> Opponent's Board </h1>
    <div onClick={this.fire}>
      <Grid  grid={this.state.opponentBoard.grid} updateSelector={this.updateSelector} />
    </div>
  </div>);
  }

  // renders opponentboard. Conditionally rendered on phase === 1

  renderCyclingStats(){
    return (
    <h2>
      <div> Cycles Ran: {this.cyclesRan} </div>
      <div> Shotsfired per game: {this.shotsfiredLog.join(", ")} </div>
      <div> Average shots required: {this.shotsfiredLog.length === 0 || (this.shotsfiredLog.reduce((a,b)=> a + b ) / this.shotsfiredLog.length) }</div>
    </h2>)
  }
  // renders computer cycling stats. conditionally rendered on this.computerGame === true

  render(){
    return(
      <div className="Game">
        {this.computerGame ? this.renderCyclingStats() : ""}
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
      </div>
    );
  }
}

export default Game;
