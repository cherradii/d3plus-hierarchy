/**
    @external Viz
    @see https://github.com/d3plus/d3plus-viz#Viz
*/
import {nest} from "d3-collection";
import {hierarchy, pack} from "d3-hierarchy";

import {accessor, assign, configPrep, constant, elem, merge} from "d3plus-common";
import * as shapes from "d3plus-shape";
import {Viz} from "d3plus-viz";

/**
    @class Pack
    @extends Viz
    @desc Uses the [d3 pack layout](https://github.com/d3/d3-hierarchy#pack) to creates SVG arcs based on an array of data.
*/
export default class Pack extends Viz {

  /**
      @memberof Pack
      @desc Invoked when creating a new class instance, and sets any default parameters.
      @private
  */
  constructor() {

    super();

    this._on.mouseenter = () => {};
    this._on["mouseleave.shape"] = () => {
      this.hover(false);
    };
    this._pack = pack();
    this._shape = constant("Circle");
    this._shapeConfig = assign(this._shapeConfig, {
      Circle: {
        opacity: d => d.__d3plusOpacity__ || 1,
        labelConfig: {
          fontResize: true
        }
      }
    });
    this._sort = (a, b) => b.value - a.value;
    this._sum = accessor("value");
  }

  /**
      Extends the draw behavior of the abstract Viz class.
      @private
  */
  _draw(callback) {
    super._draw(callback);

    const height = this._height - this._margin.top - this._margin.bottom,
          width = this._width - this._margin.left - this._margin.right;

    const diameter = Math.min(height, width);
    const transform = `translate(${(width - diameter) / 2}, ${(height - diameter) / 2})`;

    let nestedData = nest();
    for (let i = 0; i <= this._drawDepth; i++) nestedData.key(this._groupBy[i]);
    nestedData = nestedData.entries(this._filteredData);
    
    const packData = this._pack
      .padding(this._layoutPadding)
      .size([diameter, diameter])
      (hierarchy({key: nestedData.key, values: nestedData}, d => d.values).sum(this._sum).sort(this._sort))
      .descendants();

    packData.forEach((d, i) => {
      d.__d3plus__ = true;
      d.id = d.data.key;
      d.depth = d.depth;
      d.x = d.x;
      d.y = d.y;
      if (d.height) d.data.__d3plusOpacity__ = 0.25;
    });

    this._shapes.push(
      new shapes.Circle()
        .data(packData)
        .select(
          elem("g.d3plus-Pack-circle", {
            parent: this._select,
            enter: {transform},
            update: {transform}
          }).node()
        )
        .config({
          label: d => d.parent && !d.children ? d.data.name : false
        })
        .config(configPrep.bind(this)(this._shapeConfig, "shape", "Circle"))
        .render()
    );

    return this;
  }

  /**
      @memberof Pack
      @desc If *value* is specified, sets the sum accessor to the specified function or number and returns the current class instance. If *value* is not specified, returns the current sum accessor.
      @param {Function|Number} [*value*]
      @example
function sum(d) {
  return d.sum;
}
  */
  sum(_) {
    return arguments.length ? (this._sum = typeof _ === "function" ? _ : accessor(_), this) : this._sum;
  }
}
