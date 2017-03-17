Door = function(game, x, y, spriteClosed, spriteOpen){
	Phaser.Sprite.call(this, game, x, y, spriteClosed);

	this.locked = false;
	this.key	= {};

	this.open = function(){
		this.locked = false;
		this.loadTexture(spriteOpen);
	}

	this.close = function(){
		this.locked = true;
		this.loadTexture(spriteClosed);
	}

};