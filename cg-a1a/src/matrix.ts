// Matrix Commands (for you to write!)

// You should modify the routines listed below to complete the assignment.
// Feel free to define any classes, global variables and helper routines that
// you need.
let ctm: number[][];

// set the current matrix to the identity
function init()
{
    ctm = [];

    for (let i = 0; i < 4; i++) {
        ctm[i] = [];
        for (let j = 0; j < 4; j++) {
            if (i == j) {
                ctm[i][j] = 1;
            } else {
                ctm[i][j] = 0;
            }
        }
    }
}

// multiply the current matrix by the translation
function translate(x: number, y: number, z: number)
{
    let old_ctm = ctm;
    init();
    let scale = ctm;

    scale[0][3] += x;
    scale[1][3] += y;
    scale[2][3] += z;

    matrixMult(old_ctm, scale);
}

// multiply the current matrix by the scale
function scale(x: number, y: number, z: number)
{
    let old_ctm = ctm;
    init();
    let scale = ctm;

    scale[0][0] *= x;
    scale[1][1] *= y;
    scale[2][2] *= z;

    matrixMult(old_ctm, scale);
}

// multiply the current matrix by the rotation
function rotateX(angle: number)
{
    let old_ctm = ctm;
    init();
    let scale = ctm;
    angle = angle * ((Math.PI)/180);


    scale[1][1] *= Math.cos(angle);
    scale[1][2] += -Math.sin(angle);
    scale[2][1] += Math.sin(angle);
    scale[2][2] *= Math.cos(angle);

    matrixMult(old_ctm, scale);
}

// multiply the current matrix by the rotation
function rotateY(angle: number)
{
    let old_ctm = ctm;
    init();
    let scale = ctm;
    angle = angle * ((Math.PI)/180);

    scale[0][0] *= Math.cos(angle);
    scale[0][2] += Math.sin(angle);
    scale[2][0] += -(Math.sin(angle));
    scale[2][2] *= Math.cos(angle);

    matrixMult(old_ctm, scale);
}

// multiply the current matrix by the rotation
function rotateZ(angle: number)
{
    let old_ctm = ctm;
    init();
    let scale = ctm;
    angle = angle * ((Math.PI)/180);

    scale[0][0] *= Math.cos(angle);
    scale[0][1] += -(Math.sin(angle));
    scale[1][0] += Math.sin(angle);
    scale[1][1] *= Math.cos(angle);

    matrixMult(old_ctm, scale);
}

// print the current matrix
function print()
{
    // add code here!
    // use `console.log("something")` to print something to the browser console.
    for (let i = 0; i < ctm.length; i++) {
        let currString = "";
        for (let j = 0; j < ctm[i].length; j++) {
            if (j == ctm[i].length - 1) {
                currString = currString + ctm[i][j]
            } else {
                currString = currString + ctm[i][j] + ", "
            }
        }
        console.log(currString);
    }
    // end with a blank line!
    console.log("")
}

// return the current matrix as an array of 16 numbers
// in row major order (i.e., elements 0..3 are row 1, 4..7 are row2,
// 8..11 are row3, and 12..15 are row4)
function currentMatrix() : number[]
{
    let ret = [];
    let idx = 0;
    for (let i = 0; i < ctm.length; i++) {
        for (let j = 0; j < ctm[i].length; j++) {
            ret[idx] = ctm[i][j];
            idx++;
        }
    }
    return ret;
}

function matrixMult(old_ctm: number[][], scale_matrix: number[][])
{
    init();
    console.log("MULTIPLY:");
    console.log(old_ctm);
    console.log(scale_matrix);

    for (let i = 0; i < ctm.length; i++) {
        for (let j = 0; j < ctm.length; j++) {
            let num = 0;
            for (let k = 0; k < ctm.length; k++) {
                num += old_ctm[i][k] * scale_matrix[k][j];
            }
            ctm[i][j] = num;
        }
    }

}

function toDegrees(radians: number) {
    let pi = Math.PI;
    return radians * (180/pi);
}

export {init, translate, scale, rotateX, rotateY, rotateZ, print, currentMatrix}
