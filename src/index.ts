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
  //Отсчет количества этажей
  maxFloorCounter() {
    this.maxFloor++;
  }
}
//логика работы лифта
class Elevator {
  elevatorMove = false;

  elevatorFloor: number = 1;
  constructor(maxFloors: number) {
    this.elevatorFloor = maxFloors;
  }
  moveElevatorDown() {
    this.elevatorFloor--;
  }
  elevatorMoveInvert(){
    this.elevatorMove = !this.elevatorMove
  }
  moveElevatorUp() {
    this.elevatorFloor++;
  }
}
//логика рендера
class GameRender {
  public pixiApp: PIXI.Application;
  public stage: PIXI.Graphics;
  private elevatorContainer: PIXI.Container;
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

    this.elevatorContainer = rect;
    stage.addChild(rect);
  }
  moveElevator(x: number, y: number) {
    this.elevatorContainer.x = x;
    this.elevatorContainer.y = y;
  }
  async moveOneFloorUp() {
    for (let y = 0; y < 105; y++)
      await delay(30).then(() => {
        this.elevatorContainer.y--;
      });
  }
  async moveOneFloorDown() {
    for (let y = 0; y < 105; y++)
      await delay(30).then(() => {
        this.elevatorContainer.y++;
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
  drawButon(
    x: number,
    y: number,
    stage: PIXI.Container,
    func: () => void,
    lvlButton?: number
  ) {
    const graphics = new PIXI.Graphics();
    let levelButton = lvlButton;
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
  gameRender:GameRender = new GameRender();
  pixiApp: PIXI.Application;
  stage: PIXI.Container;
  elevatorContainer: PIXI.Container;
  buttons: ButtonOnFloor = new ButtonOnFloor();
  elevator: Elevator;
  dir: boolean = false;
  floors: Array<string> = Object.keys(this.buttons.levelButton);

  //Логика движения вниз
  async elevatorMoveDown() {
    this.floors = Object.keys(this.buttons.levelButton);
    //проверка первого этажа
    if (
      this.elevator.elevatorFloor === 1 &&
      this.buttons.levelButton[this.elevator.elevatorFloor]
    ) {
      this.buttons.elevatorOff(this.elevator.elevatorFloor);

      let neededFloor = this.elevator.elevatorFloor;
      this.buttons.rendredButton[neededFloor].clear();

      this.gameRender.drawButon(
        100,
        (this.buttons.maxFloor - neededFloor + 1) * 105 + 2,
        this.stage,
        () => this.btnFloorPressed(neededFloor),
        neededFloor
      );
      await delay(1500);
      return;
    }
    //цикл движения лифта до первого этажа
    while (this.elevator.elevatorFloor > 1) {
      console.log("down", this.elevator.elevatorFloor);

      if (this.buttons.levelButton[this.elevator.elevatorFloor]) {
        let elevatorFloor = this.elevator.elevatorFloor;
        await delay(1500);
        this.buttons.rendredButton[elevatorFloor].clear();

        this.buttons.rendredButton[elevatorFloor] = this.gameRender.drawButon(
          100,
          (this.buttons.maxFloor - elevatorFloor + 1) * 105 + 2,
          this.stage,
          () => this.btnFloorPressed(elevatorFloor),
          elevatorFloor
        );
        
      }
      this.buttons.elevatorOff(this.elevator.elevatorFloor);

      await this.gameRender.moveOneFloorDown();
      this.elevator.moveElevatorDown();
    }
    this.dir = true;
  }

  //Логика движения вверх
  async elevatorMoveUp() {
    this.floors = Object.keys(this.buttons.levelButton);
    let maxFloor = Math.max.apply(null, this.floors);
    while (this.elevator.elevatorFloor < maxFloor) {
      this.floors = Object.keys(this.buttons.levelButton);
      console.log("up", this.elevator.elevatorFloor);

      await this.gameRender.moveOneFloorUp();
      this.elevator.moveElevatorUp();
      this.floors = Object.keys(this.buttons.levelButton);

      maxFloor = Math.max.apply(null, this.floors);
    }
    this.dir = false;
  }

  //Инициалиация лифта
  elevatorInit() {
    this.floors = Object.keys(this.buttons.levelButton);
    let maxFloor = Math.max.apply(null, this.floors);
    if (this.elevator.elevatorFloor < maxFloor) {
      this.dir = true;
    } else this.dir = false;
  }
  //нажатие на кнопку лифта запускает цикл движения только при первом нажатии
  async btnFloorPressed(floor: number) {
    this.buttons.elevatorCall(floor);
    if (!this.elevator.elevatorMove) {
      // необходимо для выполнения логики только одного лифта
      this.elevator.elevatorMoveInvert();

      console.log("init", "start");
      this.elevatorInit();
      while (this.floors.length !== 0) {
        // directionLogic();
        this.dir ? await this.elevatorMoveUp() : await this.elevatorMoveDown(); // выбор направления движения
      }
      this.elevator.elevatorMoveInvert()
      console.log("init", "end");
    }
  }
  //сборка всей логики лифта
  constructor() {
    this.pixiApp = this.gameRender.initPixiApp();
    this.stage = this.pixiApp.stage;
    this.gameRender.drawElevator(this.stage, 0, 110);
    let maxFloors = 5;
    for (let index = maxFloors; index > 0; index--) {
      let x = 100;
      let y = index * 105 + 2;
      let btnFunc: () => void = () => this.btnFloorPressed(maxFloors - index + 1);
      this.gameRender.drawLevels(x, y, this.stage);
      if (index === maxFloors) {
        this.gameRender.drawLevels(0, y + 105, this.stage);
      }
      this.buttons.rendredButton[maxFloors - index + 1] = this.gameRender.drawButon(
        x,
        y,
        this.stage,
        btnFunc
      );
      this.buttons.maxFloorCounter();
    }
    this.elevator = new Elevator(this.buttons.maxFloor);
  }
}

export default new App();
