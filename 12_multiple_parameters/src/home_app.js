import * as three from "./three_app.js";
import * as mouse from "./three_mouse.js";
import * as control from "./three_control.js";

import dat from "../../jsm/dat.gui.module.js";

import config from "../config.js";

var rooms_light_state = {};
var hue_mesh_name = {};
var gui;
let items_anim = {
	Office:0.2,
	Kitchen:0.5,
	center_bullet:control.get_bullet_centered()
};

function send_custom_event(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}

function init(){
	three.init(on_load,config.glTF_model);

	window.addEventListener( 'mesh_mouse_enter', onMeshMouseEnter, false );
	window.addEventListener( 'mesh_mouse_exit', onMeshMouseExit, false );
	window.addEventListener( 'mesh_mouse_down', onMeshMouseDown, false );
	window.addEventListener( 'mesh_touch_start', onMeshMouseDown, false );
	window.addEventListener( 'hue_lights_on_startup', onHueStartup, false );
	window.addEventListener( 'hue_light_state', onHueLightState, false );
	window.addEventListener( 'mesh_control', onMeshControl, false );
	
}

function set_office(l_val){
	send_custom_event("three_color",{name:"Office", val:l_val});
}

function set_kitchen(l_val){
	send_custom_event("three_color",{name:"Kitchen", val:l_val});
}

function init_dat_gui(){
	gui = new dat.GUI();
	let c_o = gui.add(items_anim, 'Office',0.0,1.0).listen();
	let c_c = gui.add(items_anim, 'Kitchen',0.0,1.0).listen();
	let change_center = gui.add(items_anim, 'center_bullet',true);
	c_o.onChange(value => {set_office(value)});
	c_c.onChange(value => {set_kitchen(value)});
	change_center.onChange(value => {control.set_bullet_centered(value)});
	set_office(items_anim.Office);
	set_kitchen(items_anim.Kitchen);
}

//in this callback, three is ready
function on_load(){

	init_dat_gui();

	mouse.init(three.getCamera());
	const mouse_mesh_list = three.getMouseMeshList();
	mouse.SetMeshList(mouse_mesh_list);

	mouse_mesh_list.forEach(mesh => {
		if(mesh.userData.type == "light"){
			if(mesh.userData.hue != "undefined"){
				hue_mesh_name[mesh.userData.hue] = mesh.name;
			}
		}
		else if(mesh.userData.type == "lightgroup"){
			three.setBulbState(mesh.name,"init",true);
		}
		else if(mesh.userData.type == "heating"){
			three.setHeatState(mesh.name,true);
		}
	});

	control.init(three.getScene(),three.getCamera(),three.getControl());
	//control.init(scene,camera,orbit_control);

	three.animate();

}

function onMeshMouseEnter(e){
	//console.log(`Mesh Mouse Enter in ${e.detail.name}`);
	document.getElementById('viewer').style.cursor = "pointer";
	//three.setBulbState(e.detail.name,"highlight",true);
}

function onMeshMouseExit(e){
	//console.log(`Mesh Mouse Exit out of ${e.detail.name}`)
	document.getElementById('viewer').style.cursor = "default";
	//three.setBulbState(e.detail.name,"highlight",false);
}

function swap_light_state(name){
	if(typeof rooms_light_state[name] == "undefined"){
		rooms_light_state[name] = true;
	}
	else{
		rooms_light_state[name] = ! rooms_light_state[name];
	}
	return rooms_light_state[name];
}

function onMeshMouseDown(e){
	console.log(`Mesh Mouse Down on ${e.detail.name}`);
	if(e.detail.type == "light"){
		const current_state = three.getLightState(e.detail.name);
		three.setBulbState(e.detail.name,"switch",!current_state);
	}
	else if(e.detail.type == "lightgroup"){
		const current_state = three.getLightGroupState(e.detail.name);
		three.setBulbGroupState(e.detail.name,"switch",!current_state);
	}
	else if(e.detail.type == "heating"){
		const current_state = three.getHeatState(e.detail.name);
		three.setHeatState(e.detail.name,!current_state);
	}
	if(["Kitchen","Office"].indexOf(e.detail.name) >= 0){
		let y;
		if(typeof(e.detail.event.clientY) != "undefined"){
			y = e.detail.event.clientY;
		}
		else{
			y = e.detail.event.targetTouches[0].clientY;
		}
		control.run(e.detail.name,y,items_anim[e.detail.name]);
	}
}

function onMeshControl(e){
	//console.log(`home_app> onMeshControl() ${e.detail.name} has ${e.detail.config} at ${e.detail.val.toFixed(2)}`);
	if(["Kitchen","Office"].indexOf(e.detail.name) >= 0){
		if(e.detail.config == "slider"){
			items_anim[e.detail.name] = e.detail.val;
			send_custom_event("three_color",{name:e.detail.name, val:e.detail.val});
		}
	}
}

function onHueLightState(e){

	three.setBulbState(e.detail.name,"switch",e.detail.on);

}

function onHueStartup(e){
	for (const [light_id,light] of Object.entries(e.detail)) {
		if(light.name in hue_mesh_name){
			if(light.state.reachable){
				three.setBulbState(hue_mesh_name[light.name],"highlight",true);
				console.log(`home_app> - ${light.name} is ${light.state.on}`);
				three.setBulbState(hue_mesh_name[light.name],"switch",light.state.on);
			}
			else{
				console.log(`home_app> - ${light.name} is not reachable`);
				three.setBulbState(hue_mesh_name[light.name],"highlight",false);
				three.setBulbState(hue_mesh_name[light.name],"switch",false);
			}

		}
	}

}

export{init};