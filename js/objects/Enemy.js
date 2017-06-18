Enemy = function(game, x, y, type){
	Character.call(this, game, x, y, type);
	
	this.id = 0;
	
	this.equipped = {
		chest: {name: "chainmail", type: "armor", damage: 0, protection: 1},
	};

	this.health = 5;
	this.dexterity = 13;
	this.defense = 14;
	this.strength = 15; 
	
	/*Räknas ut*/
	this.primalDamage = 1;
	this.weaponDamage = 2;
	this.protection = 1;
	this.attackRate = 5;
	this.hit = 1;
	this.reach = 1;
	this.perception = 5;
	/*---------*/
	
	this.inventory = [];
	this.timeAttacked = 0;
	this.tempCooldownTime = 0;
	
	this.hitCount = 0;
	
	this.enemyAttacked;
	
	this.canBeBlocked = false;

    this.animations.add('right', [0,1], 10, true);
	this.animations.add('left', [2,3], 10, true);

	this.events.onAnimationComplete.add(function(self, animation){			
		this.animations.stop(true, true);
		
		if(animation.name.includes("hit") && this.enemyAttacked != undefined){
			this.enemyAttacked.takeDamage(this, "primary");
		}
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
		var reachOpponent = false;
		
		if(this.checkSpotPlayer(levelObjects.player.x, levelObjects.player.y)){
			this.makeMovement(levelObjects.player.x, levelObjects.player.y);	
		}
		
		for(var i = 0; i < levelObjects.opponents.length; i++){
			var opponent = levelObjects.opponents[i];

			reachOpponent = this.checkReachOpponent(opponent)
		}
		if(reachOpponent){
			if(game.time.now - this.timeAttacked > (this.attackRate*800) + this.tempCooldownTime){
				this.canBeBlocked = true;
					
				var attackWarning = game.add.text(this.x+(this.hitCount*5), this.y-(this.hitCount*5), "!", {
					font: "18px Arial",
					fill: "#66ffff",
				});
			    
				var attackWarningFadeOut = game.add.tween(attackWarning).to({alpha: 0}, 100, null, true);
		
				attackWarningFadeOut.onComplete.add(function(){
					this.canBeBlocked = false;
					attackWarning.destroy();
				});
			}
		
		
			if(game.time.now - this.timeAttacked > (this.attackRate*1000) + this.tempCooldownTime){
					this.timeAttacked = game.time.now;
					console.log("enemy " + this.id + " strikes player!");
					opponent.takeDamage(this, "primary");
				
					this.tempCooldownTime = 0;
			}
		}
	};

	this.checkReachOpponent = function(opponent){
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
			damageDealt = attacker.weaponDamage; //TODO: Inte riktigt va?
		}else if(attackType === "parry_good"){
			//TODO: Calculate the damage of parry.
			damageDealt = attacker.weaponDamage/2;
		}

		damageTaken = damageDealt - this.protection;

		this.health -= damageTaken;
		
	    var dmgText = game.add.text(this.x+(this.hitCount*5), this.y-(this.hitCount*5), "-"+damageTaken, {
			font: "16px Arial",
			fill: "#00ff66",
		});
	    
		game.time.events.add(attacker.attackRate, function(){
			var dmgTextFadeOut = game.add.tween(dmgText).to({alpha: 0}, 1500, null, true);

			dmgTextFadeOut.onComplete.add(function(){
				dmgText.destroy();
			});
		}, this);
		
		if(damageTaken > 0){
			//todo: Spela blod-animation.
			
			this.hitCount++;
			if(this.hitCount === 3){
				this.hitCount = 0;
			}

		}

		if(this.health < 1){
			this.destroy();
		}
	};
	
	this.getBlocked = function(attacker, blockType){
		if(this.canBeBlocked){
			if(blockType === "threatening"){
				this.tempCooldownTime = 3000;
			}
			
		    var blockedText = game.add.text(this.x, this.y-10, "B", {
				font: "16px Arial",
    			fill: "#0066ff",
			});
		    
			var blockedTextFadeOut = game.add.tween(blockedText).to({alpha: 0}, 800, null, true);

			//TODO: Kommer ligga i ett event som baseras på samma tid som blockerings-animationen
			blockedTextFadeOut.onComplete.add(function(){
				blockedText.destroy();
			});
		    
			this.timeAttacked = game.time.now;
		}
	}
};