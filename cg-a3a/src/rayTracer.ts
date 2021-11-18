// classes you may find useful.  Feel free to change them if you don't like the way
// they are set up.
interface Ray {
    start: Vector;
    dir: Vector;
}

interface Point {
    x: number;
    y: number;
    z: number;
}

export class Vector {
    constructor(public x: number,
                public y: number,
                public z: number) {
    }
    static times(k: number, v: Vector) { return new Vector(k * v.x, k * v.y, k * v.z); }
    static minus(v1: Vector, v2: Vector) { return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z); }
    static plus(v1: Vector, v2: Vector) { return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z); }
    static dot(v1: Vector, v2: Vector) { return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z; }
    static mag(v: Vector) { return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z); }
    static norm(v: Vector) {
        var mag = Vector.mag(v);
        var div = (mag === 0) ? Infinity : 1.0 / mag;
        return Vector.times(div, v);
    }
    static cross(v1: Vector, v2: Vector) {
        return new Vector(v1.y * v2.z - v1.z * v2.y,
                          v1.z * v2.x - v1.x * v2.z,
                          v1.x * v2.y - v1.y * v2.x);
    }
}

export class Color {
    constructor(public r: number,
                public g: number,
                public b: number) {
    }
    static scale(k: number, v: Color) { return new Color(k * v.r, k * v.g, k * v.b); }
    static plus(v1: Color, v2: Color) { return new Color(v1.r + v2.r, v1.g + v2.g, v1.b + v2.b); }
    static times(v1: Color, v2: Color) { return new Color(v1.r * v2.r, v1.g * v2.g, v1.b * v2.b); }
    static white = new Color(1.0, 1.0, 1.0);
    static grey = new Color(0.5, 0.5, 0.5);
    static black = new Color(0.0, 0.0, 0.0);
    static toDrawingColor(c: Color) {
        var legalize = (d: number) => d > 1 ? 1 : d;
        return {
            r: Math.floor(legalize(c.r) * 255),
            g: Math.floor(legalize(c.g) * 255),
            b: Math.floor(legalize(c.b) * 255)
        }
    }
}

export class Sphere {
    constructor(public x: number, public y: number, public z: number, public radius: number, 
        public dr: number, public dg: number, public db: number, 
        public k_ambient: number, public k_specular: number, public specular_pow: number) {
    }

    static hitSphere(sphere: Sphere, ray: Ray) {
        let originCenter = Vector.minus(ray.start, new Vector(sphere.x, sphere.y, sphere.z));
        let a = Vector.dot(ray.dir, ray.dir);
        let b = 2.0 * Vector.dot(originCenter, ray.dir);
        let c = Vector.dot(originCenter, originCenter) - (sphere.radius * sphere.radius);
        let discriminant = (b * b) - (4 * a * c);
        // return (discriminant > 0)
        if(discriminant < 0){
            return -1.0;
        }
        else{
            return (-b - Math.sqrt(discriminant)) / (2.0*a); // == t
        }
    }
}

export class Light {
    constructor(public r: number, public g: number, 
                public b: number, public x: number, 
                public y: number, public z: number) {}
}

export class Eye {
    u: Vector;
    v: Vector;
    w: Vector;
    origin: Vector;

    constructor(public position: Vector, public dir: Vector, public up: Vector) {
        let gaze = Vector.minus(dir, position)
        this.w = Vector.times(1/Vector.mag(gaze), Vector.times(-1, gaze))
        this.u = Vector.times(1/Vector.mag(Vector.cross(up, this.w)), Vector.cross(up, this.w))
        this.v = Vector.cross(this.w, this.u)
        this.origin = position;
    }
}


// A class for our application state and functionality
class RayTracer {
    // the constructor paramater "canv" is automatically created 
    // as a property because the parameter is marked "public" in the 
    // constructor parameter
    // canv: HTMLCanvasElement
    //
    // rendering context for the canvas, also public
    // ctx: CanvasRenderingContext2D

    // initial color we'll use for the canvas
    canvasColor = "lightyellow"

    canv: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    spheres: Sphere[]
    lights: Light[]
    ambientLight: Light
    fov: number
    eye: Eye = new Eye(new Vector(0, 0, 0), new Vector(0, 0, 0), new Vector(0, 0, 0))
    background: Color

    // div is the HTMLElement we'll add our canvas to
    // width, height are the size of the canvas
    // screenWidth, screenHeight are the number of pixels you want to ray trace
    //  (recommend that width and height are multiples of screenWidth and screenHeight)
    constructor (div: HTMLElement,
        public width: number, public height: number, 
        public screenWidth: number, public screenHeight: number) {

        // let's create a canvas and to draw in
        this.spheres = [];
        this.lights = [];
        this.ambientLight = new Light(0, 0, 0, 0, 0, 0);
        this.fov = 0;
        this.set_fov(90);
        this.set_eye(0,0,0, 0,0,-1, 0,1,0);
        this.background = new Color(0, 0, 0);
        
        this.canv = document.createElement("canvas");
        this.ctx = this.canv.getContext("2d")!;
        if (!this.ctx) {
            console.warn("our drawing element does not have a 2d drawing context")
            return
        }
 
        div.appendChild(this.canv);

        this.canv.id = "main";
        this.canv.style.width = this.width.toString() + "px";
        this.canv.style.height = this.height.toString() + "px";
        this.canv.width  = this.width;
        this.canv.height = this.height;
    }

    // API Functions you should implement

    // clear out all scene contents
    reset_scene() {
        // TODO reset background, datastructures, ambient light
        this.spheres = [];
        this.lights = [];
        this.background = new Color(0, 0, 0);
        this.ambientLight = new Light(0, 0, 0, 0, 0, 0);
    }

    // create a new point light source
    new_light (r: number, g: number, b: number, x: number, y: number, z: number) {
        var l = new Light(r, g, b, x, y, z);
        this.lights.push(l);
    }

    // set value of ambient light source
    ambient_light (r: number, g: number, b: number) {
        this.ambientLight.r = r;
        this.ambientLight.g = g;
        this.ambientLight.b = b;
    }

    // set the background color for the scene
    set_background (r: number, g: number, b: number) {
        this.background.r = r;
        this.background.g = g;
        this.background.b = b;
    }

    // set the field of view
    DEG2RAD = (Math.PI/180)
    set_fov (theta: number) {
        // TODO what the heck is happening with ASPECT RATIO
        this.fov = theta * this.DEG2RAD;
    }

    // set the virtual camera's position and orientation
    // x1,y1,z1 are the camera position
    // x2,y2,z2 are the lookat position
    // x3,y3,z3 are the up vector
    set_eye(x1: number, y1: number, z1: number, 
            x2: number, y2: number, z2: number, 
            x3: number, y3: number, z3: number) {

        let position = new Vector(x1, y1, z1)
        let dir = new Vector(x2, y2, z2)
        let up = new Vector(x3, y3, z3)

        this.eye = new Eye(position, dir, up)
    }

    // create a new sphere
    new_sphere (x: number, y: number, z: number, radius: number, 
                dr: number, dg: number, db: number, 
                k_ambient: number, k_specular: number, specular_pow: number) {
        var s = new Sphere(x, y, z, radius, dr, dg, db, k_ambient, k_specular, specular_pow)
        this.spheres.push(s)
        console.log("Spheres: " + this.spheres)
        console.log("k_ambient: " + s.k_ambient)
    }

    // INTERNAL METHODS YOU MUST IMPLEMENT

    // create an eye ray based on the current pixel's position
    private eyeRay(i: number, j: number): Ray {
        var Us = -1 + (2* (i + 0.5)) / this.screenWidth
        var Vs = -1 + (2* (j + 0.5)) / this.screenHeight
        let d = -1 / Math.tan(this.fov/2)

        var rayVector = Vector.plus(Vector.plus(Vector.times(d,this.eye.w), Vector.times(Us, this.eye.u)) , Vector.times(-Vs,this.eye.v))
        var startVector = this.eye.origin
        var directionVector = new Vector(rayVector.x, rayVector.y, rayVector.z)

        var ray: Ray = {
            start: startVector,
            dir: directionVector
        }

        return ray;
    }

    private traceRay(ray: Ray, depth: number = 0): Color {
        
        var t; // t
        var tStore;
        var s; // sphere
        var p; // point
        // Sphere -> Point on Sphere
        for (var sphere of this.spheres) {
            // if (Sphere.hitSphere(sphere, ray)) { return Sphere }
            t = Sphere.hitSphere(sphere, ray)
            if (t != -1) {
                if (tStore) {
                    if (t < tStore) {
                        s = sphere
                        p = Vector.plus(ray.start, Vector.times(t, ray.dir))
                        tStore = t;
                    }
                } else {
                    s = sphere
                    p = Vector.plus(ray.start, Vector.times(t, ray.dir))
                    tStore = t;
                }
            }

        }

        if (s && p) {
            return this.getColor(s, p);
        } else {
            return this.background;
        }
    }

    // draw_scene is provided to create the image from the ray traced colors. 
    // 1. it renders 1 line at a time, and uses requestAnimationFrame(render) to schedule 
    //    the next line.  This causes the lines to be displayed as they are rendered.
    // 2. it uses the additional constructor parameters to allow it to render a  
    //    smaller # of pixels than the size of the canvas
    draw_scene() {

        // rather than doing a for loop for y, we're going to draw each line in
        // an animationRequestFrame callback, so we see them update 1 by 1
        var pixelWidth = this.width / this.screenWidth;
        var pixelHeight = this.height / this.screenHeight;
        var y = 0;
        
        this.clear_screen();

        var renderRow = () => {
            for (var x = 0; x < this.screenWidth; x++) {

                var ray = this.eyeRay(x, y);
                var c = this.traceRay(ray);

                var color = Color.toDrawingColor(c)
                this.ctx.fillStyle = "rgb(" + String(color.r) + ", " + String(color.g) + ", " + String(color.b) + ")";
                this.ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth+1, pixelHeight+1);
            }
            
            // finished the row, so increment row # and see if we are done
            y++;
            if (y < this.screenHeight) {
                // finished a line, do another
                requestAnimationFrame(renderRow);            
            } else {
                console.log("Finished rendering scene")
            }
        }

        renderRow();
    }

    clear_screen() {
        this.ctx.fillStyle = this.canvasColor;
        this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
    }

    getColor(s: Sphere, p: Vector) {
        // Color = Diffuse + Specular + ... reflection in 3b
        let viewer = Vector.minus(this.eye.origin, p)
        viewer = Vector.norm(viewer)
        let color_r = 0
        let color_g = 0
        let color_b = 0
        let specular = 0

        let normal = (Vector.minus(p, new Vector(s.x, s.y, s.z)));
        normal = Vector.norm(normal)
        for (var l of this.lights) {
            // DIFFUSE
            let lightVector = Vector.minus(new Vector(l.x, l.y, l.z), p);
            lightVector = Vector.norm(lightVector)
            let diffCosine = Vector.dot(normal, lightVector)
            if (diffCosine < 0.0) {
               diffCosine = 0.0
            }

            // SPECULAR
            let reflection = Vector.times(2 * Vector.dot(lightVector, normal), normal)
            reflection = Vector.minus(reflection, lightVector)
            if (Vector.dot(reflection, lightVector) > 0) {
                specular = Vector.dot(reflection, viewer)
                specular = Math.pow(specular, s.specular_pow)
            }

            // console.log("k_specular: " + (s.k_specular))
            // console.log("specular: " + (specular))
            // console.log("s.dr,g,b: " + s.dr + "," + s.dg + "," + s.db)
            // console.log("l.r,g,b: " + l.r + "," + l.g + "," + l.b)
            if (specular != 0 && s.k_specular != 0) {
                console.log("total specular component:" + (s.dr * s.k_specular * specular * l.r))
            }

            // color += diffuse + ambient + specular
            color_r += (s.dr * diffCosine * l.r) + (s.dr * s.k_ambient * this.ambientLight.r) + (s.k_specular * specular * l.r)
            color_g += (s.dg * diffCosine * l.g) + (s.dg * s.k_ambient * this.ambientLight.g) + (s.k_specular * specular * l.g)
            color_b += (s.db * diffCosine * l.b) + (s.db * s.k_ambient * this.ambientLight.b) + (s.k_specular * specular * l.b)
        }

        // ADDITION OF THE TWO;
        return new Color(color_r, color_g, color_b)
    }
}
export {RayTracer}