import * as PIXI from "pixi.js";
import { width, height } from "./constant";

const delay = async (ms) =>
  await new Promise((resolve) => setTimeout(resolve, ms));

//логика кнопок лифта
class ButtonOnFloor {
  rendredButton: PIXI.Graphics[] = [];
  levelButton: object = {};
  maxFloor: number = 0;
  constructor() {}
  elevatorCall(floor: number) {
    this.levelButton[floor] = true;
  }
  elevatorOff(floor: number) {
    delete this.levelButton[floor];
  }
  maxFloorCounter() {
    this.maxFloor++;
  }
}
//логика работы лифта
class Elevator {
  elevatorMove = false;

  elevatorFloor: number;
  constructor(maxFloors: number) {
    this.elevatorFloor = maxFloors;
  }
  moveElevatorDown() {
    this.elevatorFloor--;
  }

  moveElevatorUp() {
    this.elevatorFloor++;
  }
}
//логика рендера
class GameRender {
  public pixiApp: PIXI.Application;
  public stage: PIXI.Graphics;
  private elevator: PIXI.Container;
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
  async moveOneFloorUp() {
    for (let y = 0; y < 105; y++)
      await delay(30).then(() => {
        this.elevator.y--;
      });
  }
  async moveOneFloorDown() {
    for (let y = 0; y < 105; y++)
      await delay(30).then(() => {
        this.elevator.y++;
      });
  }
  //Отрисовка этажей
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
  //Отрисовка этажей
  drawButon(x: number, y: number, stage: PIXI.Container, func: () => void) {
    const graphics = new PIXI.Graphics();
    let button = graphics
      .beginFill()
      .lineStyle(4, 0xca0020)
      .drawRect(x + 30, y + 60, 10, 10)
      .endFill();
    button.interactive = true;
    button.on("pointerover", () => {
      button.tint = 0x666666;
    });
    button.on("pointerout", () => {
      button.tint = 0xffffff;
    });
    button.on("pointerdown", () => {
      button.clear();
      button = graphics
        .beginFill()
        .lineStyle(4, 0x00ff00)
        .drawRect(x + 30, y + 60, 10, 10)
        .endFill();
    });
    button.addListener("click", func);
    stage.addChild(button);
    return button;
  }
}

//сборка всей логики
class App {
  gameRender = new GameRender();
  pixiApp: PIXI.Application;
  stage: PIXI.Container;
  elevator: PIXI.Container;
  buttons: ButtonOnFloor = new ButtonOnFloor();
  elevatorObj: Elevator;
  dir: boolean = false;
  floors: Array<string> = Object.keys(this.buttons.levelButton);

  //Логика движения вниз
  async elevatorMoveDown() {
    this.floors = Object.keys(this.buttons.levelButton);
    //починить этот кусок потом
    if (this.elevatorObj.elevatorFloor === 1) return;
    while (this.elevatorObj.elevatorFloor > 1) {
      console.log("down", this.elevatorObj.elevatorFloor);
      if (this.buttons.levelButton[this.elevatorObj.elevatorFloor]) {
        this.buttons.rendredButton[this.elevatorObj.elevatorFloor].clear();

        this.gameRender.drawButon(
          100,
          (this.buttons.maxFloor - this.elevatorObj.elevatorFloor + 1) * 105 +
            2,
          this.stage,
          () => this.btnFloorPressed(this.elevatorObj.elevatorFloor + 1)
        );
        await delay(500);
      }
      this.buttons.elevatorOff(this.elevatorObj.elevatorFloor);

      await this.gameRender.moveOneFloorDown();
      this.elevatorObj.moveElevatorDown();
    }
    this.dir = true;
  }

  //Логика движения вверх
  async elevatorMoveUp() {
    this.floors = Object.keys(this.buttons.levelButton);
    let maxFloor = Math.max.apply(null, this.floors);
    while (this.elevatorObj.elevatorFloor < maxFloor) {
      this.floors = Object.keys(this.buttons.levelButton);
      console.log("up", this.elevatorObj.elevatorFloor);

      await this.gameRender.moveOneFloorUp();
      this.elevatorObj.moveElevatorUp();
    }
    this.dir = false;
  }

  //Инициалиация лифта
  elevatorInit() {
    this.floors = Object.keys(this.buttons.levelButton);
    let maxFloor = Math.max.apply(null, this.floors);
    if (this.elevatorObj.elevatorFloor < maxFloor) {
      this.dir = true;
    } else this.dir = false;
  }

  async btnFloorPressed(floor: number) {
    this.buttons.elevatorCall(floor);

    if (!this.elevatorObj.elevatorMove) {
      // необходимо для выполнения логики только одного лифта
      this.elevatorObj.elevatorMove = true;

      console.log("init", "start");
      this.elevatorInit();
      while (this.floors.length !== 0) {
        // directionLogic();
        this.dir ? await this.elevatorMoveUp() : await this.elevatorMoveDown(); // выбор направления движения
      }
      this.elevatorObj.elevatorMove = false;
    }
  }
  //сборка всей логики лифта
  constructor() {
    this.pixiApp = this.gameRender.initPixiApp();
    this.stage = this.pixiApp.stage;
    this.gameRender.drawElevator(this.stage, 0, 110);
    let maxFloors = 5;
    for (let i = maxFloors; i > 0; i--) {
      let x = 100;
      let y = i * 105 + 2;
      let btnFunc: () => void = () => this.btnFloorPressed(maxFloors - i + 1);
      this.gameRender.drawLevels(x, y, this.stage);
      if (i === maxFloors) {
        this.gameRender.drawLevels(0, y + 105, this.stage);
      }
      this.buttons.rendredButton[maxFloors - i + 1] = this.gameRender.drawButon(
        x,
        y,
        this.stage,
        btnFunc
      );
      this.buttons.maxFloorCounter();
    }
    this.elevatorObj = new Elevator(this.buttons.maxFloor);
  }
}

export default new App();
