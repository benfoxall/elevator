describe('circler', function(){
	it('works for a circle', function(){
		circler([0,1],[1,0],[-1,0])
			.should.eql({
				center:[0,0],
				radius:1
			})
	})

	it('works for a circle with a different centre', function(){
		circler([2,6],[3,5],[1,5])
			.should.eql({
				center:[2,5],
				radius:1
			})
	})

	it('works for a circle of a different radius', function(){
		circler([0,2],[2,0],[-2,0])
			.should.eql({
				center:[0,0],
				radius:2
			})
	})
})
