//import "../libs/three/three.module.js";
//import "../libs/three/OrbitControls.js";

var camera, scene, renderer;

var container,controls;

var bulb_map = {};

function send_custom_event(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}

function create_bulb(name,pos){
	var size = 20;
	var nb_sections = 64;
	var geometry = new THREE.SphereGeometry( size, nb_sections,nb_sections );
	
	var material = new THREE.MeshPhongMaterial( {
		color: 0xb5b2b9,
		emissive: 0x272524,
		specular:0x000000,
		side: THREE.FrontSide,
		flatShading: true
	});

	var mesh = new THREE.Mesh( geometry, material );
	mesh.name = name;
	mesh.position.set(pos.x,pos.y,pos.z);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
}

function setBulbState(mesh,state_name,value){
	if(state_name == "highlight"){
		if(value){
			var emit = 0x330000;
		}
		else{
			var emit = 0x000000;
		}
	}
	else{
		var emit = mesh.material.emissive;
	}

	var material = new THREE.MeshPhongMaterial( {
		color: mesh.material.color,
		emissive: emit,
		specular: mesh.material.specular,
		side: mesh.material.side,
		flatShading: mesh.material.flatShading
	});
	mesh.material = material;
	console.log(`${mesh.name} has emissive at ${emit.toString(16)}`);
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

//the unit is centimeters
function add_environment(){
    var geometry = new THREE.PlaneGeometry( 200, 100, 32 );
	//var material = new THREE.MeshBasicMaterial( {color: 0x666666, side: THREE.DoubleSide} );
	var material = new THREE.MeshLambertMaterial({color: 0x889988});
	var plane = new THREE.Mesh( geometry, material );
	plane.rotation.x = -Math.PI / 2;
	//plane.castShadow = true;
	plane.receiveShadow = true;
    scene.add( plane );
}

function add_ambient_light(){
	//var a_light = new THREE.AmbientLight( 0x303030 ); // soft white light
	//scene.add( a_light );		
	var h_light = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.2 );
	//h_light.color.setHSL( 0.6, 0.6, 0.6 );
	//h_light.groundColor.setHSL( 1, 1, 0.75 );
	h_light.position.set( 0, 500, 0 );
	//scene.add( h_light );	

	var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	//dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( 100, 300, 0 );
	dirLight.castShadow = true;
	dirLight.receiveShadow = true;

	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;
	var d = 600;
	dirLight.shadow.camera.left = - d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = - d;
	dirLight.shadow.camera.far = 700;
	dirLight.shadow.bias = - 0.0001;

	scene.add( dirLight );
}


function init(){

	console.log("three_app> init()");
	container = document.getElementById('viewer');
	var w = container.clientWidth;
	var h = container.clientHeight;
	
	camera = new THREE.PerspectiveCamera( 45, w / h, 10, 2000 );
	camera.position.z = -300;
	camera.position.y = 200;

	scene = new THREE.Scene();

	add_environment();
	
	add_ambient_light();

	var bulb_mesh = create_bulb("TestBulb1",{x:0,y:50,z:0});
	scene.add( bulb_mesh );

	renderer = new THREE.WebGLRenderer( { antialias: true,alpha:true } );
	renderer.setSize( w, h );
	renderer.setClearColor( 0x000000, 0.0 );

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap	
	//renderer.shadowMap.renderSingleSided = true;

	container.appendChild(renderer.domElement);

	add_controls();

	window.addEventListener( 'resize', onWindowResize, false );


}

function animate() {
	requestAnimationFrame( animate );

	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

	renderer.render( scene, camera );

}

function getObjects(objects_names){
	var mesh_list = [];
	objects_names.forEach(name => {
		let mesh = scene.getObjectByName(name);
		mesh_list.push(mesh);
	})
	return mesh_list;
}

function getCamera(){
	return camera;
}

export{init,animate,getObjects,setBulbState,getCamera};
