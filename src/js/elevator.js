function circler(a,b,c){

	var center = p_bisect(a,b).intersectionWith(p_bisect(a,c)).elements.slice(0,2),
		radius = $V([a[0]-center[0], a[1]-center[1]]).modulus();

	return {
		center: center,
		radius: radius
	};

	// gives the pependicular bisector of two points
	function p_bisect(a,b){
		var bisc = [(a[0]+b[0])/2,(a[1]+b[1])/2],
			perp = rotate($V([a[0]-b[0],a[1]-b[1]]));

		return Line.create(bisc, perp);
	}

	// rotate a vector by 90deg
	function rotate(v){
		return $M([[0, -1],[1, 0]]).x(v)
	}

}