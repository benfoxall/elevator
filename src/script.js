navigator.getMedia = ( navigator.getUserMedia ||
                 navigator.webkitGetUserMedia ||
                 navigator.mozGetUserMedia ||
                 navigator.msGetUserMedia);

var URL = window.URL || window.webkitURL;


// calls back with the blob url of the video
function getVideo(callback){
	navigator.getMedia({
      video: true,
      audio: false
    },
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
		canvas.width = v.videoWidth; canvas.height = v.videoHeight;
		canvas.getContext("2d").drawImage(v, 0, 0);

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

