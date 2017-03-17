var TopDownGame = TopDownGame || {};

TopDownGame.Boot = function(){};

TopDownGame.Boot.prototype = {
	preload: function(){

	},

	create: function(){
		this.game.stage.backgroundColor = '#333';
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVerically = true;

		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.state.start('Preload');	
	}

};