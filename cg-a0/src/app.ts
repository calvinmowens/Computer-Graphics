/*
author: Calvin Owens
due date: Sept 1, 2021
collaborated with Selena Do on this assignment
*/

import { MousePosition } from './pointset';
// library source and docs at https://github.com/Qix-/color
import  Color  from 'color'

// a simple implementation of a circular buffer for holding
// a fixed size set of points in PointSet
import * as ps from './pointset';

// simple convenience
function randomColor() {
    return Color({
        r: Math.random() * 255,
        g: Math.random() * 255,
        b: Math.random() * 255
    })
}

// yes, it's one line, but it's one less thing for you to figure out
function darken(color: Color) {
    return color.darken(0.25)   // creates a new color
}

// an interface that describes what our Rectangle object might look like.
// Remember, a Typescript interface is just a description of the required
// properties (and methods, although we don't use methods here) an object
// must implement.  It is not a class or an object itself.
interface Rectangle {
    p1: ps.MousePosition;
    p2: ps.MousePosition;
    width: number;
    height: number;
    color: Color;
    triangles: Array <Triangle>;
}

interface Triangle {
    p1: Point;
    p2: Point;
    p3: Point;
    color: Color;
}

interface Point {
    x: number;
    y: number;
}

// A class for our application state and functionality
class Drawing {
    // the constructor paramater "canv" is automatically created
    // as a property because the parameter is marked "public" in the
    // constructor parameter
    //    canv: HTMLCanvasElement
    //
    // rendering context for the canvas, also public
    //    ctx: CanvasRenderingContext2D

    // some suggested properties you might use in your implementation
    mousePosition: ps.MousePosition | null = null;
    clickStart: ps.MousePosition | null = null;
    clickEnd: ps.MousePosition | null = null;
    rects: Array <Rectangle>;   // an array that only contains objects that
                                // satisfy the Rectangle interface
    points: ps.PointSet;

    // a simple wrapper to reliably get the offset within an DOM element
    // We need this because the mouse position in the mouse event is
    // relative to the Window, but we want to specify draw coordinates
    // relative to the canvas DOM element
    // see: http://www.jacklmoore.com/notes/mouse-position/
    static offset(e: MouseEvent): ps.MousePosition {
        e = e || <MouseEvent> window.event;

        var target = <Element> (e.target || e.srcElement),
            rect = target.getBoundingClientRect(),
            offsetX = e.clientX - rect.left,
            offsetY = e.clientY - rect.top;

        return {x: offsetX, y: offsetY};
    }

    // Web pages are reactive; Javascript is single threaded, and all
    // javascript code in your page is executed in response to
    // some action.   Actions include
    // - by the user (various callbacks like mouse and keyboard callback)
    // - by timers (we can use a timeout function to execute something in
    //   the future)
    // - things like network actions (e.g., fetch this resource, call this
    //   code when it's been retrieved)
    // - a callback synchronized with the next display refresh rate
    //   that was created for doing animation
    //
    // We use the this last one, triggered by a call to
    //      requestAnimationFrame(() => this.render());
    // to do continuous rendering.  The requestAnimationFrame has one
    // parameter, a function.  The "() => this.render()" syntax is a
    // shorthand for writing inline functions.  It says "this is a function
    // with no parameters" ("() =>") whose body is one line of code, the
    // "this.render()" call.  It could also be
    //              requestAnimationFrame(() => {
    //                   this.render()
    //                });
    // where the function body is betwee {} and we could write more methods.

    render() {
        // Store the current drawing transformation matrix (and other state)
        this.ctx.save();

        // Use the identity matrix while clearing the canvas (just in case you change it someday!)
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = "lightgrey";
        this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);

        // Restore the transform
        this.ctx.restore();

        // * DOT TRAIL (ADD & REMOVE POINTS)
        // this loop controls the dot trail and the adding and dropping of points
        if (this.mousePosition) {
            this.points.addPoint(this.mousePosition);
        } else {
            if (this.points.length > 0) {
                this.points.dropPoint();
            }
        }

        // * DRAW RECT + CROSS LINES + TRIANGLES
        for (let i = 0; i < this.rects.length; i++) {
            let myRect = this.rects[i];
            this.ctx.lineWidth = 2;
            // DRAW RECT
            this.ctx.strokeRect(myRect.p1.x, myRect.p1.y, (myRect.p2.x - myRect.p1.x), (myRect.p2.y - myRect.p1.y));

            // DRAW CROSS LINES
            // LINE 1
            this.ctx.moveTo(myRect.p1.x, myRect.p1.y);
            this.ctx.lineTo(myRect.p2.x, myRect.p2.y);

            // LINE 2
            this.ctx.moveTo(myRect.p2.x, myRect.p1.y);
            this.ctx.lineTo(myRect.p1.x, myRect.p2.y);
            this.ctx.stroke();

            // DRAW TRIANGLES
            for (let j = 0; j < myRect.triangles.length; j++) {
                let myTriangle = myRect.triangles[j];
                this.ctx.beginPath();
                this.ctx.moveTo(myTriangle.p1.x, myTriangle.p1.y);
                this.ctx.lineTo(myTriangle.p2.x, myTriangle.p2.y);
                this.ctx.lineTo(myTriangle.p3.x, myTriangle.p3.y);
                this.ctx.closePath();
                this.ctx.stroke();
                this.ctx.fillStyle = myTriangle.color.rgb().string();
                this.ctx.fill();
            }
        }

        // * DRAWS DOT TRAIL
        let b = true;
        for (let i = 0; i < this.points.length; i++) {
            let a = i / 29;
            this.ctx.fillStyle = "rgba(0, 0, 255, " + a + ")";
            this.ctx.fillRect(this.points.getPoint(i).x, this.points.getPoint(i).y, 3, 3);
        }

        // * DRAWS RUBBERBAND
        if (this.clickStart) {
            // TODO draw the grey rectangle with p1 = clickstart // p2 = currentMousePos
            const start = this.clickStart;
            const m = this.mousePosition;
            if (m && !this.clickEnd) {
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(start.x, start.y, m.x - start.x, m.y - start.y);
            }
        }

        // do it again!  and again!  AND AGAIN!  AND ...
        requestAnimationFrame(() => this.render());
    }

    constructor (public canv: HTMLCanvasElement, public ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.rects = new Array(0)  // 0 sized array
        this.points = new ps.PointSet()


        // All interaction in browsers is done via event handlers.  Setting
        // "onmousedown", "onmouseup", "onmousemove", and "onmouseout" on
        // the Canvas DOM element to a function will cause that function to
        // be called when the appropriate action happens.

        canv.onmousedown = (ev: MouseEvent) => {
            // this method is called when a mouse button is pressed.
            var mousePosition = Drawing.offset(ev)
            this.clickStart = mousePosition
            this.clickEnd = null
            this.mousePosition = mousePosition
        }

        canv.onmouseup = (ev: MouseEvent) => {
            // this method is called when a mouse button is released.
            const clickEnd = Drawing.offset(ev)
            this.clickEnd = clickEnd
            this.newRectangle()
        }

        canv.onmousemove = (ev: MouseEvent) => {
            // this method is called when the mouse moves.
            const mouse = Drawing.offset(ev)
            this.mousePosition = mouse
        }

        canv.onmouseout = (ev: MouseEvent) => {
            // this method is called when the mouse goes out of
            // the window.
            this.mousePosition = null;
            this.clickStart = null;
        }
    }

    newRectangle() {
        if (this.clickStart != null && this.clickEnd != null) {
            let myRectangle: Rectangle = {
                p1: this.clickStart,
                p2: this.clickEnd,
                width: this.clickEnd.x - this.clickStart.x,
                height: this.clickEnd.y - this.clickStart.y,
                color: randomColor(),
                triangles: new Array(0)
            }

            // DETERMINE SHORTER SIDE
            let smallestSide = myRectangle.width < myRectangle.height ? myRectangle.width : myRectangle.height;
            smallestSide = Math.abs(smallestSide);

            this.newTriangle(myRectangle.p1.x,myRectangle.p1.y, smallestSide, myRectangle.width, myRectangle.height, 1, myRectangle, myRectangle.color);
            this.newTriangle(myRectangle.p2.x, myRectangle.p1.y, smallestSide, myRectangle.width, myRectangle.height, 2, myRectangle, myRectangle.color);
            this.newTriangle(myRectangle.p2.x, myRectangle.p2.y, smallestSide, myRectangle.width, myRectangle.height, 3, myRectangle, myRectangle.color);
            this.newTriangle(myRectangle.p1.x, myRectangle.p2.y, smallestSide, myRectangle.width, myRectangle.height, 4, myRectangle, myRectangle.color);

            this.rects.push(myRectangle);
        }
    }

    newTriangle(x: number, y: number, side: number, width: number, height: number, quad: number, rectangle: Rectangle, color: Color) {
        let points = this.calcCords(x, y, side, width, height, quad);

        let p1 = points.p1;
        let p2 = points.p2;
        let p3 = points.p3;

        // * CREATE TRIANGLE OBJECT + ADD TO ARRAY
        let myTriangle: Triangle = {
            p1: p1,
            p2: p2,
            p3: p3,
            color: color
        }

        rectangle.triangles.push(myTriangle);

        side = side / 2;
        width = width / 2;
        height = height / 2;

        if (side > 64) {
            // TODO insert helper
            this.newTriangle(x, y, side, width, height, quad, rectangle, darken(color));
            this.newTriangle(p1.x, p1.y, side, width, height, quad, rectangle, darken(color));
            this.newTriangle(p3.x, p3.y, side, width, height, quad, rectangle, darken(color));
        }
    }

    calcCords(x: number, y: number, side: number, width: number, height: number,  quad: number) {
        let x1, y1, x2, y2, x3, y3;
        x1 = x2 = y1 = y2 = x3 = y3 = 0;

        switch (quad) {
            case 1:
                x1 = x + (width / 4)
                y1 = y + (height / 4)
                x2 = x1 + (width / 2)
                y2 = y1
                x3 = x1 + (width / 4)
                y3 = y
                break;
            case 2:
                x1 = x - (width / 4);
                y1 = y + (height / 4);
                x2 = x1;
                y2 = y1 + (height / 2);
                x3 = x;
                y3 = y1 + (height / 4);
                break;
            case 3:
                x1 = x - (width / 4);
                y1 = y - (height / 4);
                x2 = x1 - (width / 2);
                y2 = y1;
                x3 = x1 - (width / 4);
                y3 = y;
                break;
            case 4:
                x1 = x + (width / 4);
                y1 = y - (height / 4);
                x2 = x1;
                y2 = y1 - (height / 2);
                x3 = x;
                y3 = y1 - (height / 4);
                break;
        }

        let p1: Point = {
            x: x1,
            y: y1
        }
        let p2: Point = {
            x: x2,
            y: y2
        }
        let p3: Point = {
            x: x3,
            y: y3
        }

        return { p1, p2, p3 };
    }
}

// a global variable for our state.  We implement the drawing as a class, and
// will have one instance
var myDrawing: Drawing;

// main function that we call below.
// This is done to keep things together and keep the variables created self contained.
// It is a common pattern on the web, since otherwise the variables below woudl be in
// the global name space.  Not a huge deal here, of course.

function exec() {
    // find our container
    var div = document.getElementById("drawing");

    if (!div) {
        console.warn("Your HTML page needs a DIV with id='drawing'")
        return;
    }

    // let's create a canvas and to draw in
    var canv = document.createElement("canvas");
    let ctx = canv.getContext("2d");
    if (!ctx) {
        console.warn("our drawing element does not have a 2d drawing context")
        return
    }

    div.appendChild(canv);

    canv.id = "main";
    canv.style.width = "100%";
    canv.style.height = "100%";
    canv.width  = canv.offsetWidth;
    canv.height = canv.offsetHeight;

    window.addEventListener('resize', (event) => {
        canv.width  = canv.offsetWidth;
        canv.height = canv.offsetHeight;
    });


    // create a Drawing object
    myDrawing = new Drawing(canv, ctx);

    // kick off the rendering!
    myDrawing.render();
}

exec()
