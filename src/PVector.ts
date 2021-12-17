interface Vector {
  x: number;
  y: number;
}

export interface IPVector extends Vector {
  add(v: Vector): void;
  sub(v: Vector): void;
  mult(n: number): void;
  div(n: number): void;
  mag(): number;
  normalize(): void;
  limit(n: number): void;
}

class PVector implements IPVector {
  public x;
  public y;
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
  static add(v1: IPVector, v2: IPVector): PVector {
    return new PVector(v1.x + v2.x, v1.y + v2.y);
  }
  public add(v: Vector): void {
    this.x = this.x + v.x;
    this.y = this.y + v.y;
  }
  static sub(v1: IPVector, v2: IPVector): PVector {
    return new PVector(v1.x - v2.x, v1.y - v2.y);
  }
  public sub(v: Vector): void {
    this.x = this.x - v.x;
    this.y = this.y - v.y;
  }
  static mult(v: IPVector, n: number): PVector {
    return new PVector(v.x * n, v.y * n);
  }
  public mult(n: number): void {
    this.x = this.x * n;
    this.y = this.y * n;
  }
  static div(v: IPVector, n: number): PVector {
    return new PVector(v.x / n, v.y / n);
  }
  public div(n: number): void {
    this.x = this.x / n;
    this.y = this.y / n;
  }
  /**
   * The length of Vector.
   */
  public mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  /**
   * Normalize the Vector.
   */
  public normalize(): void {
    const mag = this.mag();
    if (mag !== 0) {
      this.div(mag);
    }
  }
  public limit(n: number) {
    const mag = this.mag();
    if (mag > n) {
      this.normalize();
      this.mult(n);
    }
  }
}

export default PVector;
