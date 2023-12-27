class Player{
  constructor(game){
    this.game = game;
    this.width = 140;
    this.height = 120;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 5;
    this.lives = 3;
    this.maxLives =10;
    this.image = document.getElementById('player');
    this.jetsImage = document.getElementById('player_jets');
    this.frameX =0;
    this.jetsFrame =1;
  }
  draw(context){
    
 if (this.game.keys.indexOf(' ') > -1){
   this.frameX =1;
 }else{
   this.frameX =0;
 }
    context.drawImage(this.image,this.frameX * this.width,0,this.width,this.height,this.x,this.y,this.width,this.height);
    
     context.drawImage(this.jetsImage,this.jetsFrame * this.width,0,this.width,this.height,this.x,this.y,this.width,this.height);
    
  }
  update(){
    // this is how the player moves
    if (this.game.keys.indexOf("ArrowLeft") > -1){
      this.x -= this.speed;
      this.jetsFrame = 0;
    }else if (this.game.keys.indexOf("ArrowRight") > -1){
      this.x += this.speed;
      this.jetsFrame = 2; 
    }else{
      this.jetsFrame =1;
    }
  
  // This is the boundaries for the player
    if (this.x < -this.width * 0.5) {
      this. x = - this.width * 0.5;
    }else if(this.x > this.game.width -this.width *0.5 ){
      this.x = this.game.width - this.width *0.5;
    }
  }
  shoot(){
    const projectile = this.game.getProjectile();
    if (projectile) { // checks if a projectile was passed(any are free)
      projectile.start(this.x + this.width *.5,this.y); // pass player position
    }
  }
  restart(){
    this.x = this.game.width * 0.5 - this.width *0.5;
    this.y = this.game.height -this.height;
    this.lives = 3;
  }
}

// here we handle the projectiles (uses an object pool implementation)
class Projectile{
  constructor(){
    this.width = 3;
    this.height = 40;
    this.x =0;
    this.y = 0;
    this.speed = 20;
    this.isFree = true; // keeps track  of object in use 
  }
  draw(context){
    if (!this.isFree){ // draws projectile when taken from the ppol
      context.save();
      context.fillStyle ='gold';
      context.fillRect(this.x,this.y,this.width, this.height);
      context.restore()
;      
      
    }
  }
  update(){ // animates the projectile when taken from the ppol
    if(!this.isFree){
      this.y -= this.speed;
      if (this.y < 0 - this.height){
        this.reset();
      }
    }
  }
// object is removed from the pool
  start(x,y){
    this.x =x - this.width * .5; //will take the origianl postion of the player
    this.y = y;
    this.isFree = false;
  }
  // return a object tot he pool
  reset(){
    this.isFree = true;
  }

}

// make and animiate enemy
class Enemy{
  constructor(game,posX,posY){
    this.game = game;
    this.width = this.game.enemySize;
    this.height = this.game.enemySize;
    this.x = 0;
    this.y = 0;
    this.posX = posX;
    this.posY = posY;
    this.willDelete = false;
  }
  draw(context){
    //context.strokeRect(this.x,this.y, this.width, this.height);
    context.drawImage(this.image,this.frameX * this.width,this.frameY *this.height,80,80,this.x,this.y,this.width,this.height);

  }
  update(x,y){
    this.x = x + this.posX;
    this.y = y + this.posY;
    
    // check if there is a collision with projectiles
    this.game.projectilesPool.forEach(projectile =>{
      if (!projectile.isFree && this.game.checkCollision(this, projectile)){
        this.hit(1);
        projectile.reset();
      }
    });
    if(this.lives < 1){
       this.willDelete = true;
       if (!this.gameOver){
          this.game.score += 1;
        }
    }
    // check if there is a collision with player
     if (this.game.checkCollision(this, this.game.player)){
      this.willDelete = true;
      if(!this.game.gameOver  && this.game.score  > 0){
        this.game.score --;
      }
      this.game.player.lives --;
      if (this.game.player.lives < 1){
        this.game.gameOver =true;
      }
    }
    
 
    // lose condition
    if (this.y + this.height > this.game.height){
      this.game.gameOver = true;
      this.willDelete = true;
    }
}
  hit(damage){
    this.lives -= damage; 
   
    
}
  
}

class FullStackEnemies extends Enemy{
  constructor(game,posX,posY){
    super(game,posX,posY);
    this.image = document.getElementById("fsEnemy");
    this.frameX = Math.floor(Math.random()* 3);
    this.frameY = 0;
    this.lives =1;
    this.maxLives = this.lives;
  }
  
}
class Boss{
  constructor(game,bossLives){
    this.game = game;
    this.width = 200;
    this.height = 200;
    this.x = this.game.width *0.5 - this.width * 0.5;
    this.y = -this.height;
    this.speedX = Math.random() < 0.5 ? -1 : 1;
    this.speedY =0;
    this.lives = bossLives;
    this.maxLives = this .lives;
    this.willDelete = false;
    this.image = document.getElementById('fsBoss');
    this.frameX = Math.floor(Math.random() * 4);
    this.frameY = 0;
    
  }
  draw(context){
    context.drawImage(this.image,this.frameX * this.width, this.frameY *this.height, this.width, this.height, this.x, this.y, this.width, this.height);
    if (this.lives > 0){
      context.save();
      context.textAlign = 'center';
      context.shadowOffsetX =3;
      context.shadowOffsetY =3;
      context.shadowColor = 'black';
      context.fillText(this.lives, this.x + this.width * 0.5 ,this.y + 50);
      context.restore()
    }
  
    
  }
  update(){
    this.speedY =0;
    if(this.y <0){
      this.y += 4;
    } 
    if(this.x <0 || this.x > this.game.width - this.width){
      this.speedX *= -1;
      this.speedY = this.height * 0.5;
    }
    this.x += this.speedX;   
    this.y += this.speedY;
    
    //collision with projectiles
    this.game.projectilesPool.forEach(projectile =>{
      if(this.game.checkCollision(this,projectile) && !projectile.isFree && this.lives > 0 && this.y >= 0){
        this.hit(1);
        projectile.reset();
      }
    })
    //collision with player
    if(this.game.checkCollision(this,this.game.player) && this.lives >0){
      this.game.gameOver = true;
    }
    
    //boos is destroyed
    if(this.lives < 1){
      this.willDelete = true;
      this.game.score +=  this.maxLives;
      this.game.bossLives += 10;
      if(!this.game.gameOver){
        this.game.newWave();
      }
    }
        // lose condition off screen
    if (this.y + this.height > this.game.height){
      this.game.gameOver = true;
    }
}

  
  
  hit(damage){
    this.lives -= damage;
  }

}

 //this  wrapper class handels the movement mechanic of a goup of enemies
class Wave {
  constructor(game){
    this.game = game;
    this.width = this.game.columns * this.game.enemySize;
    this.height = this.game.rows * this.game.enemySize;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = -this.height;
    this.speedX = Math.random() <0.5 ? -1 : 1; // wave goes left or right
    this.speedY = 0;
    this.enemies = [];
    this.nextWavemake = false;
    this.willDelete = false;
    this.create();
  }
  render(context){
      if (this.y<0){
        this.y += 5;
      }
      this.speedY = 0;
      if (this.x < 0 || this.x > this.game.width - this.width){
        this.speedX *= -1;
        this.speedY = this.game.enemySize;
      }
      this.x += this.speedX;
      this.y += this.speedY;
         
      this.enemies.forEach(enemy => {
        
        enemy.update(this.x, this.y);
        enemy.draw(context);
      })
    this.enemies = this.enemies.filter(object => !object.willDelete);
    if (this.enemies.length <= 0){
      this.willDelete = true;
    }
    
  }
  create(){
    for (let y = 0; y < this.game.rows; y++){
        for(let x = 0; x < this.game.columns; x++){
          let enemyX = x * this.game.enemySize;
          let enemyY = y  * this.game.enemySize;
          this.enemies.push(new FullStackEnemies(this.game, enemyX, enemyY));
          
        }
    }
  }
  
}
  



// main logic
class Game{
  constructor(canvas){
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.keys =[];
    this.player = new Player(this); 
    
    // projectils pool intialization
    this.fired = false;
    this.projectilesPool =[];
    this.numProjectiles = 12;
    this.createProjectiles();
    
    this.columns = 2;
    this.rows = 2;
    this.enemySize = 80;
    
    this.waves =[];
   // this.waves.push(new Wave(this));
    
    this.waveNumber = 1;
    
    this.score = 0;
    this.gameOver = false;
    this.bossArray =[];
    this.bossLives = 10;
    this.restart();
    
    
    // eventListeners in constructor for key controls
    window.addEventListener('keydown',e=> {
          if (e.key ===' ' &&!this.fired){
        this.player.shoot();
      }
      this.fired = true; // stop the possiblity of holding to spam projectiles
      if (this.keys.indexOf(e.key) === -1){
        this.keys.push(e.key);  
      }
  
      if (e.key === 'Enter' && this.gameOver){
        this.restart();
      }
    });
    window.addEventListener('keyup',e=> {
      this.fired = false;
      const index = this.keys.indexOf(e.key);
      if(index > -1){
        this.keys.splice(index,1);
      } 
    });

  }
  render(context){
    this.drawStatusText(context);
     this.projectilesPool.forEach(projectile =>{
      projectile.update();
      projectile.draw(context);
    })
    this.bossArray.forEach(boss =>{
      boss.draw(context);
      boss.update();
    })
    this.bossArray = this.bossArray.filter(object => !object.willDelete);
    this.player.draw(context);
    this.player.update();
   
    this.waves.forEach(wave =>{
      wave.render(context);
      if(wave.enemies.length < 1 && !wave.nextWaveMake && !this.gameOver){
        this.newWave();
        wave.nextWaveMake = true;
      
      }
    })
  }
  // creating the pool of objects
  createProjectiles(){
    for (let i =0; i < this.numProjectiles; i++){
      this.projectilesPool.push(new Projectile());
    }
  }

  //get a projectile that is free from the pool
  getProjectile(){
    for (let i =0; i < this.projectilesPool.length; i++){
      if (this.projectilesPool[i].isFree){
        return this.projectilesPool[i];
      }

    }
  }
  
  checkCollision(a,b){
       return(
       a.x< b.x + b.width &&
       a.x + a.width > b.x &&
       a.y < b.y + b.height &&
       a.y + a.height > b.y 
        )
     // collision occured then return true if not returns false 
    }
  
  drawStatusText(context){
    context.save(); // for visual imporvements
    context.shawowOffsetX =2;
    context.shadowOffsetY = 2;
    context.shadowColor = "black";
    context.fillText('Score: ' + this.score ,20, 40);
    context.fillText('Wave #: ' + this.waveNumber ,20, 80);
    
    context.save()
    context.fillStyle ='green';
    context.strokeStyle ='green';
     for (let i =0; i < this.player.maxLives; i++){
      context.strokeRect(20+20* i,100,10,15);
    }
    for (let i =0; i < this.player.lives; i++){
      context.fillRect(20+20* i,100,10,15);
    }
    context.restore()
    if (this.gameOver){
      context.textAlign = "center";
      context.font = "100px Impact";
      context.fillText('Game Over!', this.width * 0.5, this.height * 0.5);
        context.font = "20px Impact";
      context.fillText('Press Enter to restart', this.width * 0.5, this.height * 0.5 + 30);
    }
    context.restore();
  }
  
  
  newWave(){
    this.waveNumber ++;
      if(this.player.lives < this.player.maxLives){
           this.player.lives ++ ;
        } 
    if (this.waveNumber % 3 ===0){
      this.bossArray.push(new Boss(this,this.bossLives));
    }else {
         if(Math.random() < 0.5 && this.columns * this.enemySize < this.width * 0.8){
        this.columns ++;
      }else if (this.rows * this.enemySize < this.height * 0.6){
      this.rows++;
      }
      this.waves.push(new Wave(this)); 
      this.waves = this.waves.filter(object => !object.willDelete);
    }
   
  }
  restart(){
    this.player.restart();
    this.projectilesPool =[];
    this.numProjectiles = 10;
    this.createProjectiles();
    
    this.columns = 2;
    this.rows = 2;
    
    this.waves =[];
    this.bossArray =[];
    this.bossLives = 10;
    this.waves.push(new Wave(this));
    
    //uncomment to push a boss first
    //this.bossArray.push(new Boss(this,this.bossLives));
    this.waveNumber = 1;
    
    this.score = 0;
    this.gameOver = false;
    
  }
}

window.addEventListener('load',function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 750; 
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.font = '30px Impact';
  
  const game = new Game(canvas);
  

  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height); /// clears the traile
    game.render(ctx);
    window.requestAnimationFrame(animate); // recursive loop to see animation 
    
  }
  animate();
   

})