Enemy = function(game, x, y, type){
	Phaser.Sprite.call(this, game, x, y, type);
	
	this.id = 0;
	
	this.equipped = {
		chest: {name: "chainmail", type: "armor", damage: 0, protection: 1},
	};

	this.health = 10;
	this.primalDamage = 1;
	this.weaponDamage = 0;
	this.protection = 1;
	this.attackRate = 5;
	this.reach = 1;
	this.perception = 5;

	this.inventory = [];
	this.timeAttacked = 0;
	this.tempCooldownTime = 0;
	this.interrupted = false;
	this.attacking = false;

    this.animations.add('right', [0,1], 10, true);
	this.animations.add('left', [2,3], 10, true);

	this.events.onAnimationComplete.add(function(){			
		this.animations.stop(true, true);	
	}, this);

	this.countStats = function(){
		for (var property in this.equipped) {
			if (this.equipped.hasOwnProperty(property)) {
				var item = this.equipped[property];
				
				if(item.type === "weapon"){
					this.weaponDamage += item.damage;
				}else if(item.type === "primal"){
					this.primalDamage += item.damage;
				}
			  
		 	  	this.protection += item.protection;
		 	  	/*this.attackRate += item.attackRate;*/
			}
		}
	};

	this.checkSpotPlayer = function(playerX, playerY){
		if((this.x + this.perception*48 >= playerX || this.x - this.perception*48 >= playerX) && (this.y + this.perception*48 >= playerY || this.y - this.perception*48 >= playerY)){
			return true;
		}
	};

	this.makeMovement = function(playerX, playerY){
		if((this.y > playerY + 48 || this.y < playerY - 48) || (this.x > playerX + 48 || this.x < playerX - 48)){
			if(playerY > this.y){
				this.body.velocity.y = 80;
			}else if(playerY < this.y){
				this.body.velocity.y = -80;
			}

			if(playerX > this.x){
				this.body.velocity.x = 80;
				this.animations.play("right");
			}else if(playerX < this.x){
				this.body.velocity.x = -80;
				this.animations.play("left");
			}
		}
	};

	this.takeActions = function(levelObjects){
		if(this.checkSpotPlayer(levelObjects.player.x, levelObjects.player.y)){
			this.makeMovement(levelObjects.player.x, levelObjects.player.y);	
		}
		
		if(game.time.now - this.timeAttacked > (this.attackRate*1000) + this.tempCooldownTime){
			for(var i = 0; i < levelObjects.opponents.length; i++){
				var opponent = levelObjects.opponents[i];

				if(this.checkHitOpponent(opponent)){
					this.attacking = true;
				    var attText = game.add.text(this.x+10, this.y-25, "!", {
						font: "16px Arial",
    					fill: "#0000ff",
					});

					var attTextFadeOut = game.add.tween(attText).to({alpha: 0}, 1000, null, true);

					attTextFadeOut.onComplete.add(function(){
						attText.destroy();
							//todo: opponent.takeDamage
					});
  
					console.log("enemy " + this.id + " strikes player!");
					this.timeAttacked = game.time.now;

	  				game.time.events.add(Phaser.Timer.SECOND * 1, function(){
	  					if(this.interrupted){
							console.log("miss player");
	  					}else{
							console.log("hit player");
	  					}
	  		
	  					this.attacking = false;
					}, this);

					this.interrupted = false;
				}
			}
			
			this.tempCooldownTime = 0;
		}
	};

	this.checkHitOpponent = function(opponent){
		var totalReachRight = (this.x + 48) + this.reach*48;
		var totalReachLeft = this.x - this.reach*48;
		var totalReachUp = this.y - this.reach*48;
		var totalReachDown = (this.y + 48) + this.reach*48;

		if(
			((this.x <= opponent.x && totalReachRight >= opponent.x) || (this.x >= opponent.x && totalReachLeft <= opponent.x + 48))  && 
			((this.y >= opponent.y && totalReachUp <= (opponent.y + 48)) || (this.y <= opponent.y && totalReachDown >= (opponent.y)) )
		){
			return true;
		}

		return false;
	};

	this.takeDamage = function(damageTaken){
		if(damageTaken > 0){
			console.log("enemy" + this.id + " takes " + damageTaken + " damage.");
		}

		this.health -= damageTaken;

		if(damageTaken > 0){
			//todo: Spela blod-animation.
			
		    var dmgText = game.add.text(this.x, this.y-25, "-"+damageTaken, {
				font: "16px Arial",
    			fill: "#ff0000",
			});

			var dmgTextFadeOut = game.add.tween(dmgText).to({alpha: 0}, 1500, null, true);

			dmgTextFadeOut.onComplete.add(function(){
				dmgText.destroy();
			});
		}

		if(this.health < 1){
			this.kill();
		}
	};
};