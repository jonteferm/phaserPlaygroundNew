NPC = function(game, x, y, type){
	Phaser.Sprite.call(this, game, x, y, type);
	
	this.id = 0;
	
	this.equipped = {
		
	};

	this.health = 1;
	this.primalDamage = 1;
	this.weaponDamage = 0;
	this.protection = 1;
	this.attackRate = 5;
	this.reach = 1;
	this.perception = 5;

	this.inventory = [];
	this.timeAttacked = 0;
	this.tempCooldownTime = 0;

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

	this.takeDamage = function(attacker, attackType){
		var damageDealt = 0;
		var damageTaken = 0;

		if(attackType === "primary"){
			damageDealt = attacker.weaponDamage;
		}else if(attackType === "parry_good"){
			//TODO: Calculate the damage of parry.
			damageDealt = 3;
			this.tempCooldownTime = 3000;
			
			//TODO: Markera fiende som parerad.
		}

		damageTaken = damageDealt - this.protection;

		if(damageTaken > 0){
			console.log("enemy" + this.id + " takes " + damageTaken + " damage.");
		}
		
		if(this.tempCooldownTime > 0){
			console.log("enemy" + this.id + " gets +" + this.tempCooldownTime + " extra cooldown.");
		}


		this.health -= damageTaken;

		if(damageTaken > 0){
			//todo: Spela blod-animation.
			game.time.events.add(1000*attacker.attackRate, function(){
			    var dmgText = game.add.text(this.x, this.y-25, "-"+damageTaken, {
					font: "16px Arial",
	    			fill: "#ff0000",
				});

				var dmgTextFadeOut = game.add.tween(dmgText).to({alpha: 0}, 1500, null, true);

				dmgTextFadeOut.onComplete.add(function(){
					dmgText.destroy();
				});
			}, this);
		}

		if(this.health < 1){
			this.kill();
		}
	};
};