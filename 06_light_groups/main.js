import * as three from "./three_app.js";
import * as mouse from "./three_mouse.js";

var rooms_light_state = {};
var rooms;

$.getJSON("rooms.json", function(json_data) {
	rooms = json_data;
	main_init();
});

function main_init(){

	three.init(on_load,rooms["glTF_Model"]);

	window.addEventListener( 'mesh_mouse_enter', onMeshMouseEnter, false );
	window.addEventListener( 'mesh_mouse_exit', onMeshMouseExit, false );
	window.addEventListener( 'mesh_mouse_down', onMeshMouseDown, false );
	window.addEventListener( 'mesh_touch_start', onMeshMouseDown, false );
}

function on_load(){
	mouse.init(three.getCamera());
	const mouse_mesh_list = three.getMouseMeshList();
	mouse.SetMeshList(mouse_mesh_list);

	mouse_mesh_list.forEach(mesh => {
		if(mesh.userData.type == "light"){
			three.setBulbState(mesh.name,"switch",false);
			three.setBulbState(mesh.name,"init",true);
		}
		else if(mesh.userData.type == "lightgroup"){
			three.setBulbState(mesh.name,"init",true);
		}
	});


	three.animate();
}

function onMeshMouseEnter(e){
	console.log(`Mesh Mouse Enter in ${e.detail.name}`);
	document.getElementById('viewer').style.cursor = "pointer";
	three.setBulbState(e.detail.name,"highlight",true);
}

function onMeshMouseExit(e){
	console.log(`Mesh Mouse Exit out of ${e.detail.name}`)
	document.getElementById('viewer').style.cursor = "default";
	three.setBulbState(e.detail.name,"highlight",false);
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
}
