import {min} from "d3-array";
import {arc, pie} from "d3-shape";

import {accessor, assign, constant, elem} from "d3plus-common";
import {Path} from "d3plus-shape";
import {Viz} from "d3plus-viz";

/**
    @class Pie
    @extends Viz
    @desc Uses the [d3 pie layout](https://github.com/d3/d3-shape#pies) to creates SVG arcs based on an array of data.
*/
export default class Pie extends Viz {

  /**
      @memberof Pie
      @desc Invoked when creating a new class instance, and sets any default parameters.
      @private
  */
  constructor() {

    super();

    this._shapeConfig = assign({}, this._shapeConfig, {
      Path: {
        id: d => this._ids(d).join("-"),
        x: 0,
        y: 0
      }
    });
    this._innerRadius = 0;
    this._padPixel = 0;
    this._pie = pie();
    this._sort = (a, b) => b.value - a.value;
    this._value = accessor("value");

  }

  /**
      Extends the render behavior of the abstract Viz class.
      @private
  */
  render(callback) {

    super.render(callback);

    const height = this._height - this._margin.top - this._margin.bottom,
          width = this._width - this._margin.left - this._margin.right;

    const outerRadius = min([width, height]) / 2;

    const pieData = this._pie
      .padAngle(this._padAngle || this._padPixel / outerRadius)
      .sort(this._sort)
      .value(this._value)
      (this._filteredData);

    pieData.forEach((d, i) => {
      d.__d3plus__ = true;
      d.i = i;
    });

    const arcData = arc()
      .innerRadius(this._innerRadius)
      .outerRadius(outerRadius);

    const transform = `translate(${width / 2}, ${height / 2})`;
    this._shapes.push(new Path()
      .data(pieData)
      .d(arcData)
      .select(elem("g.d3plus-Pie", {
        parent: this._select,
        enter: {transform},
        update: {transform}
      }).node())
      .config(this._shapeConfigPrep("Path"))
      .render());

    return this;

  }

  /**
      @memberof Pie
      @desc If *value* is specified, sets the inner radius accessor to the specified function or number and returns the current class instance. If *value* is not specified, returns the current inner radius accessor.
      @param {Function|Number} [*value*]
  */
  innerRadius(_) {
    return arguments.length
         ? (this._innerRadius = _, this)
         : this._innerRadius;
  }

  /**
      @memberof Pie
      @desc If *value* is specified, sets the arc padding to the specified radian value and returns the current class instance. If *value* is not specified, returns the current radian padding.
      @param {Number} [*value*]
  */
  padAngle(_) {
    return arguments.length
         ? (this._padAngle = _, this)
         : this._padAngle;
  }

  /**
      @memberof Pie
      @desc If *value* is specified, sets the arc padding to the specified pixel value and returns the current class instance. If *value* is not specified, returns the current pixel padding.
      @param {Number} [*value*]
  */
  padPixel(_) {
    return arguments.length
         ? (this._padPixel = _, this)
         : this._padPixel;
  }

  /**
      @memberof Pie
      @desc If *comparator* is specified, sets the sort order for the pie slices using the specified comparator function. If *comparator* is not specified, returns the current sort order, which defaults to descending order by the associated input data's numeric value attribute.
      @param {Array} [*comparator*]
      @example
function comparator(a, b) {
  return b.value - a.value;
}
  */
  sort(_) {
    return arguments.length
         ? (this._sort = _, this)
         : this._sort;
  }

  /**
      @memberof Pie
      @desc If *value* is specified, sets the value accessor to the specified function or number and returns the current class instance. If *value* is not specified, returns the current value accessor.
      @param {Function|Number} [*value*]
      @example
function value(d) {
  return d.value;
}
  */
  value(_) {
    return arguments.length
         ? (this._value = typeof _ === "function" ? _ : constant(_), this)
         : this._value;
  }

}
