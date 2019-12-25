import * as THREE from "../../jsm/three/three.module.js";
import { GLTFLoader } from "../../jsm/three/GLTFLoader.js";

import model_config from "../model_config.js";

var scene;
var camera;
var orbit_control;
var start_y;
var isActive = false;
var active_name ="";
//var slider;

function send_custom_event(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}

function init(l_scene,l_camera,l_orbit_control){
    scene = l_scene;
    camera = l_camera;
    orbit_control = l_orbit_control;
	var loader = new GLTFLoader();
    loader.load(model_config.configurator.file,
        gltf => {
            let slider = gltf.scene.getObjectByName(model_config.configurator.name);
            slider.visible = false;
            scene.add(slider);
        }
    );
    console.log("three_control> init()");
	window.addEventListener('mousemove', onMouseMove, false );
    window.addEventListener('mouseup', onMouseUp, false );
        
}

function log_pos(obj){
    return `(${obj.position.x.toFixed(2)},${obj.position.y.toFixed(2)},${obj.position.z.toFixed(2)})`;
}

function run(name,e){
    console.log(`running config on ${name}`);
    start_y = e.detail.event.clientY;
    const target = scene.getObjectByName(name);
    const slider = scene.getObjectByName(model_config.configurator.name);

    let place = new THREE.Vector3(0,0,0);
    place.addScaledVector(camera.position,0.3);
    place.addScaledVector(target.position,0.7);
    slider.position.set(place.x,place.y,place.z);
    slider.visible = true;
    orbit_control.saveState();
    orbit_control.enabled = false;
    isActive = true;
    active_name = name;
}

function onMouseMove(e){
    if(isActive){
        //console.log(`diff = ${e.clientY - start_y}`);
        const shift_screen = e.clientY - start_y;
        const slider = scene.getObjectByName(model_config.configurator.name);
        slider.position.y = slider.position.y - shift_screen/100.0;
        if(slider.position.y < -1){
            slider.position.y = -1;
        }
        if(slider.position.y > 1){
            slider.position.y = 1;
        }
        send_custom_event("mesh_config",{name:active_name,config:model_config.configurator.name,val:slider.position.y});
        start_y = e.clientY;
    }
}

function onMouseUp(e){
    if(isActive){
        const slider = scene.getObjectByName(model_config.configurator.name);
        slider.visible = false;
        orbit_control.enabled = true;
        orbit_control.reset();
        isActive = false;
    }
}

export{init,run};
