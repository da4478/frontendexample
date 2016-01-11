/*
 * Code example
 * Author: Darius Augaitis, dariusaugaitis@gmail.com, 07570033865
 */
(function () {

    'use strict';
    window.NAMESPACE = {};

    window.NAMESPACE.GameOfLife = function () {

        var matrixs = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
                matrixsTmp = [];

        function isCellAlive(row, column) {

            return (matrixs[row] && matrixs[row][column] === 1) ? true : false;
        }

        function toggleCellState(row, column) {

            matrixs[row][column] = 1;

            return this;

        }

        //private function for killing or making alive
        function setTrueState(row, column) {
            if (matrixsTmp.length === 0) {
                matrixsTmp = JSON.parse(JSON.stringify(matrixs));
            }
            //lets get all arround lives
            var i = 3,
                    liveB = 0,
                    currentCell = isCellAlive(row, column);

            while (i--) {
                var j = 3;
                while (j--) {
                    if (isCellAlive(row - 1 + i, column - 1 + j)) {
                        liveB++;
                    }
                }
            }
            if (currentCell) {
                liveB--;
            }

            if ((liveB < 2 || liveB > 3) && currentCell) {
                matrixsTmp[row][column] = 0;
            } else if (liveB === 2 || liveB === 3) {
                matrixsTmp[row][column] = 1;
            } else if (!currentCell && liveB === 3) {
                matrixsTmp[row][column] = 1;
            } else {
                matrixsTmp[row][column] = 0;
            }

        }

        function tick() {

            var i = matrixs.length;
            while (i--) {
                var j = matrixs[i].length;
                while (j--) {

                    setTrueState(i, j);
                }
            }
            matrixs = matrixsTmp;
            matrixsTmp = [];

        }

        //Allowing to call and access only publick functions and variables
        return {
            isCellAlive: isCellAlive,
            toggleCellState: toggleCellState,
            tick: tick
        };
    };
})();
