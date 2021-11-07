function seed() {
  let result = [];
  for (let i = 0; i < arguments.length; i++) {
    result.push(arguments[i]);
  }
  return result;
}

function same([x, y], [j, k]) {
  let hor1,vert1,hor2,vert2;
  [hor1,vert1] = [x,y];
  [hor2, vert2] = [j,k];
  return (hor1 !== hor2) || (vert1 !== vert2) ? false : true;
}

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) {
  this.cell = cell;
  for (let i = 0; i < this.length; i++) {
    let checkResult = same(this[i], this.cell);
    if (checkResult) return true;
  }
  return false;
}
const printCell = (cell, state) => {
  let currentState = contains.call(state, cell);
  return currentState ? '\u25A3' : '\u25A2'; 
};

const corners = (state = []) => {
  //if length of passed state is 0, return topRight and bottomLeft values as [0,0]
  if (state.length === 0) return {topRight: [0,0], bottomLeft: [0,0]}

  let currLarHor = state[0][0];
  let currLarVert = state[0][1];
  let currSmaHor = state[0][0];
  let currSmaVert = state[0][1];

  //find the largest horizontal value among all the given cells
  for (let i = 0; i < state.length; i++) {
      if (state[i][0] > currLarHor) {
        currLarHor = state[i][0];
      }
  }

  //find the largest vertical value among all the given cells
  for (let i = 0; i < state.length; i++) {
      if (state[i][1] > currLarVert) {
        currLarVert = state[i][1];
      }
  }

  // find the smallest horizontal value among all the given cells
  for (let i = 0; i < state.length; i++) {
      if (state[i][0] < currSmaHor) {
        currSmaHor = state[i][0];
      }
  }

  //find the smallest vertical value among all the given cells
  for (let i = 0; i < state.length; i++) {
      if (state[i][1] < currSmaVert) {
        currSmaVert = state[i][1];
      }
  }

  //return an object containing both the topRight and bottomLeft properties
  return {
    topRight: [currLarHor, currLarVert],
    bottomLeft: [currSmaHor, currSmaVert]
  };   
};

/* .....Start of Helper Functions.........*/
//generates an array containing values starting from the smallest value to the largest value 
const arrayGenerator = (larVal, smaVal) => {
  let i = smaVal;
  let arr = [];

  while(smaVal <= larVal) {
      arr.push(smaVal);
      smaVal++;
  }
  return arr;
};

//generates an array containing all cells between two given arrays
const allCellsGenerator = (arr1,arr2) => {
  let newArr = [];
  for(let i = 0; i < arr1.length; i++) {
      for(let j = 0; j < arr2.length; j++) {
          newArr.push([arr1[i],arr2[j]]);
      }
  }
  return newArr;
}

//generate array rows using a vertical value 
const rowArrGenerator = (arr, vertVal) => {
  let rowArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (vertVal === arr[i][1]) {
      rowArr.push(arr[i]);
    }
  }
  return rowArr;
}

/*......End of Helper Functions...........*/

const printCells = (state) => {
  //use the corners() to return the topRight and bottomLeft values of the passed in state
  let cornersObject = corners(state);
  let largHorVal = cornersObject.topRight[0];
  let largVertVal = cornersObject.topRight[1];
  let smaHorVal = cornersObject.bottomLeft[0];
  let smaVertVal = cornersObject.bottomLeft[1];
  let rowsArr = [];
  let returnValue = '';

  //get all the cells that fall within the topRight and bottomLeft values
  
  let horArr = arrayGenerator(largHorVal,smaHorVal);
  let verArr = arrayGenerator(largVertVal,smaVertVal);

  let allCells = allCellsGenerator(horArr,verArr);

  //create array rows from all our cells
  for(let i = (verArr.length - 1); i >= 0; i--) {
    rowsArr.push(rowArrGenerator(allCells, verArr[i]));
  }

  //create return value for printCells()
  for (let i = 0; i < rowsArr.length; i++) {
    for (let j = 0; j < rowsArr[i].length; j++) {
        let currVal = printCell(rowsArr[i][j], state);
        returnValue = returnValue + currVal + ' ';
    }
    returnValue = returnValue + '\n';
  }

  return returnValue;
};

const getNeighborsOf = ([x, y]) => {
  let larHorVal = x + 1;
  let larVertVal = y + 1;
  let smaHorVal = x - 1;
  let smaVertVal = y - 1;

  //create array containing all of the horizontal values
  let horArr = arrayGenerator(larHorVal,smaHorVal);
  
  //create array containing all of the vertical values
  let vertArr = arrayGenerator(larVertVal,smaVertVal);

  //create array containing all cells
  let allCells = allCellsGenerator(horArr,vertArr);

  //remove the passed cell from array containing all cells
  for (let i = 0; i < allCells.length; i++) {
    if ((allCells[i][0] === x) && (allCells[i][1] === y)) {
      allCells.splice(i,1);
    }
  }

  //return the resulting array
  return allCells; 
};

const getLivingNeighbors = (cell, state) => {
  let livingNeighborCells = [];

  //get all neighboring cells
  let allNeighborCells = getNeighborsOf(cell);

  //bind the current state to the contains()
  let getCellState = contains.bind(state);

  //check which neigboring cells are alive
  for (let i = 0; i < allNeighborCells.length; i++) {
    if(getCellState(allNeighborCells[i])) {
      livingNeighborCells.push(allNeighborCells[i]);
    }
  }

  return livingNeighborCells;
};

const willBeAlive = (cell, state) => {
  //get all the living neighbors of current cell
  let livingNeighborCells = getLivingNeighbors(cell,state);

  //check for the state of our current cell
  let getCurrentCellState = contains.bind(state);
  let currentCellState = getCurrentCellState(cell);

  //check if the current cell will be alive
  if ((livingNeighborCells.length === 3) || 
      (currentCellState && (livingNeighborCells.length === 2))) {
    return true;
  }

  return false;
};

const calculateNext = (state) => {
  let nextGameState = [];
  //get object with current topRight and bottomLeft values 
  let currentCornersObj = corners(state);

  //extend topRight corner by one column to the right
  let larHorVal = currentCornersObj.topRight[0] + 1;
  let larVertVal = currentCornersObj.topRight[1] + 1;

  //extend bottomLeft corner by one column to the left
  let smaHorVal = currentCornersObj.bottomLeft[0] - 1;
  let smaVertVal = currentCornersObj.bottomLeft[1] - 1;

  //generate all cells within the new corners; grid search area
  let horArr = arrayGenerator(larHorVal,smaHorVal);
  let verArr = arrayGenerator(larVertVal,smaVertVal);
  let allNextGameStateCells = allCellsGenerator(horArr,verArr);

  //find all current cells that will be alive in the next game state
  for (let i = 0; i < allNextGameStateCells.length; i++) {
    if (willBeAlive(allNextGameStateCells[i],state)) {
      nextGameState.push(allNextGameStateCells[i]);
    }
  }

  //return all living cells for the next game state
  return nextGameState;
};

const iterate = (state, iterations) => {
  let gameStates = [];
  for (let i = 0; i < iterations; i++) {
    //1. before generating the next state, first store our current state
    gameStates.push(state);
    //2. generate the new state and save it as our current state
    state = calculateNext(state);
  }

  //save the last generated game state
  gameStates.push(state);

  return gameStates;
};

const main = (pattern, iterations) => {
	//find the value of the given game state pattern
  let currentGameState = startPatterns[pattern];

  //calculate the next game states
  let gameStates = iterate(currentGameState,iterations);

  //print out all the gameStates
  for (let i = 0; i < gameStates.length; i++) {
    console.log(printCells(gameStates[i]));
  }
};

const startPatterns = {
    rpentomino: [
      [3, 2],
      [2, 3],
      [3, 3],
      [3, 4],
      [4, 4]
    ],
    glider: [
      [-2, -2],
      [-1, -2],
      [-2, -1],
      [-1, -1],
      [1, 1],
      [2, 1],
      [3, 1],
      [3, 2],
      [2, 3]
    ],
    square: [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2]
    ]
  };
  
  const [pattern, iterations] = process.argv.slice(2);
  const runAsScript = require.main === module;
  
  if (runAsScript) {
    if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
      main(pattern, parseInt(iterations));
    } else {
      console.log("Usage: node js/gameoflife.js rpentomino 50");
    }
  }
  
  exports.seed = seed;
  exports.same = same;
  exports.contains = contains;
  exports.getNeighborsOf = getNeighborsOf;
  exports.getLivingNeighbors = getLivingNeighbors;
  exports.willBeAlive = willBeAlive;
  exports.corners = corners;
  exports.calculateNext = calculateNext;
  exports.printCell = printCell;
  exports.printCells = printCells;
  exports.startPatterns = startPatterns;
  exports.iterate = iterate;
  exports.main = main;