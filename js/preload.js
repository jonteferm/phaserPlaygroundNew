var TopDownGame = TopDownGame || {};

TopDownGame.Preload = function(){};

TopDownGame.Preload.prototype = {
	preload: function(){
		this.load.tilemap('dungeontest', 'assets/dungeontest/tilemaps/oryxtiles.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.image('gameTiles', 'assets/dungeontest/images/tiles.png');
		this.load.spritesheet('player', 'assets/dungeontest/images/playersprite.png', 48, 48);
		this.load.spritesheet('cultist', 'assets/dungeontest/images/cultist.png', 48, 48);
		this.load.spritesheet('maiden', 'assets/dungeontest/images/maiden.png', 48, 48);
		this.load.image('gate', 'assets/dungeontest/images/gate.png');
		this.load.image('gateopen', 'assets/dungeontest/images/gateopen.png');
		//this.load.image('goldenkey', 'assets/dungeontest/images/goldenkey.png');

		this.load.bitmapFont('font', 'assets/dungeontest/font_0.png', 'assets/dungeontest/font.xml');

	},

	create: function(){
		this.state.start('Game');
	}

}
