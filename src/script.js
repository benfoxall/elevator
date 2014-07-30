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