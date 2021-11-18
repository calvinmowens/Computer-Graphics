import {Drawing, Vector, Point} from "./common"
import {init_tests, draw_tests} from "./projection_test"

// A class for our application state and functionality
class MyDrawing extends Drawing {

    ctm: number[][];
    cpm: number[][];
    viewport: number[][];
    vertexList: Point[];

    constructor (div: HTMLElement) {
        super(div)
        this.ctm = [];
        this.cpm = [];
        this.viewport = [];
        this.vertexList = [];
        init_tests(this)
    }

    drawScene() {
        draw_tests(this)
    }

    // Matrix and Drawing Library implemented as part of this object

    // Begin by using the matrix transformation routines from part A of this project.
    // Make your current transformation matrix a property of this object.
    // You should modify the new routines listed below to complete the assignment.
    // Feel free to define any additional classes, class variables and helper methods
    // that you need.


    beginShape() {
        // begin new vertex list for new shape
        this.vertexList = [];
    }

    endShape() {
        // iterate through array of adjusted points to draw lines, double increment
        for (let i = 0; i < this.vertexList.length; i++) {
            this.line(this.vertexList[i], this.vertexList[i + 1]);
            i++;
        }
        console.log(this.vertexList);
    }

    vertex(x: number, y: number, z: number) {
        // TODO: make point, make matrix, do mult (p * t * Point), reset point, push
        let pMatrix = [[x], [y], [z], [1]];

        console.log("pMatrix:");
        console.log(pMatrix);

        pMatrix = this.matrixMult(this.ctm, pMatrix, "ctm * p");

        console.log("pMatrix (ctm):");
        console.log(pMatrix);

        pMatrix = this.matrixMult(this.cpm, pMatrix, "cpm * p");

        console.log("pMatrix (cpm):");
        console.log(pMatrix);

        pMatrix = this.matrixMult(this.viewport, pMatrix, "viewport * p");

        console.log("pMatrix (viewport):");
        console.log(pMatrix);

        // TODO do division by w
        let myPoint: Point = {
            x: pMatrix[0][0] / pMatrix[3][0],
            y: pMatrix[1][0] / pMatrix[3][0],
            z: pMatrix[2][0] / pMatrix[3][0]
        }

        console.log("myPoint:");
        console.log(myPoint);

        this.vertexList.push(myPoint);
    }

    perspective(fov: number, near: number, far: number) {
        let s = (1 / Math.tan(fov * 0.5 * Math.PI / 180)) * near;
        for (let i = 0; i < 4; i++) {
            this.cpm[i] = [];
            for (let j = 0; j < 4; j++) {
                if (i == j) {
                    this.cpm[i][j] = 1;
                } else {
                    this.cpm[i][j] = 0;
                }
            }
        }

        this.cpm[0][0] = s;
        this.cpm[1][1] = s;
        this.cpm[2][2] = -(far/(far-near));
        this.cpm[2][3] = -1;
        this.cpm[3][2] = -((far*near)/(far-near));
        this.cpm[3][3] = 0;

        this.viewport = this.getViewport();
    }

    ortho(left: number, right: number, top: number, bottom: number,
        near: number, far: number ) {
        for (let i = 0; i < 4; i++) {
            this.cpm[i] = [];
            for (let j = 0; j < 4; j++) {
                if (i == j) {
                    this.cpm[i][j] = 1;
                } else {
                    this.cpm[i][j] = 0;
                }
            }
        }

        this.cpm[0][0] = (2/(right-left));
        this.cpm[0][3] = -((right+left)/(right-left));
        this.cpm[1][1] = (2/(top-bottom));
        this.cpm[1][3] = -((top+bottom)/(top-bottom));
        this.cpm[2][2] = (-2/(far-near));
        this.cpm[2][3] = -((far+near)/(far-near));

        this.viewport = this.getViewport();
	}

    getViewport() {
        let myViewport: number[][];
        myViewport = [];

        // Initalize to Identity
        for (let i = 0; i < 4; i++) {
            myViewport[i] = [];
            for (let j = 0; j < 4; j++) {
                if (i == j) {
                    myViewport[i][j] = 1;
                } else {
                    myViewport[i][j] = 0;
                }
            }
        }

        myViewport[0][0] = this.canv.width / 2;
        myViewport[1][1] = this.canv.height / 2;
        myViewport[0][3] = (this.canv.width - 1) / 2;
        myViewport[1][3] = (this.canv.height - 1) / 2;

        return myViewport;
    }

    // This will clear the CTM matrix
    initMatrix() {
        this.ctm = [];

        for (let i = 0; i < 4; i++) {
            this.ctm[i] = [];
            for (let j = 0; j < 4; j++) {
                if (i == j) {
                    this.ctm[i][j] = 1;
                } else {
                    this.ctm[i][j] = 0;
                }
            }
        }
    }

    // mutiply the current matrix by the translation
    translate(x: number, y: number, z: number) {
        let old_ctm = this.ctm;
        this.initMatrix();
        let t = this.ctm;

        t[0][3] += x;
        t[1][3] += y;
        t[2][3] += z;

        this.ctm = this.matrixMult(old_ctm, t, "ctm: translate");
    }

    // mutiply the current matrix by the scale
    scale(x: number, y: number, z: number) {
        let old_ctm = this.ctm;
        this.initMatrix();
        let t = this.ctm;

        t[0][0] *= x;
        t[1][1] *= y;
        t[2][2] *= z;

        this.ctm = this.matrixMult(old_ctm, t, "ctm: scale");
    }

    // mutiply the current matrix by the rotation
    rotateX(angle: number) {
        let old_ctm = this.ctm;
        this.initMatrix();
        let t = this.ctm;
        angle = angle * ((Math.PI)/180);


        t[1][1] *= Math.cos(angle);
        t[1][2] += -Math.sin(angle);
        t[2][1] += Math.sin(angle);
        t[2][2] *= Math.cos(angle);

        this.ctm = this.matrixMult(old_ctm, t, "ctm: rotateX");
    }

    // mutiply the current matrix by the rotation
    rotateY(angle: number) {
        let old_ctm = this.ctm;
        this.initMatrix();
        let t = this.ctm;
        angle = angle * ((Math.PI)/180);

        t[0][0] *= Math.cos(angle);
        t[0][2] += Math.sin(angle);
        t[2][0] += -(Math.sin(angle));
        t[2][2] *= Math.cos(angle);

        this.ctm = this.matrixMult(old_ctm, t, "ctm: rotateY");
    }

    // mutiply the current matrix by the rotation
    rotateZ(angle: number) {
        let old_ctm = this.ctm;
        this.initMatrix();
        let t = this.ctm;
        angle = angle * ((Math.PI)/180);

        t[0][0] *= Math.cos(angle);
        t[0][1] += -(Math.sin(angle));
        t[1][0] += Math.sin(angle);
        t[1][1] *= Math.cos(angle);

        this.ctm = this.matrixMult(old_ctm, t, "ctm: rotateZ");
    }

    printMatrix() {
        // use `console.log("something")` to print something to the browser console.
        for (let i = 0; i < this.ctm.length; i++) {
            let currString = "";
            for (let j = 0; j < this.ctm[i].length; j++) {
                if (j == this.ctm[i].length - 1) {
                    currString = currString + this.ctm[i][j]
                } else {
                    currString = currString + this.ctm[i][j] + ", "
                }
            }
            console.log(currString);
        }
        // end with a blank line!
        console.log("")
    }

    // Method to multiply matricies, dimensions don't matter
    matrixMult(matrix1: number[][], matrix2: number[][], key: string) {
        let returnMatrix: number[][] = [];

        // console.log("Multiplying: " + key);
        // console.log(matrix1);
        // console.log(matrix2);

        for (let i = 0; i < matrix1.length; i++) {
            returnMatrix[i] = [];
            for (let j = 0; j < matrix2[0].length; j++) {
                returnMatrix[i][j] = 0;
                for (let k = 0; k < matrix1[0].length; k++) {
                    returnMatrix[i][j] += matrix1[i][k] * matrix2[k][j];
                }
            }
        }

        // console.log("Result of Mult:");
        // console.log(returnMatrix);

        return returnMatrix;
    }
}

// a global variable for our state
var myDrawing: MyDrawing

// main function, to keep things together and keep the variables created self contained
function exec() {
    // find our container
    var div = document.getElementById("drawing");

    if (!div) {
        console.warn("Your HTML page needs a DIV with id='drawing'")
        return;
    }

    // create a Drawing object
    myDrawing = new MyDrawing(div);
    myDrawing.render()
}

exec()
