// Helpers
const toRadians = (degrees) => degrees * Math.PI / 180;
//const toDegrees = (radians) => radians * 180 / Math.PI;
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
        this.center.Add(RX.Multiply(-1)).Add(RY.Multiply(-1)),
        this.center.Add(RX).Add(RY.Multiply(-1)),
        this.center.Add(RX.Multiply(-1)).Add(RY),
        this.center.Add(RX).Add(RY),
        
      ]
    }
  }




 
  const getcornersfor = (slected) => {
    //console.log(slected);
    const rect= new Rect(slected)
    const corners = rect.getCorners();
    // console.log(slected);
    // console.log(corners);
    return corners;
    
    }

    const getrotatelocation =(loc,rot,center)=>{
      //console.log(loc)
      //console.log(rot);
      //console.log(center);
      var x2=center.x-(center.w/2)
      var y2=(center.y)- (center.h/2)
      console.log("staert:"+x2,y2);
      
      
      var theta=rot;
// console.log(loc.x);
//console.log(Math.cos(theta), Math.sin(theta));

return new Vector({
  x: center.x + ((center.w/2) * Math.cos(theta)) - ((center.h/2) * Math.sin(theta)),
  y: center.y + ((center.w/2) * Math.sin(theta)) + ((center.h/2) * Math.cos(theta)),
});
    }

export {getcornersfor,getrotatelocation}