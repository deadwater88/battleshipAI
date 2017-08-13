import React from 'react';
import Board from './board';
import Grid from './grid';
import ComputerPlayer from './computer_player';

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
    this.setUpHumanGame();
    this.state.direction = "h";
    this.state.phase = 5;
    this.state.selector = [0,0];
    this.renderShadow = this.renderShadow.bind(this);
    this.updateSelector = this.updateSelector.bind(this);
    this.placeShip = this.placeShip.bind(this);
    this.fire = this.fire.bind(this);
  }

  setUpHumanGame(){
    this.state.yourBoard  = new Board("Human");
    this.state.opponentBoard = new Board("AI1");
    this.state.computerPlayer1 = new ComputerPlayer(this.state.yourBoard ,this.state.opponentBoard);
  }

  setUpComputerGame(){
    this.state.yourBoard = new Board("AI1");
    this.state.opponentBoard = new Board("AI2");
    this.state.computerPlayer1 = new ComputerPlayer(this.state.opponentBoard, this.state.yourBoard);
    this.state.computerPlayer2 = new ComputerPlayer(this.state.yourBoard, this.state.opponentBoard);
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
      </div>
    );
  }
}

export default Game;
