Player = function(game, x, y){
	Phaser.Sprite.call(this, game, x, y, 'player');
	this.equipped = {
		rightHand: {
			name: "broadsword", 
			type: "weapon", 
			damage: 4, 
			protection: 0, 
			attackRate: 1.6 ,
			block: 0,
		},
	};

	this.name = "Sigfried";
	
	this.health = 20;
	this.dexterity = 13;
	this.defense = 14;
	this.strength = 15; 

	/*Räknas ut*/
	this.primalDamage = 1; //TODO: Lägg till uträkning
	this.weaponDamage = 0;
	this.attackRate = 3;
	this.hit = 1;
	this.protection = 1;
	this.block = 1.2;
	this.reach = 2;
	/*---------*/
	
	this.inventory = [];
	this.lastDirction = "";
	this.timeAttacked = 0;
	this.timeBlocked = 0;
	
	this.hitCount = 0;

	this.attacking = false;
	
	this.groupCombatEnabled = false;
	
	this.waitingTime = 0;
	
	this.enemiesAttacked = [];

	this.animations.add('idleRight', [0], 5, true);
	this.animations.add('right', [0, 1, 2], 5);
	this.animations.add('hitRight', [0, 3, 4], 5, true);
	this.animations.add('idleLeft', [5], 5, true);
	this.animations.add('left', [5, 6, 7], 5);
	this.animations.add('hitLeft', [5, 8, 9], 5, true);
	this.animations.add('idleUp', [10], 5, true);
	this.animations.add('up', [10, 11, 12], 5);
	this.animations.add('idleDown', [13], 5, true);
	this.animations.add('down', [13, 14, 15], 5);
	this.animations.add('hitDown', [13, 16, 17], 5, true);

	this.reachCircle = this.game.add.graphics();
	this.reachCircle.beginFill(0x000000, 1);
	this.reachCircle.drawCircle(this.x+24, this.y+24, this.reach*48);
	this.reachCircle.alpha = 0.2;
	this.reachCircle.endFill();
	
	this.events.onAnimationComplete.add(function(self, animation){
		this.animations.stop(true, true);
		
		if(animation.name.includes("hit") && this.enemiesAttacked.length > 0){
			this.enemiesAttacked.pop().takeDamage(this, "primary");
		}
	}, this);
	

	this.wasd = {
		up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
		down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
		left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
		right: this.game.input.keyboard.addKey(Phaser.Keyboard.D)
	};
	
	this.combatKeys = {
		switchCombatStyle: this.game.input.keyboard.addKey(Phaser.Keyboard.Q)
	};
	
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
				this.attackRate -= item.attackRate;
			}
		}
	};

	this.checkActions = function(levelObjects){
		this.reachCircle.clear();
		this.reachCircle.beginFill(0x000000, 1);
		this.reachCircle.drawCircle(this.x+24, this.y+24, this.reach*48);
		this.reachCircle.alpha = 0.2;
		this.reachCircle.endFill();
		if(this.combatKeys.switchCombatStyle.isDown){
			this.groupCombatEnabled = !this.groupCombatEnabled;
			this.combatKeys.switchCombatStyle.isDown = false;
		}
		
		if(this.groupCombatEnabled){
			this.engageGroupCombat(levelObjects.enemies);
		}
		if(game.input.activePointer.leftButton.isDown && !this.groupCombatEnabled){
			this.engageSingleCombat(levelObjects.enemies);
		}else if(game.input.activePointer.rightButton.isDown){
			for(var i = 0; i < levelObjects.enemies.length; i++){
				var enemy = levelObjects.enemies[i];
				
				if(this.checkHitEnemy(enemy, game.input.activePointer.x+game.camera.x, game.input.activePointer.y+game.camera.y)){
					this.parryEnemy(enemy);
				}
			}
		}else if(this.wasd.up.isDown){
			this.body.velocity.y = -100;
			this.animations.play("up");
			this.lastDirection = "up";
		}else if(this.wasd.down.isDown){
			this.body.velocity.y = 100;
			this.animations.play("down");
			this.lastDirection = "down";
		}else if(this.wasd.left.isDown){
			this.body.velocity.x = -100;
			this.animations.play("left");
			this.lastDirection = "left";
		}else if(this.wasd.right.isDown){
			this.body.velocity.x = 100;
			this.animations.play("right");
			this.lastDirection = "right";
		}
	};
	
	this.engageSingleCombat = function(enemies){
		if(game.time.now - this.timeAttacked > this.attackRate*1000){
			if(this.lastDirection === "down"){
				this.animations.play("hitDown", 5, false);
			}else if(this.lastDirection === "left"){
				this.animations.play("hitLeft", 5, false);
			}else if(this.lastDirection === "right"){
				this.animations.play("hitRight", 5, false);
			}

			for(var i = 0; i < enemies.length; i++){
				var enemy = enemies[i];
				
				if(this.checkHitEnemy(enemy, game.input.activePointer.x+game.camera.x, game.input.activePointer.y+game.camera.y)){
					this.enemiesAttacked.push(enemy);
	
				}
			}

			this.timeAttacked = game.time.now;
		}
	};
	
	this.engageGroupCombat = function(enemies){
		var enemiesInCombatArea = [];
		var nextAttacker = null;
		
		//Find enemies within combat area
		for(var i = 0; i < enemies.length; i++){
			if(this.checkReach(enemies[i])){
				enemiesInCombatArea.push(enemies[i]);
			}
		}
		
		//Detect next enemy attack
		for(var i = 0; i < enemiesInCombatArea.length; i++){
			var enemy = enemiesInCombatArea[i];
				if(i === 0){
					nextAttacker = enemy;
				}else{
					if(enemy.timeAttacked > 0){
						var enemyRecoveryTimeLeft = ((enemy.attackRate*1000) + enemy.tempCooldownTime) - (game.time.now - enemy.timeAttacked);
						var prevEnemyRecoveryTimeLeft = ((nextAttacker.attackRate*1000) + nextAttacker.tempCooldownTime) - (game.time.now - nextAttacker.timeAttacked);
						
						if(enemyRecoveryTimeLeft < prevEnemyRecoveryTimeLeft){
							//TODO: Om samma - slumpa? Inom viss marginal och baserat på skill - slumpa?
							nextAttacker = enemy;
							this.waitingTime = prevEnemyRecoveryTimeLeft;
						}
					}

				}
		}
		
		if(nextAttacker !== null){
			//Try to parry the enemy attack
			console.log("parry: " + nextAttacker.id);
			
			this.parryEnemy(nextAttacker);

			this.timeAttacked = game.time.now; //TODO: Ska all parry räknas som attacked?
		}
	};
	
	this.parryEnemy = function(nextAttacker){
		//TODO: calculate how the parry went.
		
		if(game.time.now - this.timeBlocked > (this.attackRate*500)){
			var parryResult;
			
			var parryValue = 0;
			
			var parryForce = 0;
			var attackForce = 0;
			
			if(this.strength > this.dexterity){
				parryForce = this.strength/10 + this.defense/10 + (this.block*(Math.floor((Math.random() * 6) + 1)));
			}else{
				parryForce = this.dexterity/10 + this.defense/10 + (this.block*(Math.floor((Math.random() * 6) + 1)));
			}
			
			if(nextAttacker.strength > nextAttacker.dexterity){
				attackForce = nextAttacker.strength/10 - nextAttacker.attackRate/10 + (nextAttacker.hit*(Math.floor((Math.random() * 6) + 1)));
			}else{
				attackForce = nextAttacker.strength/10 - nextAttacker.attackRate/10 + (nextAttacker.hit*(Math.floor((Math.random() * 6) + 1)));
			}
			
			parryValue = parryForce - attackForce;
			
			console.log(parryValue);
			
			if(parryValue < 0){
				parryResult = "failed";
			}else if(parryValue >= 0 && parryValue < 3){
				parryResult = "ok";
			}else if(parryValue >= 3 && parryValue < 5){
				parryResult = "good";
			}else if(parryValue >= 5){
				parryResult = "perfect";
			}
			
			console.log(parryResult);
			
			switch(parryResult){
				case "failed" :
					break;
				case "ok" :
					nextAttacker.getBlocked(this, "unharmful");
					break;
				case "good":
					nextAttacker.takeDamage(this, "parry_good");
					nextAttacker.getBlocked(this, "threatening");
					break;
				case "perfect":
					nextAttacker.takeDamage(this, "parry_perfect");
					nextAttacker.getBlocked(this, "harmful");
					break;
			}

			this.timeBlocked = game.time.now;
		}
	
	};
	
	this.checkReach = function(object){
		var playerTotalReachRight = (this.x + 48) + this.reach*48;
		var playerTotalReachLeft = this.x - this.reach*48;
		var playerTotalReachUp = this.y - this.reach*48;
		var playerTotalReachDown = (this.y + 48) + this.reach*48;

		if(
				((this.x <= object.x && playerTotalReachRight >= object.x) || (this.x >= object.x && playerTotalReachLeft <= object.x + 48))  && 
				((this.y >= object.y && playerTotalReachUp <= (object.y + 48)) || (this.y <= object.y && playerTotalReachDown >= (object.y)) )
		){
			return true;
		}
		
		return false;
	};

	this.checkHitEnemy = function(enemy, mouseX, mouseY){
		if(this.checkReach(enemy)){
			if((mouseX >= enemy.x && mouseX < enemy.x + 48) && (mouseY >= enemy.y && mouseY < enemy.y + 48)){
				return true;
			}
		}

		return false;
	};
	

	this.takeDamage = function(attacker, attackType){
		var damageDealt = 0;
		var damageTaken = 0;

		if(attackType === "primary"){
			damageDealt = attacker.weaponDamage;
		}
		
		damageTaken = damageDealt - this.protection;
		
		this.health -= damageTaken;

		if(damageTaken > 0){
			//todo: Spela blod-animation.
		
		    var playerDmgText = game.add.text(this.x+(this.hitCount*5), this.y-(this.hitCount*5), "-"+damageTaken, {
				font: "16px Arial",
    			fill: "#ff0000",
			});
		    
			game.time.events.add(attacker.attackRate, function(){

				var playerDmgTextFadeOut = game.add.tween(playerDmgText).to({alpha: 0}, 1500, null, true);

				playerDmgTextFadeOut.onComplete.add(function(){
					playerDmgText.destroy();
				});
			}, this);
			
			this.hitCount++;
			if(this.hitCount === 3){
				this.hitCount = 0;
			}

		}

		if(this.health < 1){
			this.destroy();
		}
	};
};
