Item = function(game, x, y, sprite){
	Phaser.Sprite.call(this, game, x, y, sprite);
	this.gameProperties = {
		itemLevel: 0,
	};
};