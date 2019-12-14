import * as three from "./three_app.js";
import * as mouse from "./three_mouse.js";

const interactive_meshes = {};

function onMeshMouseEnter(e){
	console.log(`Mesh Mouse Enter in ${e.detail.name}`);
	document.getElementById('viewer').style.cursor = "pointer";
	three.setBulbState(interactive_meshes[e.detail.name],"highlight",true);
}

function onMeshMouseExit(e){
	console.log(`Mesh Mouse Exit out of ${e.detail.name}`)
	document.getElementById('viewer').style.cursor = "default";
	three.setBulbState(interactive_meshes[e.detail.name],"highlight",false);
}

function main_init(){

	three.init();

	mouse.init(three.getCamera());
	let interactive_meshes_names = ["TestBulb1"];
	let interactive_meshes_list = three.getObjects(interactive_meshes_names);
	mouse.SetMeshList(interactive_meshes_list);

	//convert list to map for more practicale usage in events
	interactive_meshes_list.forEach(mesh => interactive_meshes[mesh.name] = mesh);
	
	three.animate();

	window.addEventListener( 'mesh_mouse_enter', onMeshMouseEnter, false );
	window.addEventListener( 'mesh_mouse_exit', onMeshMouseExit, false );

}


main_init();

