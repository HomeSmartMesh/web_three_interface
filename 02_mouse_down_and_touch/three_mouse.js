import {
	Matrix4,
	Raycaster,
	Vector2
} from "../libs/three/three.module.js";


var camera;
var container;

var raycaster;
var mouse = {
	"is_inside_object":false,
	"object":""
};

var mesh_list = [];

function send_custom_event(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}

function get_mesh_intersect(l_x,l_y){
	var rect = container.getBoundingClientRect();
	var vect2 = new Vector2();
	vect2.x = ( ( l_x - rect.left ) / rect.width ) * 2 - 1;
	vect2.y = - ( ( l_y - rect.top ) / rect.height ) * 2 + 1;

	let result = "";
	camera.projectionMatrixInverse = new THREE.Matrix4();
	camera.projectionMatrixInverse.getInverse(camera.projectionMatrix);
	raycaster.setFromCamera( vect2, camera );
	var intersects = raycaster.intersectObjects( mesh_list, true );
	if(intersects.length > 0){
		result = intersects[ 0 ].object.name;
	}
	return result;
}

function process_mouse_event(event_name, event){
	event.preventDefault();

	var obj_name = get_mesh_intersect(event.clientX,event.clientY);

	if ( obj_name != "") {
		mouse.object = obj_name;
		if(!mouse.is_inside_object){
			send_custom_event("mesh_mouse_enter",{ type: "light", name: mouse.object});
		}
		mouse.is_inside_object = true;
		send_custom_event(event_name,{ type: "light", name: mouse.object});
	}
	else{
		if(mouse.is_inside_object){
			mouse.is_inside_object = false;
			send_custom_event("mesh_mouse_exit",{ type: "light", name: mouse.object});
		}
	}
}

function onTouch(event){
	event.preventDefault();
	console.log("onTouch",event);
	if(event.type == "touchstart"){
		var obj_name = get_mesh_intersect(event.targetTouches[0].clientX,event.targetTouches[0].clientY);
		if ( obj_name != "") {
			send_custom_event("mesh_touch_start",{ type: "light", name: obj_name});
		}
	}
}

function onMouseDown(event){
	process_mouse_event("mesh_mouse_down",event)
}

function onMouseMove(event){
	process_mouse_event("mesh_mouse_move",event)
}


function init(l_camera,l_container) {
	camera = l_camera;
	container = document.getElementById('viewer');
    console.log("three_mouse> init()");

	raycaster = new Raycaster();
	container.addEventListener( 'mousemove', onMouseMove, false );
	container.addEventListener( 'mousedown', onMouseDown, false );
	container.addEventListener( 'touchstart', onTouch, false );
}

function SetMeshList(l_mesh_list){
	mesh_list = l_mesh_list;
	mesh_list.forEach(mesh =>{
		console.log(`three_mouse> added mesh ${mesh.name}`);
	})
}

export{init,SetMeshList};
