function circler(a,b,c){
	var bab = p_bisect(a,b),
		bac = p_bisect(a,c),
		center = bab.intersectionWith(bac).elements.slice(0,2),
		radius = $V(a).subtract(center).modulus();

	return {
		center: center,
		radius: radius
	};

	// gives the pependicular bisecting line for two vectores
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