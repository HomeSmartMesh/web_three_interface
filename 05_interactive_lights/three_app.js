//import "../libs/three/three.module.js";
//import "../libs/three/OrbitControls.js";

var camera, scene, renderer;

var controls;

function setBulbState(name,state_name,value){
	let light_mesh = scene.getObjectByName(name);
	if(state_name == "switch"){
		let light = scene.getObjectByName(light_mesh.userData.light);
		if(value){
			var emit = new THREE.Color( 0, 0.5, 0 );
			if(light.children[0].isPointLight){
				light.children[0].power = 100;
			}
			else{
				console.log(`${light_name} is not a light !!`);
			}
		}
		else{
			var emit = new THREE.Color( 0, 0, 0 );
			if(light.children[0].isPointLight){
				light.children[0].power = 0;
			}
			else{
				console.log(`${light_name} is not a light !!`);
				light.children[0].power = 0;
			}
		}
	}
	else{
		if(state_name == "highlight"){
			if(value){
				var emit = new THREE.Color( 1, 0, 0 );
			}
			else{
				var emit = new THREE.Color( 0, 0, 0 );
			}
		}
		else{
			var emit = light_mesh.material.emissive;
		}
	}


		var material = new THREE.MeshPhongMaterial( {
			color: light_mesh.material.color,
			emissive: emit,
			side: light_mesh.material.side,
			flatShading: light_mesh.material.flatShading
		});
		light_mesh.material = material;
		console.log(`${name} has emissive at ${emit.getHexString()}`);

}

function create_camera(){
	var container = document.getElementById('viewer');
	var w = container.clientWidth;
	var h = container.clientHeight;
	camera = new THREE.PerspectiveCamera( 45, w / h, 0.01, 50 );
	camera.position.y = 10;
	camera.position.x = 0;
	camera.position.z = 15;
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
	controls.maxDistance = 30;

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

function log_scene_info(scene){
	console.log(`scene object names traversal`);
	scene.traverse(obj =>{
		console.log(` - ${obj.type} ; ${obj.name}`);
		//cannot distinguish Light from Camera so apply shadow options to all children without if(obj.type == "Mesh")
		//obj.castShadow = true;
		obj.receiveShadow = true;
	} );
}

function get_scene_box(scene){
	let first = true;
	var box;
	scene.traverse(obj =>{
		if(obj.type == "Mesh"){
			if(first){
				box = new THREE.Box3().setFromObject(obj);
				first = false;
			}else{
				box.expandByObject(obj)
			}
		}
	} );
	return box;
}

function center_scene(scene){
	console.log(`centering the scene`);
	var box = get_scene_box(scene);
	var s = box.getSize();
	console.log(`scene boxed from (${box.min.x},${box.min.y},${box.min.z}) to (${box.max.x},${box.max.y},${box.max.z}) with size (${s.x},${s.y},${s.z})`);
	const center_x = (box.max.x - box.min.x)/2;
	const center_y = (box.max.y - box.min.y)/2;
	console.log(`shifting the scene by x = ${-center_x} , y = ${-center_y}`);
	scene.position.set(scene.position.x + center_x/100, scene.position.y, scene.position.z);
	scene.traverse(obj =>{
		//though only meshes are taken as input, here everything is shifted as lights shall shift too
		//hierarchical structure does move end leaves multiple times, so selection of meshes only moved as workaround
		//if(obj.type == "Mesh"){obj.position.set(obj.position.x + center_x, obj.position.y - center_y,obj.position.z);		}
	} );
	box = get_scene_box(scene);
	s = box.getSize();
	console.log(`now scene boxed from (${box.min.x},${box.min.y},${box.min.z}) to (${box.max.x},${box.max.y},${box.max.z}) with size (${s.x},${s.y},${s.z})`);
}

function apply_custom_properties(){
	scene.traverse(obj =>{
		//though only meshes are taken as input, here everything is shifted as lights shall shift too
		//hierarchical structure does move end leaves multiple times, so selection of meshes only moved as workaround
		if(obj.type == "Mesh"){
			if(obj.userData.visible == "false"){
				obj.visible = false;
			}
		}
	} );
}

function load_scene(gltf_filename,user_on_load){
	var loader = new THREE.GLTFLoader();
	loader.load(gltf_filename,
		// called when the resource is loaded
		function ( gltf ) {
			scene = gltf.scene;
			//log_scene_info(scene);
			center_scene(scene);
			//The glTF camera is not having the correct window spect ratio and does produce very minimal orbit control movements
			//camera = gltf.cameras[0];
			//The glTF light might not have all fine tuning options such as shadow.mapsize
			apply_custom_properties(scene);
			add_ambient_light();
			camera = create_camera();
			renderer = create_renderer();
			controls = add_view_orbit(camera,renderer);
			user_on_load();
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
function init(on_load,rooms){
	console.log("three_app> init()");

	load_scene(rooms["glTF_Model"],on_load);

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

function getLightMeshList(){
	var mesh_list = [];
	scene.traverse(obj => {
		if((obj.type == "Mesh")&&(obj.userData.type == 'light')){
			mesh_list.push(obj);
			console.log(`added mesh object as light : ${obj.name}`);
		}
	});
	return mesh_list;
}

function getCamera(){
	return camera;
}

export{init,animate,getLightMeshList,setBulbState,getCamera};
