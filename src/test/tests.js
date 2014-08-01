describe('circler', function(){
	it('works for a basic circle', function(){
		var c = circler([0,1],[1,0],[-1,0])

		c.center.should.eql([0,0])
		c.radius.should.eql(1)
	})
})

function assert(expected){
	if(expected){
		throw new Error("assert failed")
	}
}