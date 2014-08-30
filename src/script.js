navigator.getMedia = ( navigator.getUserMedia ||
                 navigator.webkitGetUserMedia ||
                 navigator.mozGetUserMedia ||
                 navigator.msGetUserMedia);

var URL = window.URL || window.webkitURL;


var constraints = {
  //qvga
  video: {
    mandatory: {

		// maxWidth: 320,
		// maxHeight: 180

		// maxWidth: 960,
		// maxHeight: 540,

		maxWidth: 640,
		maxHeight: 360,

    }
  },
  audio: false
};

// calls back with the blob url of the video
function getVideo(callback){
	navigator.getMedia(constraints,
    function(stream) {
    	callback(URL.createObjectURL(stream))
    },
    function(err) {
      console.error("An error occured! " + err);
    })
}

getVideo(function(u){
	console.log(u);
	var v = document.querySelector('video');
	v.src=u;

	v.onloadedmetadata = function(e){
        var dimensions = [v.videoWidth, v.videoHeight];
        console.log(dimensions);
        Reveal.layout();
    }

	setTimeout(function(){

		console.log("drawn")
	}, 4000)
})

Reveal.addEventListener( 'slidechanged', function( event ) {
	if(event.currentSlide.id == 'getPhoto'){
		// start the video
		var v = document.querySelector('video');
		v.play()
	}

	if(event.previousSlide.id == 'getPhoto'){
		// start the video
		var v = document.querySelector('video');
		var canvas = document.createElement('canvas');
		canvas.width = v.width; canvas.height = v.height;
		canvas.getContext("2d").drawImage(v, 0, 0, canvas.width, canvas.height);

    startVis(canvas)

		var img = canvas.toDataURL("image/png");
		
		photo.onload = function(){
			Reveal.layout();	
		}
		
		photo.src=img;
	}
} );




// Circle selector
(function(photo, canvas){

	var points = [];

	function generate(){
		console.log("generate")
		canvas.width = photo.width;
		canvas.height = photo.height;
		points = [];
	}

	photo.addEventListener('load', generate, false);

	// perhaps it's loaded already
	if(photo.width) generate();



	//
	canvas.addEventListener('mousedown', function(e){
		e.preventDefault();
		console.log(e)

		// function click_handler(e) {

		var zoom = window.Reveal && Reveal.getScale() || 1;

		var rect = this.getBoundingClientRect();
		var left = (e.clientX/zoom) - rect.left - this.clientLeft + this.scrollLeft;
		var top = (e.clientY/zoom) - rect.top - this.clientTop + this.scrollTop;
		console.log(left, top)

var ctx = canvas.getContext('2d');


	ctx.fillStyle = '#08f';
	ctx.beginPath();
	ctx.arc(left, top,5,2*Math.PI,false)
	ctx.fill()

	points.push([left, top]);
	if(points.length > 2){
		var c = circler.apply(this, points);

		points = []

		if(!c) return;

		ctx.fillStyle = 'rgba(255,0,150,0.4)';
		ctx.beginPath();
		ctx.arc(c.center[0],c.center[1],c.radius,2*Math.PI,false)
		ctx.fill();

    highlight(c.center[0],c.center[1],c.radius)
	}



    // var dot = document.createElement('div');
    // dot.setAttribute('style', 'position:absolute; width: 2px; height: 2px; top: '+top+'px; left: '+left+'px; background: red;');
    // this.appendChild(dot);
// }
	}, false)

})
.apply(this,
	['photo', 'circleSelect']
	.map(document.getElementById.bind(document))
)













//// VIS

var visSlide = document.getElementById('vis');





var killed = false;


function rgb_hsv(r, g, b){
  var h, s, v, cmax, cmin, delta;

  // Cmax = max(R', G', B')
  // Cmin = min(R', G', B')
  cmax = Math.max(r,g,b);
  cmin = Math.min(r,g,b);

  // console.log(cmax, cmin)

  // Î” = Cmax - Cmin
  delta = cmax - cmin;

  // Hue calculation:
  if(cmax == r){
    h = 60 * (((g - b) / delta) % 6)
  } else if(cmax == g){
    h = 60 * (((b - r) / delta) + 2)
  } else if(cmax == b){
    h = 60 * (((r - g) / delta) + 4)
  }

  // Saturation calculation:

  if(delta == 0){
    s = 0;
  } else {
    s = (delta*255)/cmax;
  }

  // Value calculation:
  // V = Cmax
  v = cmax;

  // 0 --> 255
  // h = (((h || 0)+360) % 360 ) / 1.411764 

  // 0 --> 2PI
  h = (((h || 0)+360) % 360 ) * ((Math.PI*2)/360);

  return [h, s, v]

}


// plots hsv into 255/255 cylinder
function hsv_3d(hsv){
  var x,y,z, h = hsv[0], s = hsv[1], v = hsv[2];

  x = Math.cos(h) * s * 0.5;
  y = v;
  z = Math.sin(h) * s * 0.5;

  return [x,y-127,z];
}



// particles
attributes = {
  c:{
    type: 'c', 
    value: []
  },

  custompositiona: { type: 'v3', value: [] },
  custompositionb: { type: 'v3', value: [] },
  custompositionc: { type: 'v3', value: [] },

  mmatches: {
    type: 'f',
    value: []
  }

};

uniforms = {
  // state: 0.0
  state: { type: "f", value: 0.0 },
  // hsvness: { type: "f", value: 0.0 },

  centre: { type: 'v3', value: new THREE.Vector3(795 - (960/2), (540/2) - 180, 0)},
  radius: { type: "f", value: 95.0},

  highlight: { type: "f", value: 0.0 }

};

var shaderMaterial = new THREE.ShaderMaterial( {

  uniforms:     uniforms,
  attributes:     attributes,
  vertexShader:   document.getElementById( 'vertexshader' ).textContent,
  fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

  blending:     THREE.NormalBlending,
  depthTest:    true,
  transparent:  true,
  
});


var width = 960;//window.innerWidth;
var height = 540;//window.innerHeight;

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0xeeeeee, 1);
visSlide.appendChild(renderer.domElement);


scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera( 30.25, width / height, 1, 1000000 );
camera.position.z = 1000;

renderer.render(scene, camera);

function start(data){

  var radius = 200;
  var geometry = new THREE.Geometry();

  // debugger
  for (var x = 0; x < data.width; x++){
    for (var y = 0; y < data.height; y++){

      var i = (x + (y*data.width)) * 4;

      geometry.vertices.push( new THREE.Vector3(1,1,1) );


      attributes.custompositiona.value.push(new THREE.Vector3(x - (data.width/2),(data.height/2)-y,0))


      attributes.custompositionb.value.push(new THREE.Vector3(data.data[i]-127,data.data[i+1]-127,data.data[i+2]-127));

      var hsv = hsv_3d(rgb_hsv(data.data[i], data.data[i+1], data.data[i+2]));
      attributes.custompositionc.value.push(new THREE.Vector3(hsv[0],hsv[1],hsv[2]));


      attributes.c.value.push(new THREE.Color(data.data[i]/255,data.data[i+1]/255,data.data[i+2]/255));

      // whether it mmatches the thresholds
      attributes.mmatches.value.push(0);

    }
  }


  particles = new THREE.ParticleSystem( geometry, shaderMaterial );

  scene.add(particles)


  rgbcube = new THREE.Object3D();

  function ball(color){
    var r = (color & 0xff0000) >> 16,
        g = (color & 0x00ff00) >> 8,
        b = (color & 0x0000ff);


    var geometry2 = new THREE.SphereGeometry(10,10,10)
    var material = new THREE.MeshBasicMaterial( { wireframe: false, color: color, opacity: 0.2} );
    var sphere = new THREE.Mesh( geometry2, material );
    sphere.position.x = (r - 127);
    sphere.position.y = (g - 127);
    sphere.position.z = (b - 127);
    rgbcube.add( sphere );
  }


  ball(0x000000);

  ball(0x0000ff);
  ball(0x00ff00);
  ball(0xff0000);



  var material = new THREE.LineBasicMaterial({
      color: 0x888888,
      linewidth: 1
  });

  var geometry = new THREE.Geometry();

  var c_x, c_y, c_z;
  c_x = c_y = c_z = -127;

  geometry.vertices.push(new THREE.Vector3(c_x,c_y,c_z));
  geometry.vertices.push(new THREE.Vector3(c_x+255,c_y,c_z));
  
  geometry.vertices.push(new THREE.Vector3(c_x,c_y,c_z));
  geometry.vertices.push(new THREE.Vector3(c_x,c_y+255,c_z));
  
  geometry.vertices.push(new THREE.Vector3(c_x,c_y,c_z));
  geometry.vertices.push(new THREE.Vector3(c_x,c_y,c_z+255));


   var line = new THREE.Line(geometry, material);
   rgbcube.add(line);



var cube = new THREE.BoxGeometry( 260, 260, 260 );
var cubematerial = new THREE.MeshBasicMaterial( {wireframe: false, color: 0x000000, opacity: 0.1, transparent:true} );
var cube = new THREE.Mesh( cube, cubematerial );


rgbcube.add( cube );


   scene.add(rgbcube)




var cgeometry = new THREE.CylinderGeometry( 127, 127, 255, 32, 4);
var cmaterial = new THREE.MeshBasicMaterial( {wireframe: false, color: 0x000000, opacity: 0.1, transparent:true } );
cylinder = new THREE.Mesh( cgeometry, cmaterial );
scene.add( cylinder );
cylinder.position.z = 200
cylinder.position.y = -500



// offscreen for now
  rgbcube.position.z = 200;
  rgbcube.position.y = -500;
  rgbcube.rotation.y = 0;



  function render() {
    if(killed) return;

    requestAnimationFrame(render);

    rgbcube.rotation.y = particles.rotation.y = _spin.y;

    renderer.render(scene, camera);
    TWEEN.update();
  }

  render()

}

function three_rgb(c){
  return [c.r*255, c.g*255, c.b*255];
}


var baubleWorker = new Worker("js/bauble/bauble-worker.js");

baubleWorker.onmessage = function(oEvent){
  console.log("BAUBLE> ", oEvent.data);


  var minh = oEvent.data.windows[0],
      maxh = oEvent.data.windows[1],
      mins = oEvent.data.windows[2],
      maxs = oEvent.data.windows[3],
      minv = oEvent.data.windows[4],
      maxv = oEvent.data.windows[5];

  // populate all
  var ms = attributes.mmatches.value, colors = attributes.c.value, c, hsv;
  for (var i = ms.length - 1; i >= 0; i--) {
    hsv = rgb_hsv.apply(this,three_rgb(colors[i]));

    ms[i] = 
      (minh < maxh ? 
        hsv[0] > minh || hsv[0] < maxh :
        hsv[0] < minh && hsv[0] > maxh
      ) &&
      mins < hsv[1] && maxs > hsv[1]  &&
      minv < hsv[2] && maxv > hsv[2]
    ? 1 : 0;

  };

  attributes.mmatches.needsUpdate = true

  console.log("done")

  // READY TO DO STUFF

}

// highlight a circle on the points
function highlight(x,y,r){
  uniforms.centre.value = new THREE.Vector3(x - (960/2), (540/2) - y, 0);
  uniforms.radius.value = r;

  // compute the bounds

  console.log("sending", [x,y,r])

    baubleWorker.postMessage({
        type:'calibrate',

        image: cdata,
        // calibration_size: Math.min(this.height,this.width) / 5,
        // calibration_circle: [x,y,r],
        cx: x,
        cy: y,
        cr: r,
        windows: [15,30,60]// TODO MAKE TAILORABLE

      },[cdata.data.buffer]);


}

var img = new Image, cdata;
img.onload = function(){
  var c = document.createElement('canvas');
  c.width = 200;//img.width;
  c.height = 200;//img.height;

  c.width = img.width;
  c.height = img.height;

  var ctx = c.getContext('2d');
  ctx.drawImage(img,0,0);

  var data = ctx.getImageData(0,0,c.width,c.height);
  cdata = ctx.getImageData(0,0,c.width,c.height); // for calibrating stuff

  start(data);

  // highlight pixels as being active
  // highlight(800, 200, 95)
  
}
// img.src='img/example-3.png'

// Start the visualisation from a canvas element
function startVis(c){
  var ctx = c.getContext('2d');

  var data = ctx.getImageData(0,0,c.width,c.height);
  cdata = ctx.getImageData(0,0,c.width,c.height); // for calibrating stuff

  start(data);

  // highlight(800, 200, 95)

}


var _spin = {y:0};


// show rgb
function step1(){

  rgbcube.position.z = 200;
  rgbcube.position.y = -500;
  rgbcube.rotation.y = Math.PI*2;

  (new TWEEN.Tween(rgbcube.position)
    .to({y: 0}, 2000)
    .easing(TWEEN.Easing.Quadratic.Out)
  ).start();

  (new TWEEN.Tween(rgbcube.rotation)
    .to({y: 0.3, x: 0.2}, 5000)
    .easing(TWEEN.Easing.Quadratic.Out)
  ).start();
}

// morph the pixels into the rgb space
function step2(){

  // transition image to rgb
  (new TWEEN.Tween(uniforms.state)
    .to({value: 1}, 5000)
    .easing(TWEEN.Easing.Exponential.InOut)
  ).start();

  (new TWEEN.Tween(particles.rotation)
    .to({y: 0.3, x: 0.2}, 5000)
    .easing(TWEEN.Easing.Exponential.InOut)
  ).start();

  (new TWEEN.Tween(particles.position)
    .to({z: 200}, 5000)
    .easing(TWEEN.Easing.Exponential.InOut)
    .onComplete(function(){
      console.log("completed")
      autoRotate = true;
    })
  ).start();

  (new TWEEN.Tween(_spin)
    .to({y:0.6}, 5000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .chain(new TWEEN.Tween(_spin)
      .to({y:-0.6-(Math.PI)}, 8000)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
    )
  ).start()
}


// highlight matched pixels
function step3(){

  (new TWEEN.Tween(uniforms.highlight)
    .to({value: 1}, 5000)
    .easing(TWEEN.Easing.Exponential.InOut)
  ).start();

  // (new TWEEN.Tween(_spin)
  //    .to({y:2}, 7000)
  //    .easing(TWEEN.Easing.Sinusoidal.InOut)
  // ).start()
}

// move to hsv, then highlight
function step4(){

  (new TWEEN.Tween(uniforms.highlight)
    .to({value: 0}, 2000)
    .easing(TWEEN.Easing.Exponential.InOut)
  ).start();

  (new TWEEN.Tween(uniforms.state)
    .to({value: 2}, 5000)
    .easing(TWEEN.Easing.Exponential.InOut)
    .chain(
      new TWEEN.Tween(uniforms.highlight)
          .to({value: 1}, 2000)
          .easing(TWEEN.Easing.Exponential.InOut)
    )
  ).start();


  (new TWEEN.Tween(rgbcube.position)
    .to({y: 1000}, 3000)
    .easing(TWEEN.Easing.Quadratic.Out)
  ).start();

  (new TWEEN.Tween(cylinder.position)
    .to({y: 0}, 5000)
    .easing(TWEEN.Easing.Exponential.InOut)
  ).start();


  (new TWEEN.Tween(_spin)
      .to({y:'+' + Math.PI*4}, 20000)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
  ).start()
}

// highlight our own
function step5(){
  (new TWEEN.Tween(uniforms.highlight)
    .to({value: -1}, 2000)
    .easing(TWEEN.Easing.Exponential.InOut)
  ).start();
}


// move back to the image
function step6(){
  TWEEN.removeAll();

  (new TWEEN.Tween(cylinder.position)
    .to({y: 500}, 5000)
    .easing(TWEEN.Easing.Exponential.Out)
  ).start();

  // (new TWEEN.Tween(uniforms.highlight)
  //  .to({value: 0}, 3000)
  //  .easing(TWEEN.Easing.Exponential.InOut)
  // ).start();

  (new TWEEN.Tween(uniforms.state)
    .to({value: 0}, 7000)
    .easing(TWEEN.Easing.Exponential.InOut)
  ).start();


  (new TWEEN.Tween(particles.rotation)
    .to({x: 0}, 5000)
    .easing(TWEEN.Easing.Exponential.InOut)
  ).start();


  (new TWEEN.Tween(particles.position)
    .to({z: 0}, 5000)
    .easing(TWEEN.Easing.Exponential.InOut)
  ).start();


  _spin.y = _spin.y % (Math.PI*2);

  (new TWEEN.Tween(_spin)
      .to({y:0}, 5000)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
  ).start()
}



function destroy(){
  killed = true;

  // remove some of the bigger things
  attributes.custompositiona.value = [];
  attributes.custompositionb.value = [];
  attributes.custompositionc.value = [];
  attributes.matches.value = [];

}





// SLIDE LINKUP

// var visSlide = document.getElementById('vis');


var dyn_slide = new DynamicSlide(visSlide);

dyn_slide.addEventListener('shown', function(){
  console.log("shown");
  // self.state_intro();
})

dyn_slide.addEventListener('hidden', function(){
  console.log("hidden");
  // self.stop(); console.log("stopped")
});

dyn_slide.fragments([
  step1,
  step2,
  step3,
  step4,
  step5,
  step6
])















