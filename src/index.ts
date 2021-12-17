import * as PIXI from "pixi.js";
import { width, height } from "./constant";

class GameRender {
  public pixiApp: PIXI.Application;
  public stage: PIXI.Container;
  private elevator: PIXI.Container;
  private buttons: Button;
  constructor(buttons: Button) {
    this.pixiApp = this.initPixiApp();
    this.stage = this.pixiApp.stage;
    this.drawElevator(this.stage, 0, 5);
    this.buttons = buttons;
    for (let i = 0; i < 5; i++) {
      let x = 100;
      let y = i * 105 + 2;
      let btnFunc: () => void = () => this.buttons.elevatorCall(i);
      this.drawLevels(x, y, this.stage);
      this.drawButon(x, y, this.stage, btnFunc);
    }
  }
  private initPixiApp() {
    const pixiApp = new PIXI.Application({
      width,
      height,
      antialias: true
    });
    document.body.appendChild(pixiApp.view);
    return pixiApp;
  }
  private drawElevator(stage: PIXI.Container, x: number, y: number) {
    const graphics = new PIXI.Graphics();
    let rect = graphics.beginFill(0xaa33bb).drawRect(x, y, 100, 100).endFill();

    this.elevator = rect;
    stage.addChild(rect);
  }
  moveElevator(x: number, y: number) {
    this.elevator.x = x;
    this.elevator.y = y;
  }
  moveOneFloorUp() {
    this.elevator.y -= 105;
  }
  moveOneFloorDown() {
    this.elevator.y += 105;
  }
  drawLevels(x: number, y: number, stage: PIXI.Container) {
    const graphics = new PIXI.Graphics();
    let line = graphics
      .beginFill()
      .lineStyle(4, 0xc0b9c0)
      .moveTo(x, y)
      .lineTo(1000, y)
      .endFill();
    stage.addChild(line);
  }
  drawButon(x: number, y: number, stage: PIXI.Container, func: () => void) {
    const graphics = new PIXI.Graphics();
    let button = graphics
      .beginFill()
      .lineStyle(4, 0xca0020)
      .drawRect(x + 30, y + 60, 10, 10)
      .endFill();
    button.interactive = true;
    button.addListener("click", func);
    stage.addChild(button);
  }
}

class Button {
  levelButton = {};
  elevatorCall(floor: number) {
    this.levelButton[floor] = true;
    console.log(this.levelButton);
  }
  elevatorInvert(floor: number) {
    this.levelButton[floor] = false;
  }
}

class Elevator {
  private buttons = new Button();
  private render = new GameRender(this.buttons);
  elevatorMove = false;
  buttonOnFloors = this.buttons.levelButton;
  elevatorFloor: number = 0;
  constructor() {}
  moveElevatorDown() {
    this.elevatorFloor--;
    this.render.moveOneFloorDown();
    if (this.buttonOnFloors[this.elevatorFloor]) {
      this.buttons.elevatorInvert(this.elevatorFloor);
    }
  }

  moveElevatorUp() {
    this.elevatorFloor++;
    this.render.moveOneFloorUp();
    if (this.buttonOnFloors[this.elevatorFloor]) {
      this.buttons.elevatorInvert(this.elevatorFloor);
    }
  }
}

class App {
  elevator = new Elevator();
}

export default new App();
