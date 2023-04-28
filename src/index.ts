import 'phaser';
import { GameObjects } from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create
  }
};

const game: Phaser.Game = new Phaser.Game(config);
let fruits: Phaser.Physics.Arcade.Group;
let fruitHomePos = new Map<Phaser.Physics.Arcade.Sprite, [number, number]>();
let nextFruit: Phaser.Physics.Arcade.Sprite | null = null;

function preload(this: Phaser.Scene) {
  this.load.image('sky', 'assets/sky.png');

  this.load.image('orange', 'assets/fruit_orange.png');
  this.load.image('apple', 'assets/fruit_ringo.png');
  this.load.image('strawberry', 'assets/fruit_strawberry.png');
  this.load.image('sumomo', 'assets/fruit_sumomo.png');
  this.load.image('younashi', 'assets/fruit_younashi.png');
  this.load.image('kiwi', 'assets/fruit_kiwi_marugoto.png');

  this.load.image('boy', 'assets/stand1_front01_boy.png');
  this.load.image('mogumogu', 'assets/stand1_front01_boy_mogumogu.png');
  this.load.image('hungry', 'assets/stand1_front01_boy_hungry.png');
  this.load.image('fukidashi', 'assets/fukidashi.png');

  this.load.audio('bgm', 'assets/baby-hero.mp3');
}

function chooseWhatToEat(scene: Phaser.Scene) {

  function setNextFruit(nextFruitName: string) {
    nextFruit = scene.physics.add.sprite(250, 250, nextFruitName);
    nextFruit.name = nextFruitName;
    nextFruit.scale = 0;
    scene.tweens.add({
      targets: nextFruit,
      scale: 100 / nextFruit.width,
      duration: 250
    })
  }

  let activeFruits: string[] = [];
  fruits.children.iterate(fruit => {
    if (fruit.active) {
      activeFruits.push(fruit.name);
    }
    return true;
  });
  const nextFruitName = activeFruits[Math.floor(Math.random() * activeFruits.length)];

  if (nextFruit) {
    scene.tweens.add({
      targets: nextFruit,
      scale: 0,
      duration: 250,
      onComplete: () => {
        setNextFruit(nextFruitName);
      }
    })
  } else {
    setNextFruit(nextFruitName);
  }
}

function eatFruit(fruit: Phaser.Physics.Arcade.Sprite, boy: Phaser.Physics.Arcade.Sprite, scene: Phaser.Scene) {
  if (fruit.name != nextFruit!.name) {
    boy.anims.play('hungry');
    return;
  }
  boy.anims.play('mogumogu');
  fruit.disableBody();
  fruit.setInteractive({ draggable: false });
  scene.tweens.add({
    targets: fruit,
    scale: 0,
    duration: 500,
    onComplete: () => {
      fruit.disableBody(true, true);
      if (fruits.countActive(true) == 0) {
        let x = 100;
        fruits.children.iterate(fruit => {
          if (fruit instanceof Phaser.Physics.Arcade.Sprite) {
            fruit.enableBody(true, x, 100, true, true);
            fruitHomePos.set(fruit, [x, 100]);
            fruit.setInteractive({ draggable: true });
            scene.tweens.add({
              targets: fruit,
              scale: 100 / fruit.width,
              duration: 250
            });
            x += 150;
          }
          return true;
        })
      }
      chooseWhatToEat(scene);
    }
  });
}

function returnFruit(fruit: Phaser.Physics.Arcade.Sprite, scene: Phaser.Scene) {
  const [x, y] = fruitHomePos.get(fruit);
  if (scene.tweens.isTweening(fruit)) {
    return;
  }
  scene.tweens.add({
    targets: fruit,
    x: x, y: y,
    ease: Phaser.Math.Easing.Cubic.InOut,
    duration: 500
  });
}

function create(this: Phaser.Scene) {
  const scene = this;
  scene.scale.scaleMode = Phaser.Scale.FIT;
  scene.scale.setParentSize(window.innerWidth, window.innerHeight);
  this.add.image(400, 300, 'sky');

  const boy = this.physics.add.sprite(400, 350, 'boy');
  boy.setInteractive({ dropZone: true });
  boy.scale = 200 / boy.width;
  boy.setCircle(100);

  this.anims.create({
    key: "mogumogu",
    frames: [{ key: "mogumogu", duration: 1000 }, { key: "boy" }],
    repeat: 0
  });

  this.anims.create({
    key: "hungry",
    frames: [{ key: "hungry", duration: 1000 }, { key: "boy" }],
    repeat: 0
  });

  const fukidashi = this.physics.add.image(260, 300, 'fukidashi');
  fukidashi.scale = 200 / fukidashi.width;

  const assets = ['orange', 'apple', 'strawberry', 'younashi', 'kiwi'];

  let fs = [];
  let x = 100;
  for (const asset of assets) {
    const fruit = this.physics.add.sprite(x, 100, asset);
    fruitHomePos.set(fruit, [x, 100]);
    fruit.setName(asset);
    fruit.setInteractive({ draggable: true });
    fruit.on('drag', (p: any, x: number, y: number) => fruit.setPosition(x, y));
    fruit.on('drop', (p: any, boy: any) => { eatFruit(fruit, boy, scene); });
    fruit.on('dragend', (p: any) => { returnFruit(fruit, scene); });
    fruit.scale = 100 / fruit.width;
    fruit.setCircle(50);
    fs.push(fruit);
    x += 150;
  }

  fruits = this.physics.add.group(fs);

  const bgm = this.sound.add('bgm', { loop: true });
  bgm.play();

  chooseWhatToEat(this);
}
