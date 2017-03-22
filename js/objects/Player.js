Player = function(game, x, y){
	Phaser.Sprite.call(this, game, x, y, 'player');
	this.equipped = {
		rightHand: {
			name: "broadsword", 
			type: "weapon", 
			damage: 3, 
			protection: 0, 
			attackRate: 1,
			block: 0,
		},
	};


	this.health = 20;
	this.dexterity = 10;
	this.strength = 10;
	this.vitality = 10;

	this.attackRate = 2;
	this.primalDamage = 1;
	this.protection = 1;
	this.weaponDamage = 0;
	this.block = 0;
	this.reach = 1;

	this.inventory = [];
	this.lastDirction = "";
	this.timeAttacked = 0;

	this.attacking = false;
	this.combatStyle = "single";
	this.groupCombatEnabled = false;

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

	
	this.events.onAnimationComplete.add(function(){			
		this.animations.stop(true, true);
	}, this);

	this.wasd = {
		up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
		down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
		left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
		right: this.game.input.keyboard.addKey(Phaser.Keyboard.D)
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
		if(this.groupCombatEnabled){
			this.engageGroupCombat(levelObjects.enemies);
		}
		if(game.input.activePointer.leftButton.isDown && !this.groupCombatEnabled){
			if(this.combatStyle === "single"){
				this.engageSingleCombat(levelObjects.enemies);
			}else if(this.combatStyle === "group"){
				this.groupCombatEnabled = true;
				this.engageGroupCombat(levelObjects.enemies);
			}
		}else if(game.input.activePointer.rightButton.isDown && !this.groupCombatEnabled){
			for(var i = 0; i < levelObjects.enemies.length; i++){
				var enemy = levelObjects.enemies[i];
				if(enemy.attacking){
					if(this.checkHitEnemy(enemy, game.input.activePointer.x+game.camera.x, game.input.activePointer.y+game.camera.y)){
						this.parry(enemy);
					}
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
					this.dealDamage(this, "primary");
				}
			}

			this.timeAttacked = game.time.now;
		}
	};
	
	this.engageGroupCombat = function(enemies){
		var enemiesInCombatArea = [];
		var nextAttacker = null;
		var waitingTime = 0;
		
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
							waitingTime = prevEnemyRecoveryTimeLeft;
						}
					}

				}
		}
		
		if(nextAttacker !== null){
			if(game.time.now - this.timeAttacked > (this.attackRate*1000) + waitingTime){
				//Try to parry the enemy attack
				console.log("parry: " + nextAttacker.id);

				this.parry(nextAttacker);
				
				this.timeAttacked = game.time.now;
			}
		}
	};
	
	this.parry = function(enemy){
		console.log("try parry");
		//TODO: calculate how the parry went.
		var parryResult = "good";

		switch(parryResult){
			case "fail":
				break;
			case "ok" :
				break;
			case "good":
				enemy.interrupted = true;
				enemy.tempCooldownTime = 3000;
				console.log("enemy" + enemy.id + " gets +" + enemy.tempCooldownTime + " extra cooldown.");
				enemy.takeDamage(this, "parry_good");
				break;
			case "perfect":
				break;
				
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

	this.dealDamage = function(enemy, attackType){
		var damageDealt = 0;
		var damageTaken = 0;
		if(attackType === "primary"){
			damageDealt = this.weaponDamage;
		}else if(attackType === "parry_good"){
			//TODO: Calculate the damage of parry.
			damageDealt = 3;
			//TODO: Markera fiende som parerad.
		}

		damageTaken = damageDealt - this.protection;

		enemy.takeDamage(damageTaken);
	}
};
