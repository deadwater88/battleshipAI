import React from 'react';

class Cell extends React.Component {
  constructor(props){
    super(props);
    this.state = {coordinate: props.coordinate};
  }

  render(){
    let {hit, miss, coordinate, shadow} = this.props;
    let classes = "cell";
    if (hit) {
      classes += " hit";
    } else if (miss) {
      classes += " miss";
    }
    if (shadow) {
      classes += " shadow";
    }

    return (
    <div className={classes}
         data={coordinate.join("-")}
         onMouseEnter={this.props.updateSelector}>
      <div className="hitMark">
        Hit!
      </div>
      <div className="missMark">
        Miss!
      </div>
      <div className="shadowMark">
        O
      </div>
    </div>);

  }
}

export default Cell;
