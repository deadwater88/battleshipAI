class ComputerPlayer {
  constructor(enemyboard, board){
    this.enemyboard = enemyboard;
    this.board = board;
    this.setupboard();
    this.mode = "blind";
    this.read("/experience.txt")
  }

  read(textFile){
      var xhr=new XMLHttpRequest;
      xhr.open('GET',textFile);
      xhr.onload = (res) => {
        this.experience = JSON.parse(res.currentTarget.response);
        }
      xhr.send()
  }

  saveExperience(){
    let txtFile = "/experience.txt";
    let file = new File(txtFile);
    file.open("w");
    file.write(JSON.stringify(this.experience));
    file.close();
  }

  setupboard(){
    while (this.board.phase > 1) {
      let {x,y,direction} = this.randomPlacementPosition();
      this.board.placeShip(this.board.phase, x, y, direction);
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
    return {x, y, direction};
  }

  fire(){

  }


}

export default ComputerPlayer;
