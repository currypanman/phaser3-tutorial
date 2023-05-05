import 'phaser';
import * as assets from './assets';

class Connect extends Phaser.Scene {
  graphics: Phaser.GameObjects.Graphics | null = null;
  path: Phaser.Curves.Path | null = null;
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
  }

  update() {
    this.path.draw(this.graphics);
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
  scene: Connect
};

const game: Phaser.Game = new Phaser.Game(config);
