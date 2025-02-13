// Helpers
const toRadians = (degrees) => degrees * Math.PI / 180;
//const toDegrees = (radians) => radians * 180 / Math.PI;

// .1 - .3 > -0.19999999999999998
// fixFloat(.1 - .3) > -0.2
//const fixFloat = (number, precision=Math.log10(1/Number.EPSILON)) => number ? parseFloat(number.toFixed(precision)) : 0;


// Utils
class Vector {
  constructor({x=0,y=0}={}) {
    this.x = x;
    this.y = y;
  }


  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Add(5)
  // Add(Vector)
  // Add({x, y})
  Add(factor) {
    const f = typeof factor === 'object'
      ? { x:0, y:0, ...factor}
      : {x:factor, y:factor}
    return new Vector({
      x: this.x + f.x,
      y: this.y + f.y,
    })
  }

  Minus(factor) {
    const f = typeof factor === 'object'
      ? { x:0, y:0, ...factor}
      : {x:factor, y:factor}
    return new Vector({
      x: this.x - f.x,
      y: this.y - f.y,
    })
  }

  // Multiply(5)
  // Multiply(Vector)
  // Multiply({x, y})
  Multiply(factor) {

    // @LATER: Use an helper in order to transform `factor`
    //  into a Vector of same Dimensions than this
    const f = typeof factor === 'object'
      ? { x:0, y:0, ...factor}
      : {x:factor, y:factor}

    return new Vector({
      x: this.x * f.x,
      y: this.y * f.y,
    })
  }

  Rotate(theta) {
    // https://en.wikipedia.org/wiki/Rotation_matrix#In_two_dimensions
    return new Vector({
      x: this.x * Math.cos(theta) - this.y * Math.sin(theta),
      y: this.x * Math.sin(theta) + this.y * Math.cos(theta),
    });
  }


  // Todo: Use scalar product

  Project(line) {
    let dotvalue = line.direction.x * (this.x - line.origin.x)
      + line.direction.y * (this.y - line.origin.y);
    return new Vector({
      x: line.origin.x + line.direction.x * dotvalue,
      y: line.origin.y + line.direction.y * dotvalue,
    })
  }
}

class Line {
  constructor({x=0,y=0, dx=0, dy=0}) {
    this.origin = new Vector({x,y});
    this.direction = new Vector({x:dx,y:dy});
  }
}
class Rect {
  constructor({
    x=0, y=0, w=10, h=10,
    // 0 is Horizontal to right (following OX) - Rotate clockwise
    theta=null, angle=0, // theta (rad) or angle (deg)
    rgb='0,0,0'
  }) {
    this.center = new Vector({x,y});
    this.size = new Vector({x:w,y:h});
    this.theta = theta || toRadians(angle);
    this.rgb = rgb;
  }

  getAxis() {
    const OX = new Vector({x:1, y:0});
    const OY = new Vector({x:0, y:1});
    const RX = OX.Rotate(this.theta);
    const RY = OY.Rotate(this.theta);
   
    return [
      new Line({...this.center, dx: RX.x, dy: RX.y}),
      new Line({...this.center, dx: RY.x, dy: RY.y}),
    ];
  }

  getCorners() {
    const axis = this.getAxis();
    const RX = axis[0].direction.Multiply(this.size.x/2);
    const RY = axis[1].direction.Multiply(this.size.y/2);
   
    return [
      this.center.Add(RX).Add(RY),
      this.center.Add(RX).Add(RY.Multiply(-1)),
      this.center.Add(RX.Multiply(-1)).Add(RY.Multiply(-1)),
      this.center.Add(RX.Multiply(-1)).Add(RY),
    ]
  }
}













const isRectCollide = (rectA, rectB) => {

  
  const rA = typeof rectA !== Rect ? new Rect(rectA) : rectA;
  const rB = typeof rectB !== Rect ? new Rect(rectB) : rectB;
  
  
  return isProjectionCollide({rect: rA, onRect: rB})
   && isProjectionCollide({rect: rB, onRect: rA});
};

const isProjectionCollide = ({rect, onRect}) => {
    // console.log(rect,onRect);
    
  const lines = onRect.getAxis();
  const corners = rect.getCorners();
  // console.log("coners");
  // console.log(corners);
  // console.log('end');
  
  
  

  let isCollide = true;

  lines.forEach((line, dimension) => {
    let futhers = {min:null, max:null};
    // Size of onRect half size on line direction
    const rectHalfSize = (dimension === 0 ? onRect.size.x : onRect.size.y) / 2;
    corners.forEach(corner => {
      const projected = corner.Project(line);
      const CP = projected.Minus(onRect.center);
      // Sign: Same directon of OnRect axis : true.
      const sign = (CP.x * line.direction.x) + (CP.y * line.direction.y) > 0;
      const signedDistance = CP.magnitude * (sign ? 1 : -1);

      if (!futhers.min || futhers.min.signedDistance > signedDistance) {
        futhers.min = {signedDistance, corner, projected};
      }
      if (!futhers.max || futhers.max.signedDistance < signedDistance) {
        futhers.max = {signedDistance, corner, projected};
      }
    });

    if (!((futhers.min.signedDistance < 0 && futhers.max.signedDistance > 0)
      || Math.abs(futhers.min.signedDistance) < rectHalfSize
      || Math.abs(futhers.max.signedDistance) < rectHalfSize)) {
        isCollide = false;
      }
  });
  // console.log(isCollide);
  
  return isCollide;
  
  
};

export {isRectCollide}