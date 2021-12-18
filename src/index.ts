import * as PIXI from "pixi.js";
import { width, height } from "./constant";

class ButtonOnFloor {
  levelButton: object = {};
  private maxFloor: number = 0;
  elevatorCall(floor: number) {
    this.levelButton[floor] = true;
    console.log(this.levelButton);
  }
  elevatorInvert(floor: number) {
    this.levelButton[floor] = false;
  }
  maxFloorCounter() {
    this.maxFloor++;
  }
}

class Elevator {
  private buttons = new ButtonOnFloor();

  elevatorMove = false;
  buttonOnFloors: object;
  elevatorFloor: number = 0;
  constructor(buttons: ButtonOnFloor) {
    this.buttonOnFloors = buttons.levelButton;
  }
  moveElevatorDown() {
    this.elevatorFloor--;
    if (this.buttonOnFloors[this.elevatorFloor]) {
      this.buttons.elevatorInvert(this.elevatorFloor);
      delete this.buttonOnFloors[this.elevatorFloor];
    }
    console.log(this.elevatorFloor);
  }

  moveElevatorUp() {
    this.elevatorFloor++;
    if (this.buttonOnFloors[this.elevatorFloor]) {
      this.buttons.elevatorInvert(this.elevatorFloor);
      delete this.buttonOnFloors[this.elevatorFloor];
    }
    console.log(this.elevatorFloor);
  }
}

class GameRender {
  public pixiApp: PIXI.Application;
  public stage: PIXI.Container;
  private elevator: PIXI.Container;
  private buttons: ButtonOnFloor = new ButtonOnFloor();
  constructor() {}
  initPixiApp() {
    const pixiApp = new PIXI.Application({
      width,
      height,
      antialias: true
    });
    document.body.appendChild(pixiApp.view);
    return pixiApp;
  }
  drawElevator(stage: PIXI.Container, x: number, y: number) {
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

/*this.pixiApp = this.initPixiApp();
    this.stage = this.pixiApp.stage;
    this.drawElevator(this.stage, 0, 5);

    for (let i = 0; i < 5; i++) {
      let x = 100;
      let y = i * 105 + 2;
      let btnFunc: () => void = () => this.buttons.elevatorCall(i);
      this.drawLevels(x, y, this.stage);
      this.drawButon(x, y, this.stage, btnFunc);
    }
    
    */

class App {
  gameRender = new GameRender();
  pixiApp: PIXI.Application;
  stage: PIXI.Container;
  elevator: PIXI.Container;
  buttons: ButtonOnFloor = new ButtonOnFloor();
  elevatorObj = new Elevator(this.buttons);

  btnFloorPressed(floor: number) {
    let render = this.gameRender;
    let elevatorLogic = this.elevatorObj;
    let dir: boolean = true;
    this.buttons.elevatorCall(floor);
    let floors = Object.keys(elevatorLogic.buttonOnFloors);
    console.log(floors);
    function elevatorMoveUp() {
      elevatorLogic.moveElevatorUp();
      render.moveOneFloorDown();
    }
    function elevatorMoveDown() {
      elevatorLogic.moveElevatorDown();
      render.moveOneFloorUp();
    }
    if (!this.elevatorObj.elevatorMove) {
      this.elevatorObj.elevatorMove = true;

      while (floors.length !== 0) {
        console.log("init");
        floors = Object.keys(elevatorLogic.buttonOnFloors);
        dir ? elevatorMoveUp() : elevatorMoveDown();

        if (elevatorLogic.elevatorFloor === 0) {
          dir = true;
        } else if (elevatorLogic.elevatorFloor === 5) {
          dir = false;
        }
        floors = Object.keys(elevatorLogic.buttonOnFloors);
      }
      this.elevatorObj.elevatorMove = false;
    }
  }

  constructor() {
    this.pixiApp = this.gameRender.initPixiApp();
    this.stage = this.pixiApp.stage;
    this.gameRender.drawElevator(this.stage, 0, 5);

    for (let i = 0; i < 5; i++) {
      let x = 100;
      let y = i * 105 + 2;
      let btnFunc: () => void = () => this.btnFloorPressed(i);
      this.gameRender.drawLevels(x, y, this.stage);
      this.gameRender.drawButon(x, y, this.stage, btnFunc);
    }
  }
}

export default new App();
