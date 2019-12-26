import * as THREE from "../../jsm/three/three.module.js";
import { GLTFLoader } from "../../jsm/three/GLTFLoader.js";

import * as mouse from "./three_mouse.js";
import model_config from "../model_config.js";

var scene;
var camera;
var orbit_control;
var isActive = false;
var active_name ="";
var active_init_y;//active slider initial position
var current_val;
var last_screen_y;
var group,path,slider;

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
            path = gltf.scene.getObjectByName("path");
            //path.visible = false;
            slider = gltf.scene.getObjectByName(model_config.configurator.name);
            //slider.visible = false;
            group = new THREE.Group();
            group.add(slider);
            group.add(path);
            group.visible = false;
            scene.add(group);
        }
    );
    console.log("three_control> init()");
	window.addEventListener('mousemove', onMouseMove, false );
	window.addEventListener('touchmove', onTouchMove, false );
    window.addEventListener('mouseup', onMouseUp, false );
    window.addEventListener('touchend', onMouseUp, false );
        
}

function log_pos(obj){
    return `(${obj.position.x.toFixed(2)},${obj.position.y.toFixed(2)},${obj.position.z.toFixed(2)})`;
}

function run(l_name,clientY,start_val=0.5){
    last_screen_y = clientY;
    const target = scene.getObjectByName(l_name);
    console.log(`running ${model_config.configurator.name} control at (${start_val.toFixed(2)}) on ${l_name} at y = ${target.position.y.toFixed(2)}`);
    let place = new THREE.Vector3(0,0,0);
    place.addScaledVector(camera.position,0.3);
    place.addScaledVector(target.position,0.7);
    //slider.position.set(place.x,place.y,place.z);
    group.position.set(place.x,place.y,place.z);
    active_init_y = place.y;
    group.visible = true;
    //path.visible = true;
    document.getElementById('viewer').style.cursor = "none";
    mouse.suspend();
    orbit_control.saveState();
    orbit_control.enabled = false;
    isActive = true;
    active_name = l_name;
    set_control_pos(start_val);//using active_init_y, active_name
}

function set_control_pos(target_val){
    current_val = target_val;
    if(current_val < 0){
        current_val = 0;
    }
    else if(current_val > 1){
        current_val = 1;
    }
    const space_range = 3;
    //slider.position.y = active_init_y - (space_range/2) + current_val*space_range;
    slider.position.y = -(space_range/2) + current_val*space_range;
    send_custom_event("mesh_control",{name:active_name,config:model_config.configurator.name,val:current_val});
}

function process_move(y){
    if(isActive){
        const shift_screen = y - last_screen_y;
        last_screen_y = y;
        const screen_sensitivity = 150.0;
        set_control_pos(current_val - shift_screen/screen_sensitivity);
    }
}

function onMouseMove(e){
    process_move(e.clientY);
}

function onTouchMove(e){
    process_move(e.targetTouches[0].clientY);
}

function onMouseUp(e){
    if(isActive){
        group.visible = false;
        document.getElementById('viewer').style.cursor = "default";
        mouse.resume();
        orbit_control.enabled = true;
        orbit_control.reset();
        isActive = false;
        const target = scene.getObjectByName(active_name);
        console.log(`releasing ${model_config.configurator.name} control at (${current_val.toFixed(2)}) from ${active_name} at y = ${target.position.y.toFixed(2)}`);
    }
}

export{init,run};
