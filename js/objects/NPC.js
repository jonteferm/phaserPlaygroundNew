NPC = function(game, x, y, type){
	Phaser.Sprite.call(this, game, x, y, type);
	
	this.id = 0;
	
	this.name = "Lola";

	this.inventory = [];
	
	this.conversations = [{
		id: 1,
		ended: false,
		linesSpoken: 0,
		lines: [{
			spoken: false,
			line: 'Hi, my name is Lola.\nWhat are you doing out here in the wilderness?',
		},
		{
			spoken: false,
			line: ''
		}]
	}];

	this.events.onAnimationComplete.add(function(){			
		this.animations.stop(true, true);	
	}, this);


	this.takeActions = function(levelObjects){

	};

	this.chat = function(speaksWith){
		
		for(var i = 0; i < this.conversations[0].lines.length; i++){
			/*TODO: om speaksWith inom räckhåll
			 * Annars pausa eller nollställ
			 */
			
			if(!this.conversations[0].lines[i].spoken){
				this.conversations[0].lines[i].spoken = true;
				this.conversations[0].linesSpoken++;
				if(this.conversations[0].linesSpoken === this.conversations[0].lines.length){
					this.conversations[0].ended = true;
				}


				return this.conversations[0].lines[i].line;
			}
		}
		
	}
};