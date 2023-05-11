import 'phaser';
import * as assets from './assets';

class Connect extends Phaser.Scene {
  graphics: Phaser.GameObjects.Graphics | null = null;
  path: Phaser.Curves.Path | null = null;
  path2: Phaser.Curves.Path | null = null;
  allFruitsLabels: string[] = [];

  loadFruitImage(label: string, url: string) {
    this.load.image(label, url);
    this.allFruitsLabels.push(label);
  }

  preload() {
    this.loadFruitImage('apple', assets.apple);
  }

  create() {
    this.scale.scaleMode = Phaser.Scale.FIT;
    this.scale.setParentSize(window.innerWidth, window.innerHeight);

    this.graphics = this.add.graphics();
    this.path = new Phaser.Curves.Path(100, 100);

    const asset = 'apple';
    const fruit = this.physics.add.sprite(100, 100, asset);
    fruit.setName(asset);
    fruit.setInteractive({ draggable: true });
    fruit.on('drag', (p: any, x: number, y: number) => {
      fruit.setPosition(x, y);
      this.graphics.lineStyle(10, 0xff0000, 1.0);
      this.path.lineTo(x, y);
    });
    fruit.scale = 100 / fruit.width;
    fruit.setCircle(50);

    const r = 50;

    const texture = this.textures.createCanvas('appleHole', fruit.width + r * 2, fruit.height + r * 2);
    const temp = this.textures.createCanvas('temp', fruit.width, fruit.height);
    const apple = this.textures.get('apple');
    const sourceImage = apple.getSourceImage() as HTMLImageElement;
    temp.draw(0, 0, sourceImage, false);
    const data = temp.getData(0, 0, fruit.width, fruit.height);

    let i = 0;
    for (let y = 0; y < fruit.height; y++) {
      for (let x = 0; x < fruit.width; x++) {
        if (data.data[i + 3] != 0) {
          data.data[i] = 0;
          data.data[i + 1] = 0;
          data.data[i + 2] = 255;
          data.data[i + 3] = 255;
        } else {
          data.data[i + 3] = 0;
        }
        i += 4;
      }
    }
    temp.putData(data, 0, 0);
    temp.update();

    console.log('start');
    for (let y = 0; y < r * 2; y++) {
      for (let x = 0; x < r * 2; x++) {
        if ((x - r) * (x - r) + (y - r) * (y - r) <= r * r) {
          texture.draw(x, y, temp.getSourceImage() as HTMLCanvasElement, false);
        }
      }
    }
    console.log('end');
    texture.update();

    const hole = this.physics.add.image(250, 100, texture);
    hole.scale = fruit.scale;

    this.path2 = new Phaser.Curves.Path(400, 100);

    const fruit2 = this.physics.add.sprite(400, 100, asset);
    fruit2.setName(asset);
    fruit2.setInteractive({ draggable: true });
    fruit2.on('drag', (p: any, x: number, y: number) => {
      fruit2.setPosition(x, y);
      this.graphics.lineStyle(10, 0xff0000, 1.0);
      this.path2.lineTo(x, y);
    });
    fruit2.scale = 100 / fruit2.width;
    fruit2.setCircle(50);

  }

  update() {
    this.path.draw(this.graphics);
    this.path2.draw(this.graphics);
  }
}

const worldRect = new Phaser.Geom.Rectangle(0, 0, 800, 450);

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
  scene: Connect,
  backgroundColor: "#FFFFFF",
};

const game: Phaser.Game = new Phaser.Game(config);
