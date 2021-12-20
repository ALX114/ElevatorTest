import * as PIXI from "pixi.js";
import { width, height } from "./constant";

const delay = async (ms) =>
  await new Promise((resolve) => setTimeout(resolve, ms));

//логика кнопок на этаже
class ButtonOnFloor {
  rendredButton: PIXI.Container[] = [];
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
  public stage: PIXI.Container;
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

  async btnFloorPressed(floor: number) {
    let buttonLogic = this.buttons;
    let render = this.gameRender;
    let elevatorLogic = this.elevatorObj;
    let dir: boolean = false;

    this.buttons.elevatorCall(floor);

    let floors: Array<string> = Object.keys(this.buttons.levelButton);
    //Логика движения вниз
    async function elevatorMoveDown() {
      floors = Object.keys(buttonLogic.levelButton);

      while (elevatorLogic.elevatorFloor > 1) {
        console.log("down", elevatorLogic.elevatorFloor);
        if (buttonLogic.levelButton[elevatorLogic.elevatorFloor])
          await delay(500);
        buttonLogic.elevatorOff(elevatorLogic.elevatorFloor);

        await render.moveOneFloorDown();
        elevatorLogic.moveElevatorDown();
      }
      dir = true;
    }
    //Логика движения вверх
    async function elevatorMoveUp() {
      floors = Object.keys(buttonLogic.levelButton);
      let maxFloor = Math.max.apply(null, floors);
      while (elevatorLogic.elevatorFloor < maxFloor) {
        floors = Object.keys(buttonLogic.levelButton);
        console.log("up", elevatorLogic.elevatorFloor);

        await render.moveOneFloorUp();
        elevatorLogic.moveElevatorUp();
      }
      dir = false;
    }
    //Инициалиация лифта
    function elevatorInit() {
      floors = Object.keys(buttonLogic.levelButton);
      let maxFloor = Math.max.apply(null, floors);
      console.log(maxFloor, elevatorLogic.elevatorFloor);
      if (elevatorLogic.elevatorFloor < maxFloor) {
        dir = true;
      } else dir = false;
    }
    function directionLogic() {
      if (elevatorLogic.elevatorFloor > buttonLogic.maxFloor) {
        dir = true;
      }
      if (elevatorLogic.elevatorFloor < 1) {
        dir = false;
      }
    }

    console.log("elevFloors", this.buttons.levelButton);
    if (!this.elevatorObj.elevatorMove) {
      // необходимо для выполнения логики только одного лифта
      this.elevatorObj.elevatorMove = true;

      console.log("init", "start");
      elevatorInit();
      while (floors.length !== 0) {
        directionLogic();
        dir ? await elevatorMoveUp() : await elevatorMoveDown(); // выбор направления движения
      }
      this.elevatorObj.elevatorMove = false;
      console.log("init", "stop");
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
    console.log("max", this.buttons.maxFloor);
    this.elevatorObj = new Elevator(this.buttons.maxFloor);
  }
}

export default new App();
