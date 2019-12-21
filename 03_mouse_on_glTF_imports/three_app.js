//import "../libs/three/three.module.js";
//import "../libs/three/OrbitControls.js";

var camera, scene, renderer;

var controls;

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

function create_camera(){
	var container = document.getElementById('viewer');
	var w = container.clientWidth;
	var h = container.clientHeight;
	camera = new THREE.PerspectiveCamera( 45, w / h, 0.01, 20 );
	camera.position.z = -3;
	camera.position.y = 2;
	return camera;
}

function create_renderer(){
	var container = document.getElementById('viewer');
	var w = container.clientWidth;
	var h = container.clientHeight;
	

	renderer = new THREE.WebGLRenderer( { antialias: true,alpha:true } );
	renderer.setSize( w, h );
	renderer.setClearColor( 0x000000, 0.0 );
	renderer.physicallyCorrectLights = true;

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap	

	container.appendChild(renderer.domElement);
	return renderer;
}

function add_view_orbit(camera,renderer){
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
	return controls;
}

function onWindowResize() {
	var container = document.getElementById('viewer');
	var w = container.clientWidth;
	var h = container.clientHeight;
	camera.aspect = w / h;
	camera.updateProjectionMatrix();

	renderer.setSize( w, h );
}

function add_ambient_light(){

	var dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	dirLight.position.set( 1, 3, 0 );
	dirLight.castShadow = true;
	//dirLight.receiveShadow = true;

	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;
	var d = 6;
	dirLight.shadow.camera.left = - d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = - d;
	dirLight.shadow.camera.far = 7;
	dirLight.shadow.bias = - 0.01;

	scene.add( dirLight );
}

function load_scene(gltf_filename,on_load){
	var loader = new THREE.GLTFLoader();
	loader.load(gltf_filename,
		// called when the resource is loaded
		function ( gltf ) {
			scene = gltf.scene;
			console.log(`scene object names traversal`);
			scene.traverse(obj =>{
				console.log(`  - ${obj.name}`);
				//cannot distinguish Light from Camera so apply shadow options to all children without if(obj.type == "Mesh")
				obj.castShadow = true;
				obj.receiveShadow = true;
			} );
			//The glTF camera is not having the correct window spect ratio and does produce very minimal orbit control movements
			//camera = gltf.cameras[0];
			//The glTF light might not have all fine tuning options such as shadow.mapsize
			//add_ambient_light();
			camera = create_camera();
			renderer = create_renderer();
			controls = add_view_orbit(camera,renderer);

			on_load();
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
function init(on_load){
	console.log("three_app> init()");

	load_scene("./scene_light.gltf",on_load);

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
