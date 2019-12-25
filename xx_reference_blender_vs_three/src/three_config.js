import * as THREE from "../../jsm/three/three.module.js";
import { GLTFLoader } from "../../jsm/three/GLTFLoader.js";

import model_config from "../model_config.js";

var scene;
var camera;
//var slider;

function init(l_scene,l_camera){
    scene = l_scene;
    camera = l_camera;
	var loader = new GLTFLoader();
    loader.load(model_config.configurator,
        gltf => {
            let slider = gltf.scene.getObjectByName("slider");
            slider.visible = false;
            scene.add(slider);
        }
        );

}

function log_pos(obj){
    console.log(`${obj.name} set at (${obj.position.x},${obj.position.y},${obj.position.z})`);
}

function run(name){
    const target = scene.getObjectByName(name);
    const slider = scene.getObjectByName("slider");
    let place = new THREE.Vector3(0,0,0);
    log_pos(target);

    let cam_pos = new THREE.Vector3();
    cam_pos.setFromMatrixPosition( camera.matrixWorld );
    let target_pos = new THREE.Vector3();
    target_pos.setFromMatrixPosition( target.matrixWorld );
    console.log(`world pos target = (${target_pos.x},${target_pos.y},${target_pos.z})`);

    place = new THREE.Vector3(0,0,0);
    place.addScaledVector(cam_pos,0.2);
    place.addScaledVector(target_pos,0.8);

    slider.position.set(place.x,place.z,place.z);
    slider.updateMatrixWorld();
    log_pos(slider);
    let slider_pos = new THREE.Vector3();
    slider_pos.setFromMatrixPosition(slider.matrixWorld);
    console.log(`world pos slider = (${slider_pos.x},${slider_pos.y},${slider_pos.z})`);
    slider.visible = true;
}

export{init,run};
