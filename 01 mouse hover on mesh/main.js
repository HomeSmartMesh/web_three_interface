import {
	Matrix4,
	Raycaster,
	Vector2
} from "../three/three.module.js";

var camera, scene, renderer;

var container,controls;

var raycaster;
var mouse = {
	"is_inside_object":false,
	"object":""
};

var bulb_map = {};
var mesh_list = [];

function send_custom_event(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}

function mqtt_send(topic,payload){
	send_custom_event('mqtt_received',{ topic: topic, payload:payload });
}

function init(){
    console.log("init()");
    world_init();
    animate();
}

class Bulb{
	constructor(name,pos){
		this.name = name;
		var size = 20;
		var nb_sections = 64;
		var geometry = new THREE.SphereGeometry( size, nb_sections,nb_sections );
		
		//material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
		var material = new THREE.MeshPhongMaterial( {
			color: 0xb5b2b9,
			emissive: 0x272524,
			specular:0x000000,
			side: THREE.FrontSide,
			flatShading: true
		});

		this.mesh = new THREE.Mesh( geometry, material );
		this.mesh.name = name;
		this.mesh.position.set(pos.x,pos.y,pos.z);
		scene.add( this.mesh );
		mesh_list.push(this.mesh);
		}
	setMouseState(is_inside){
		if(is_inside){
			var spec = 0xaa0000;
		}
		else{
			var spec = 0x000000;
		}
		var material = new THREE.MeshPhongMaterial( {
			color: this.mesh.material.color,
			emissive: spec,
			specular: spec,
			side: this.mesh.material.side,
			flatShading: this.mesh.material.flatShading
		});
		this.mesh.material = material;
		console.log("specular = ",this.mesh.material.specular);
	}
}

function add_controls(){
	controls = new THREE.OrbitControls( camera, renderer.domElement );

	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 1.5;//0.1:too rolly, 1: smooth, 2 unstable

	controls.screenSpacePanning = false;

	controls.minDistance = 10;
	controls.maxDistance = 1000;

	controls.minPolarAngle =  10 * Math.PI / 180;
	controls.maxPolarAngle =  80 * Math.PI / 180;

	controls.rotateSpeed = 0.7;

}

function onWindowResize() {
	var w = container.clientWidth;
	var h = container.clientHeight;
	camera.aspect = w / h;
	camera.updateProjectionMatrix();

	renderer.setSize( w, h );
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


function onMeshMouseEnter(e){
	console.log(`Mesh Mouse Enter : ${e.detail.name} ; cursor=${container.style.cursor}`);
	container.style.cursor = "pointer";
	bulb_map[e.detail.name].setMouseState(true);
}

function onMeshMouseExit(e){
	console.log(`Mesh Mouse Exit : ${e.detail.name} ; cursor=${container.style.cursor}`)
	container.style.cursor = "default";
	bulb_map[e.detail.name].setMouseState(false);
}

//the unit is centimeters
function add_environment(){
    var geometry = new THREE.PlaneGeometry( 200, 100, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x666666, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    scene.add( plane );
}

function add_ambient_light(){
	//var a_light = new THREE.AmbientLight( 0x303030 ); // soft white light
	//scene.add( a_light );		
	var h_light = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.2 );
	//h_light.color.setHSL( 0.6, 0.6, 0.6 );
	//h_light.groundColor.setHSL( 1, 1, 0.75 );
	h_light.position.set( 0, 500, 0 );
	scene.add( h_light );	

	var dirLight = new THREE.DirectionalLight( 0xffffff, 0.05 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( 0, 300, 0 );
	scene.add( dirLight );
	dirLight.castShadow = true;

	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;

	var d = 600;
	dirLight.shadow.camera.left = - d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = - d;
	dirLight.shadow.camera.far = 700;
	dirLight.shadow.bias = - 0.0001;
}


function world_init() {

	console.log("world_init()");
	container = document.getElementById('viewer');
	var w = container.clientWidth;
	var h = container.clientHeight;
	
	camera = new THREE.PerspectiveCamera( 45, w / h, 10, 2000 );
	camera.position.z = 300;
	camera.position.y = 100;

	scene = new THREE.Scene();

	add_environment();
	
	add_ambient_light();

	var bulb_name = "TestBulb1";
	bulb_map[bulb_name] = new Bulb(bulb_name,{x:0,y:0,z:40});

	raycaster = new Raycaster();

	renderer = new THREE.WebGLRenderer( { antialias: true,alpha:true } );
	renderer.setSize( w, h );
	renderer.setClearColor( 0x000000, 0.0 );

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap	

	container.appendChild(renderer.domElement);

	add_controls();

	window.addEventListener( 'resize', onWindowResize, false );
	container.addEventListener( 'mousemove', onMouseMove, false );

    window.addEventListener( 'mesh_mouse_enter', onMeshMouseEnter, false );
	window.addEventListener( 'mesh_mouse_exit', onMeshMouseExit, false );

}

function animate() {

	requestAnimationFrame( animate );

	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

	renderer.render( scene, camera );

}

//----------------------------------------------------------------------------------
init();
