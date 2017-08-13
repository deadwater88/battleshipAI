import React from 'react';
import Cell from './cell';



  const Grid = (props) => {
    let {grid} = props;
      return(
        <div className="board">
          <ul>
            {grid.map((row, row_idx)=>{
              return (<ul className="row" key={"row" + row_idx}>
                {row.map((cell,col_idx)=> {
                  let coordinate = [col_idx, row_idx];
                  return <Cell key={`cell-${row_idx}-${col_idx}`} {...grid[row_idx][col_idx]}
                              coordinate={coordinate}
                              updateSelector={props.updateSelector}
                              />;
                  })
                }
              </ul>);
            })
            }
          </ul>
        </div>
      );
    };

export default Grid;
