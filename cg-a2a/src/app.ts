// abstract library
import { DrawingCommon } from './common';
import * as THREE from 'three';
import { MeshToonMaterial, RGBA_ASTC_6x5_Format, TextureLoader } from 'three';

// A class for our application state and functionality
class Drawing extends DrawingCommon {


    constructor (canv: HTMLElement) {
        super (canv)
    }

    /*
	Set up the scene during class construction
	*/
	initializeScene(){

        const textureLoader = new TextureLoader();

        // main group
        const objectRoot = new THREE.Group();

        // sub-groups
        const portafilter = new THREE.Group();
        const machine = new THREE.Group();
        const accessories = new THREE.Group();
        const mug = new THREE.Group();

        // geometry
        var topG: THREE.BufferGeometry = new THREE.BoxGeometry(10, 2.50, 10);
        var groupG: THREE.BufferGeometry = new THREE.BoxGeometry(10, 2.50, 3.5);
        var tsideG: THREE.BufferGeometry = new THREE.BoxGeometry(0.5, 3, 10);
        var sideG: THREE.BufferGeometry = new THREE.PlaneGeometry(10, 8);
        var baseG: THREE.BufferGeometry = new THREE.BoxGeometry(10, 2.5, 10);
        var dripTrayG: THREE.BufferGeometry = new THREE.BoxGeometry(10, 2, 4);
        var dripTrayTopG: THREE.BufferGeometry = new THREE.BoxGeometry(10, .5, 4);
        var groupHeadG: THREE.BufferGeometry = new THREE.CylinderGeometry(1.25, 1.25, .75, 50);
        var topMetalG: THREE.BufferGeometry = new THREE.PlaneGeometry(10, 10);

        const laMarG = new THREE.FontLoader();
        laMarG.load('../resources/threejs/fonts/helvetiker_regular.typeface.json', (font) => {
        const text = 'La Marzocco';
        const textG = new THREE.TextGeometry(text, {
            font: font,
            size: 3,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false,
        });
        });

        var knobG: THREE.BufferGeometry = new THREE.CylinderGeometry(.5, .5, 1, 50);
        var bodyG: THREE.BufferGeometry = new THREE.BoxGeometry(9, 5.5, 9);
        var switchTrackG: THREE.BufferGeometry = new THREE.CylinderGeometry(2, 2, 1, 50);
        var switchG: THREE.BufferGeometry = new THREE.BoxGeometry(.25, 1, 1);
        var footPoleG: THREE.BufferGeometry = new THREE.CylinderGeometry();
        var footG: THREE.BufferGeometry = new THREE.CylinderGeometry();
        var steamWandG: THREE.BufferGeometry = new THREE.CylinderGeometry(0.20, 0.20, 4, 50);
        var hotWater1G: THREE.BufferGeometry = new THREE.CylinderBufferGeometry(0.25, 0.25, 1, 50);
        var hotWater2G: THREE.BufferGeometry = new THREE.ConeGeometry(0.5, 1, 50);
        var gauge1G: THREE.BufferGeometry = new THREE.CylinderGeometry(1, 1, 1, 50);
        var gauge2G: THREE.BufferGeometry = new THREE.CylinderGeometry(1.1, 1.1, 1, 50);

        var basketG: THREE.BufferGeometry = new THREE.CylinderGeometry(1, 1, .75, 50);
        var connectorG: THREE.BufferGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1.5, 50);
        var handle1G: THREE.BufferGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1, 50);
        var handle2G: THREE.BufferGeometry = new THREE.CylinderGeometry(0.5, 0.3, 2.25, 50);


        const points = [];
        for (let i = 0; i < 10; ++i) {
        points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * .8));
        }
        var mugG = new THREE.LatheGeometry(points);


        // materials
        const woodTexture = textureLoader.load('assets/wood.png');

        var body = new THREE.MeshStandardMaterial();
        body.color = new THREE.Color(0xAEB3A4);
        body.roughness = 0.5;

        var bodyBlack = new THREE.MeshStandardMaterial();
        bodyBlack.color = new THREE.Color(0x1F1F1F);
        bodyBlack.roughness = 0.5;

        var bodyWhite = new THREE.MeshStandardMaterial();
        bodyWhite.color = new THREE.Color(0xFFFFFF);
        bodyWhite.roughness = 0.5;

        var metal = new THREE.MeshStandardMaterial();
        metal.metalness = 0.8;
        metal.roughness = 0.2;
        metal.color = new THREE.Color(0x7A7A7A);

        var wood = new THREE.MeshStandardMaterial();
        wood.normalMap = woodTexture;
        wood.color = new THREE.Color(0xE8C3A8);
        wood.roughness = .8;
        // TODO create stainless material
        // TODO create wood material
        // TODO create white ceramic material

        var text = new THREE.MeshStandardMaterial();
        text.color = new THREE.Color(0xC94343);
        text.roughness = 1;

        // mesh objects
        var top = new THREE.Mesh(topG, body);
        var group = new THREE.Mesh(groupG, body);
        var tside1 = new THREE.Mesh(tsideG, body);
        var tside2 = new THREE.Mesh(tsideG, body);
        var tside3 = new THREE.Mesh(tsideG, body);
        var side1 = new THREE.Mesh(sideG, body);
        var bodyM = new THREE.Mesh(bodyG, body);
        var base = new THREE.Mesh(baseG, bodyBlack);
        var dripTray = new THREE.Mesh(dripTrayG, body);
        var dripTrayTop = new THREE.Mesh(dripTrayTopG, metal);
        var groupHead = new THREE.Mesh(groupHeadG, metal);
        var topMetal = new THREE.Mesh(topMetalG, metal);

        var knob1 = new THREE.Mesh(knobG, wood); // TODO add wood here
        var knob2 = new THREE.Mesh(knobG, wood); // TODO add wood here
        var switchTrack = new THREE.Mesh(switchTrackG, wood);
        var switchM = new THREE.Mesh(switchG, metal);
        var steamWand = new THREE.Mesh(steamWandG, metal);
        var hotWater1 = new THREE.Mesh(hotWater1G, metal);
        var hotWater2 = new THREE.Mesh(hotWater2G, metal);
        var gauge1_1 = new THREE.Mesh(gauge1G, bodyWhite);
        var gauge1_2 = new THREE.Mesh(gauge2G, metal);
        var gauge2_1 = new THREE.Mesh(gauge1G, bodyWhite);
        var gauge2_2 = new THREE.Mesh(gauge2G, metal);


        var basket = new THREE.Mesh(basketG, metal);
        var connector = new THREE.Mesh(connectorG, metal);
        var handle1 = new THREE.Mesh(handle1G, wood);
        var handle2 = new THREE.Mesh(handle2G, wood);


        tside2.rotateY(Math.PI / 2);

        top.position.set(0,0,0);
        group.position.set(0, 0, -6.5);
        tside1.position.set(5, 0.25, 0);
        tside2.position.set(0, 0.25, 5);
        tside3.position.set(-5, 0.25, 0);
        bodyM.position.set(0, -3.5, 0);
        base.position.set(0, -7.5, 0);
        dripTray.position.set(0, -7.25, -6.75);
        dripTrayTop.position.set(0, -6.25, -6.75);
        groupHead.position.set(0, -1, -6.5);
        topMetal.position.set(0, 1.26, 0);
        topMetal.rotateX(-(Math.PI / 2));

        knob1.position.set(3.5, 0, 0);
        knob1.rotateX(Math.PI / 2);
        knob2.position.set(-3.5, 0, 0);
        knob2.rotateX(Math.PI / 2);
        switchTrack.position.set(0, 0, 1);
        switchM.position.set(1.25, .25, -0.5);
        switchM.rotateY((Math.sqrt(2) * Math.PI) / 2);
        hotWater1.position.set(3.5, -1.5, 2);
        hotWater2.position.set(3.5, -2, 2);
        steamWand.position.set(-3.5, -2, 1);
        steamWand.rotateX(0.2);
        steamWand.rotateY(0.2);
        steamWand.rotateZ(-0.2);
        gauge1_1.position.set(2.75, -3.5, 4.5);
        gauge1_1.rotateX(Math.PI / 2);
        gauge1_2.position.set(2.75, -3.5, 4.6);
        gauge1_2.rotateX(Math.PI / 2);
        gauge2_1.position.set(-2.75, -3.5, 4.5);
        gauge2_1.rotateX(Math.PI / 2);
        gauge2_2.position.set(-2.75, -3.5, 4.6);
        gauge2_2.rotateX(Math.PI / 2);

        basket.position.set(0, 0, 0);
        basket.rotateX(0.3);
        connector.position.set(0, -0.25, -1);
        connector.rotateX(Math.PI / 2 - 0.25);
        handle1.position.set(0, -0.5, -2);
        handle1.rotateX(Math.PI / 2 - 0.25);
        handle2.position.set(0, -.9, -3.55);
        handle2.rotateX(Math.PI / 2 - 0.25);




        // adding to scene
        machine.add(top, tside1, tside2, tside3, group, bodyM, base, dripTray, dripTrayTop, groupHead, topMetal);
        machine.position.set(0, 0, 0);
        accessories.add(knob1, knob2, switchTrack, switchM, hotWater1, hotWater2, steamWand, gauge1_1, gauge1_2, gauge2_1, gauge2_2);
        accessories.position.set(0, 0, -8.75);
        portafilter.add(basket, connector, handle1, handle2);
        portafilter.position.set(0, -1.5, -6.5);
        portafilter.rotateX(-0.3);
        objectRoot.add(machine, accessories, portafilter);

        // geometry = new THREE.TorusGeometry( 1, 0.2, 30, 40 );
        // material = new THREE.MeshStandardMaterial( { color: 0xffff00, metalness: 1.0, flatShading: true} );
        // mesh = new THREE.Mesh( geometry, material );

        // mesh.position.set(-1,0,0);
        // objectRoot.add( mesh );

        this.scene.add( objectRoot );
    }

	/*
	Update the scene during requestAnimationFrame callback before rendering
	*/
	updateScene(time: DOMHighResTimeStamp){}
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

    // create a Drawing object
    myDrawing = new Drawing(div);
}

exec()
