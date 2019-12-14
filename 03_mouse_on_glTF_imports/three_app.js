//import "../three/three.module.js";
//import "../three/OrbitControls.js";

var camera, scene, renderer;

var container,controls;

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

	if(state_name == "switch"){
		if(value){
			var spec = 0x00aa00;
		}
		else{
			var spec = 0x000000;
		}
	}
	else{
		var spec = mesh.material.specular;
	}

		var material = new THREE.MeshPhongMaterial( {
			color: mesh.material.color,
			emissive: emit,
			specular: spec,
			side: mesh.material.side,
			flatShading: mesh.material.flatShading
		});
		mesh.material = material;
		console.log(`${mesh.name} has emissive at ${emit.toString(16)}`);
}

function add_view_orbit(){
	controls = new THREE.OrbitControls( camera, renderer.domElement );

	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 1.5;//0.1:too rolly, 1: smooth, 2 unstable

	controls.screenSpacePanning = false;

	controls.minDistance = 0.10;
	controls.maxDistance = 10;

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

function add_light(){
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

function load_scene(gltf_filename,on_load){
	var loader = new THREE.GLTFLoader();
	loader.load(gltf_filename,
		// called when the resource is loaded
		function ( gltf ) {
			scene = gltf.scene;
			on_load();
			//lights are not on the gltf structure but within the scene children
			//so added manually for now after the scene is loaded
			add_light();
		},
		// called while loading is progressing
		function ( xhr ) {
	
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	
		},
		// called when loading has errors
		function ( error ) {
	
			console.log( 'An error happened' );
	
		}
	);
}
function create_camera(){
	var w = container.clientWidth;
	var h = container.clientHeight;
	camera = new THREE.PerspectiveCamera( 45, w / h, 0.01, 20 );
	camera.position.z = -3;
	camera.position.y = 2;
}

function init(on_load){

	console.log("three_app> init()");

	//create_scene();
	load_scene("./scene.gltf",on_load);

	container = document.getElementById('viewer');
	var w = container.clientWidth;
	var h = container.clientHeight;
	
	create_camera();

	renderer = new THREE.WebGLRenderer( { antialias: true,alpha:true } );
	renderer.setSize( w, h );
	renderer.setClearColor( 0x000000, 0.0 );

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap	
	//renderer.shadowMap.renderSingleSided = true;

	container.appendChild(renderer.domElement);

	add_view_orbit();

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
		if(typeof mesh !== 'undefined'){
			mesh_list.push(mesh);
		}
		else{
			console.log(`No object named ${name} in 'scene'`);
		}
	})
	return mesh_list;
}

function getCamera(){
	return camera;
}

export{init,animate,getObjects,setBulbState,getCamera};
