import 'phaser';
import * as assets from './assets';

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
    create: create,
    update: update
  }
};

const game: Phaser.Game = new Phaser.Game(config);
const worldRect = new Phaser.Geom.Rectangle(0, 0, 800, 450);

let fruits: Phaser.Physics.Arcade.Group;
let fruitHomePos = new Map<Phaser.Physics.Arcade.Sprite, [number, number]>();
let nextFruit: Phaser.Physics.Arcade.Sprite | null = null;
let fukidashi: Phaser.Physics.Arcade.Image | null = null;

let defaultLayer: Phaser.GameObjects.Layer | null = null;

let bonus: Phaser.Physics.Arcade.Sprite | null = null;
let bonusStage: boolean = false;

let allFruitsLabels: string[] = [];

function loadFruitImage(scene: Phaser.Scene, label: string, url: string) {
  scene.load.image(label, url);
  allFruitsLabels.push(label);
}

function preload(this: Phaser.Scene) {
  this.load.image('sky', assets.sky);

  this.load.image('boy', assets.boy);
  this.load.image('mogumogu', assets.mogumogu);
  this.load.image('hungry', assets.hungry);
  this.load.image('fukidashi', assets.fukidashi);

  this.load.image('bonus', assets.bonus);

  this.load.audio('bgm', assets.bgm);

  loadFruitImage(this, 'orange', assets.orange);
  loadFruitImage(this, 'apple', assets.apple);
  loadFruitImage(this, 'strawberry', assets.strawberry);
  // loadFruitImage(this, 'sumomo', assets.sumomo);
  loadFruitImage(this, 'younashi', assets.younashi);
  loadFruitImage(this, 'kiwi', assets.kiwi);
  loadFruitImage(this, 'banana', assets.banana);
  loadFruitImage(this, 'grape', assets.grape);
  loadFruitImage(this, 'kaki', assets.kaki);
  loadFruitImage(this, 'suika', assets.suika);

  loadFruitImage(this, 'nasu', assets.nasu);
  loadFruitImage(this, 'paprika', assets.paprika);
  loadFruitImage(this, 'piman', assets.piman);
  loadFruitImage(this, 'cabbege', assets.cabbege);
  loadFruitImage(this, 'kabocha', assets.kabocha);
  loadFruitImage(this, 'myouga', assets.myouga);
  loadFruitImage(this, 'tamanegi', assets.tamanegi);
}

function initializeFruits(scene: Phaser.Scene) {
  const assets = randomSelect(allFruitsLabels, 5);

  let fs = [];
  let x = 100;
  for (const asset of assets) {
    const fruit = scene.physics.add.sprite(x, 100, asset);
    fruitHomePos.set(fruit, [x, 100]);
    fruit.setName(asset);
    fruit.setInteractive({ draggable: true });
    fruit.on('drag', (p: any, x: number, y: number) => fruit.setPosition(x, y));
    fruit.on('drop', (p: any, boy: any) => { eatFruit(fruit, boy, scene); });
    fruit.on('dragend', (p: any) => { returnFruit(fruit, scene); });
    fruit.scale = 0;
    scene.tweens.add({
      targets: fruit,
      scale: 100 / fruit.width,
      duration: 250
    })
    fruit.setCircle(50);
    fs.push(fruit);
    x += 150;
  }

  fruits = scene.physics.add.group(fs);
}

function chooseWhatToEat(scene: Phaser.Scene) {

  function setNextFruit(nextFruitName: string) {
    if (nextFruit) {
      nextFruit.destroy();
    }
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
        fruits.clear(true, true);
        fruitHomePos = new Map<Phaser.Physics.Arcade.Sprite, [number, number]>();
        enterBonusStage(scene);
        return;
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

function randomSelect(list: string[], count: number) {
  const copy = [...list];
  let result: string[] = [];

  for (let i = 0; i < Math.min(count, list.length); ++i) {
    const j = Math.floor(Math.random() * copy.length);
    result.push(copy[j]);
    const lastItem = copy.pop();
    // copy.length is decremented by 1.
    if (j !== copy.length) {
      copy[j] = lastItem
    }
  }

  return result;
}

function enterBonusStage(scene: Phaser.Scene) {
  nextFruit.setVisible(false);
  fukidashi.setVisible(false);
  scene.tweens.add({
    targets: defaultLayer,
    alpha: 0.6,
    duration: 100
  });
  bonus = scene.physics.add.sprite(-70, 150, 'bonus');
  bonus.scale = 150 / bonus.width;
  bonus.setVelocity(75, 0);
  bonus.setInteractive();
  bonus.on('pointerdown', (p: any) => {
    const r = (Math.random() * 2 - 1) * Math.PI / 2;
    bonus.setVelocity(Math.cos(r) * 75, Math.sin(r) * 75);
  });
  bonusStage = true;
}

function exitBonusStage(scene: Phaser.Scene) {
  fukidashi.setVisible(true);
  scene.tweens.add({
    targets: defaultLayer,
    alpha: 1,
    duration: 100
  });
  bonusStage = false;
  defaultLayer.setAlpha(1.0);
  initializeFruits(scene);
  chooseWhatToEat(scene);
}

function create(this: Phaser.Scene) {
  const scene = this;
  scene.scale.scaleMode = Phaser.Scale.FIT;
  scene.scale.setParentSize(window.innerWidth, window.innerHeight);

  const sky = this.add.image(400, 300, 'sky');

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

  fukidashi = this.physics.add.image(260, 300, 'fukidashi');
  fukidashi.scale = 200 / fukidashi.width;

  defaultLayer = scene.add.layer([sky, boy, fukidashi]);

  initializeFruits(this);

  const bgm = this.sound.add('bgm', { loop: true });
  bgm.play();

  chooseWhatToEat(this);
}

function update(this: Phaser.Scene) {
  if (bonusStage && bonus !== null) {
    const bonusRect = bonus.getBounds();
    if (!Phaser.Geom.Rectangle.ContainsRect(worldRect, bonusRect)
        && Phaser.Geom.Intersects.GetRectangleToRectangle(bonusRect, worldRect).length == 0) {
      exitBonusStage(this);
    }
  }
}
