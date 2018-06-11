require({
  baseUrl: 'js',
  // three.js should have UMD support soon, but it currently does not
  shim: { 'vendor/three': { exports: 'THREE' } }
}, [
  'vendor/three'
], function(THREE) {
  var scene, camera, renderer;
  var light;

  var textureURL = 'https://images.pexels.com/photos/235994/pexels-photo-235994.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';
  var texture = new THREE.TextureLoader().load( textureURL );

  var squareGeometry, squareMaterial, squareMesh;
  var squareOptions = {
    color: 0xff0000,
    wireframe: true
  };

  var torusGeometry, torusMaterial, torusMesh;
  var torusOptions = {
    map: texture,
    //lights: true
  };

  init();
  animate();

  function init() {
    // Define scene and camera
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    // Create Square geometry and add to scene
    // squareGeometry = new THREE.BoxGeometry( 200, 200, 200 );
    // squareMaterial = new THREE.MeshBasicMaterial( squareOptions );
    //
    // squareMesh = new THREE.Mesh( squareGeometry, squareMaterial );
    // scene.add( squareMesh );

    // Create Torus Knot geometry and add to scene
    torusGeometry = new THREE.TorusKnotGeometry( 200, 60, 100, 16 );
    torusMaterial = new THREE.MeshBasicMaterial( torusOptions );

    torusMesh = new THREE.Mesh( torusGeometry, torusMaterial );
    scene.add( torusMesh );

    // White directional light at half intensity shining from the top
    //light = new THREE.DirectionalLight( 0xffffff, 0.5 );
    //light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    light = new THREE.SpotLight( 0xffffff );

    light.castShadow = true;

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    light.shadow.camera.near = 500;
    light.shadow.camera.far = 4000;
    light.shadow.camera.fov = 30;
    scene.add( light );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );
  }

  function animate() {
    requestAnimationFrame( animate );

    // squareMesh.rotation.x += 0.01;
    // squareMesh.rotation.y += 0.02;

    torusMesh.rotation.x += 0.01;
    torusMesh.rotation.y += 0.01;

    renderer.render( scene, camera );
  }
});
