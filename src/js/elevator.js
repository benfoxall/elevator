function circler(a,b,c){

	var n = Math.PI/2;
	var r = $M([
		[Math.cos(n), -Math.sin(n)],
		[Math.sin(n), Math.cos(n)]
	]);
	// $M([[0, -1],[1, 0]]);

	var ab_mid  = [(a[0]+b[0])/2,(a[1]+b[1])/2],
		ab_perp = r.x($V([a[0]-b[0],a[1]-b[1]])),
		pbab = Line.create(ab_mid, ab_perp);

	var ac_mid  = [(a[0]+c[0])/2,(a[1]+c[1])/2],
		ac_perp = r.x($V([a[0]-c[0],a[1]-c[1]])),
		pbac = Line.create(ac_mid, ac_perp);


	var center = pbab.intersectionWith(pbac).elements.slice(0,2);

	var radius = $V([a[0]-center[0], a[1]-center[1]]).modulus();

	return {
		center: center,
		radius: radius
	};
}