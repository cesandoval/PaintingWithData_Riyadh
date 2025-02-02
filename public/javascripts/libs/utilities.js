var basePlaneDimension = 65024;
var mercator = new sm({size: basePlaneDimension});
var elevationCache = {};

var demCache = [];

for (var i=0; i<22; i++){
    demCache.push([])
}


function getCenter(){
    var pt = controls.target;
    var lngLat = mercator.ll([pt.x+basePlaneDimension/2, pt.z+basePlaneDimension/2],0);
    return lngLat.map(function(num){return roundTo(num,4)})
}

function mPerPixel(latitude, tileSize, zoom) {
    return Math.abs(
    	40075000 * Math.cos(latitude*Math.PI/180) / (Math.pow(2,zoom) * tileSize )
    );
}


function slashify(input){
    return input.join('/');
}

function deslash(input){
    return input.split('/').map(function(str){return parseInt(str)});
}


function getBaseLog(base, result) {
  return Math.log(result) / Math.log(base);
}



//project screen coordinates to scene coordinates

function projectToScene(px){
	var screenPosition = {x: (px[0]/width-0.5)*2, y:(0.5-px[1]/height)*2};
	raycaster.setFromCamera(screenPosition, camera);
    var pt = raycaster.intersectObject(plane)[0].point;
    return pt
}


//scene coordinates to lngLat (as intersecting with plane)
function unproject(pt){
    var lngLat = mercator.ll([pt.x+basePlaneDimension/2, pt.y+basePlaneDimension/2],0);
    return lngLat
}

// lngLat to scene coordinates (as intersecting with plane)
function project(lnglat){
    var px = mercator.px(lnglat,0);
    px = {x:px[0]-basePlaneDimension/2, y:0, z:px[1]-basePlaneDimension/2};
    return px
}



var totalCount = 49152;
var rowCount = 384
//above, left, below, right
var neighborTiles = [[0,0,-1],[0,-1,0],[0,0,1],[0,1,0]];
var row = [[],[],[],[]];

//get specific pixel indices of each edge
for (var c=0; c<rowCount; c+=3) {
    //top, left, bottom, right
    row[0].push(c+1);
    row[1].push(c/3*(rowCount)+1);
    row[2].push(c+1+totalCount-rowCount);
    row[3].push((c/3+1)*(rowCount)-2);
}

//fill seam between elevation tiles by adopting the edge of neighboring tiles
function resolveSeams(canvas, data, neighborTiles, [z,x,y]){
    //iterate through neighbors
    neighborTiles.forEach(function(tile, index){

        //figure out neighbor tile coordinate
        var targetTile = tile.map(function(coord,index){
            return coord+[z,x,y][index]
        })

        //if neighbor exists,
        var neighbor = canvas.scene.getObjectByProperty('coords',slashify(targetTile));
        if (neighbor){
            // indices that need to be overwritten
            var indicesToChange = row[index];
            //indices of neighbor vertices to copy
            var neighborIndices = row[(index+2)%4];
            var neighborVertices = neighbor.geometry.attributes.position.array;

            for (var a = 0; a<128;a++){
                data[indicesToChange[a]] = neighborVertices[neighborIndices[a]]
            }
        }
    })
    return data
}

function radicalize(degrees){
    return 2*Math.PI*degrees/360
}
function deradicalize(radians){
    return roundTo((360*radians/(2*Math.PI)),4)
}

function roundTo(number, decimals){
    return number.toFixed(decimals)/1
}
// Utility function to replace .bind(this) since it is not available in all browsers.
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

/**
 * Define the DraggableNumber element.
 * @constructor
 * @param {DomElement} input - The input which will be converted to a draggableNumber.
 */
DraggableNumber = function (input, options) {
  this._options = options !== undefined ? options : {};

  this._input = input;
  this._span = document.createElement("span");
  this._isDragging = false;
  this._lastMousePosition = {x: 0, y: 0};
  this._value = 0;
  this._startValue = this._value;
  this._step = 1;

  // Minimum mouse movement before a drag start.
  this._dragThreshold = this._setOption('dragThreshold', 10);

  // Min/max value.
  this._min = this._setOption('min', -Infinity);
  this._max = this._setOption('max', Infinity);

  // Store the original display style for the input and span.
  this._inputDisplayStyle = "";
  this._spanDisplayStyle = "";

  this._init();
};

/**
 * Constant used when there is no key modifier.
 * @constant
 * type {Number}
 */
DraggableNumber.MODIFIER_NONE = 0;

/**
 * Constant used when there is a shift key modifier.
 * @constant
 * type {Number}
 */
DraggableNumber.MODIFIER_LARGE = 1;

/**
 * Constant used when there is a control key modifier.
 * @constant
 * type {Number}
 */
DraggableNumber.MODIFIER_SMALL = 2;

DraggableNumber.prototype = {
  constructor: DraggableNumber,

  /**
   * Initialize the DraggableNumber.
   * @private
   */
  _init: function () {
    // Get the inital _value from the input.
    this._value = parseFloat(this._input.value, 10);

    // Add a span containing the _value. Clicking on the span will show the
    // input. Dragging the span will change the _value.
    this._addSpan();

    // Save the original display style of the input and span.
    this._inputDisplayStyle = this._input.style.display;
    this._spanDisplayStyle = this._span.style.display;

    // Hide the input.
    this._input.style.display = 'none';

    // Bind 'this' on event callbacks.
    this._onMouseUp = __bind(this._onMouseUp, this);
    this._onMouseMove = __bind(this._onMouseMove, this);
    this._onMouseDown = __bind(this._onMouseDown, this);
    this._onInputBlur = __bind(this._onInputBlur, this);
    this._onInputKeyDown = __bind(this._onInputKeyDown, this);
    this._onInputChange = __bind(this._onInputChange, this);

    // Add mousedown event handler.
    this._span.addEventListener('mousedown', this._onMouseDown, false);

    // Add key events on the input.
    this._input.addEventListener('blur', this._onInputBlur, false);
    this._input.addEventListener('keypress', this._onInputKeyDown, false);

    // Directly assign the function instead of using addeventlistener.
    // To programatically change the _value of the draggableNumber you
    // could then do:
    // input._value = new_number;
    // input.onchange();
    this._input.onchange = this._onInputChange;
  },

  /**
   * Set the DraggableNumber value.
   * @public
   * @param {Number} new_value - The new value.
   */
  set: function (new_value) {
    new_value = this._constraintValue(new_value);
    if (this._value !== new_value) {
      this._value = new_value;
      this._input.value = this._value;
      this._span.innerHTML = this._value;
    }
  },

  /**
   * Get the DraggableNumber value.
   * @public
   * @returns {Number}
   */
  get: function () {
    return this._value;
  },

  /**
   * Set the minimum value.
   * @public
   * @param {Number} min - The minimum value.
   */
  setMin: function (min) {
    this._min = min;
    // Set the value with current value to automatically constrain it if needed.
    this.set(this._value);
  },

  /**
   * Set the maximum value.
   * @public
   * @param {Number} min - The minimum value.
   */
  setMax: function (max) {
    this._max = max;
    // Set the value with current value to automatically constrain it if needed.
    this.set(this._value);
  },

  /**
   * Remove the DraggableNumber.
   * @public
   */
  destroy: function () {
    // Remove event listeners.
    this._span.removeEventListener('mousedown', this._onMouseDown, false);
    this._input.removeEventListener('blur', this._onInputBlur, false);
    this._input.removeEventListener('keypress', this._onInputKeyDown, false);
    document.removeEventListener('mouseup', this._onMouseUp, false);
    document.removeEventListener('mousemove', this._onMouseMove, false);

    // Remove the span element.
    if (this._span.parentNode) {
      this._span.parentNode.removeChild(this._span);
    }

    // Delete variables.
    delete this._input;
    delete this._span;
    delete this._inputDisplayStyle;
    delete this._spanDisplayStyle;
  },

  /**
   * Set an option value based on the option parameter and the data attribute.
   * @private
   * @param {String} name - The option name.
   * @param {Number} defaultValue - The default value.
   * @returns {Number}
   */
  _setOption: function (name, defaultValue) {
    // Return the option if it is defined.
    if (this._options[name] !== undefined) {
      return this._options[name];
    }
    // Return the data attribute if it is defined.
    if (this._input.hasAttribute("data-" + name)) {
      return parseFloat(this._input.getAttribute("data-" + name), 10);
    }
    // If there is no option and no attribute, return the default value.
    return defaultValue;
  },

  /**
   * Prevent selection on the whole document.
   * @private
   * @param {Boolean} prevent - Should we prevent or not the selection.
   */
  _preventSelection: function (prevent) {
    var value = 'none';
    if (prevent === false) {
      value = 'all';
    }

    document.body.style['-moz-user-select'] = value;
    document.body.style['-webkit-user-select'] = value;
    document.body.style['-ms-user-select'] = value;
    document.body.style['user-select'] = value;
  },

  /**
   * Add a span element before the input.
   * @private
   */
  _addSpan: function () {
    var inputParent = this._input.parentNode;
    inputParent.insertBefore(this._span, this._input);
    this._span.innerHTML = this.get();

    // Add resize cursor.
    this._span.style.cursor = "col-resize";
    this._span.classList = 'dragger'


  },

  /**
   * Display the input and hide the span element.
   * @private
   */
  _showInput: function () {
    return
    this._startValue = this._value;
    this._input.style.display = this._inputDisplayStyle;
    this._span.style.display = 'none';
    this._input.focus();
  },

  /**
   * Show the span element and hide the input.
   * @private
   */
  _showSpan: function () {
    this._input.style.display = 'none';
    this._span.style.display = this._spanDisplayStyle;
  },

  /**
   * Called on input blur, set the new value and display span.
   * @private
   * @param {Object} e - Event.
   */
  _onInputBlur: function (e) {
    this._onInputChange();
    this._showSpan();
    // Call onchange callback if it exists.
    if ("endCallback" in this._options) {
      if (this._value != this._startValue) {
        this._options.endCallback(this._value);
      }
    }
  },

  /**
   * Called on input onchange event, set the value based on the input value.
   * @private
   */
  _onInputChange: function () {
    this.set(parseFloat(this._input.value, 10));
  },

  /**
   * Called on input key down, blur on enter.
   * @private
   * @param {Object} e - Key event.
   */
  _onInputKeyDown: function (e) {
    var keyEnter = 13;
    if (e.charCode == keyEnter) {
      this._input.blur();
    }
  },

  /**
   * Called on span mouse down, prevent selection and initalize logic for mouse drag.
   * @private
   * @param {Object} e - Mouse event.
   */
  _onMouseDown: function (e) {
    this._preventSelection(true);
    this._isDragging = false;
    this._lastMousePosition = {x: e.clientX, y: e.clientY};
    this._startValue = this._value;
    this._step = this._getStep(this._value);

    document.addEventListener('mouseup', this._onMouseUp, false);
    document.addEventListener('mousemove', this._onMouseMove, false);
  },

  /**
   * Called on span mouse up, show input if no drag.
   * @private
   * @param {Object} e - Mouse event.
   */
  _onMouseUp: function (e) {
    this._preventSelection(false);
    // If we didn't drag the span then we display the input.
    if (this._isDragging === false) {
      this._showInput();
    }
    this._isDragging = false;

    document.removeEventListener('mouseup', this._onMouseUp, false);
    document.removeEventListener('mousemove', this._onMouseMove, false);

    // Call complete callback if it exists.
    if ("endCallback" in this._options) {
      // Don't call end callback if nothing changed.
      if (this._startValue != this._value) {
        this._options.endCallback(this._value);
      }
    }
    this._startValue = this._value;
  },

  /**
   * Check if difference bettween 2 positions is above minimum threshold.
   * @private
   * @param {Object} newMousePosition - the new mouse position.
   * @param {Object} lastMousePosition - the last mouse position.
   * @returns {Boolean}
   */
  _hasMovedEnough: function (newMousePosition, lastMousePosition) {
    if (Math.abs(newMousePosition.x - lastMousePosition.x) >= this._dragThreshold ||
      Math.abs(newMousePosition.y - lastMousePosition.y) >= this._dragThreshold) {
      return true;
    }
    return false;
  },

  _onMouseMove: function (e) {
    // Get the new mouse position.
    var newMousePosition = {x: e.clientX, y: e.clientY};

    if (this._hasMovedEnough(newMousePosition, this._lastMousePosition)) {
      this._isDragging = true;
    }

    // If we are not dragging don't do anything.
    if (this._isDragging === false) {
      return;
    }

    // Get the increment modifier. Small increment * 0.1, large increment * 10.
    var modifier = DraggableNumber.MODIFIER_NONE;
    if (e.shiftKey) {
      modifier = DraggableNumber.MODIFIER_LARGE;
    }
    else if (e.ctrlKey) {
      modifier = DraggableNumber.MODIFIER_SMALL;
    }

    // Calculate the delta with previous mouse position.
    var delta = this._getLargestDelta(newMousePosition, this._lastMousePosition);

    // Get the number offset.
    var offset = this._getNumberOffset(delta, modifier);

    var step = this._step * offset;

    // Update the input number.
    var new_value = this.get() + step;
    // Hack for rounding errors.
    new_value = parseFloat(new_value.toFixed(10));
    this.set(new_value);

    // Call onchange callback if it exists.
    if ("changeCallback" in this._options) {
      this._options.changeCallback(new_value);
    }

    // Save current mouse position.
    this._lastMousePosition = newMousePosition;
  },

  _getStep: function (value) {
    var step = 1;
    // The line below was taken from dat.gui: https://code.google.com/p/dat-gui/source/browse/src/dat/controllers/NumberController.js
    if (value !== 0 && isNaN(value) === false) {
      step = Math.pow(10, Math.floor(Math.log(Math.abs(value))/Math.LN10))/10;
    }
    return step;
  },

  /**
   * Return the number offset based on a delta and a modifier.
   * @private
   * @param {Number} delta - a positive or negative number.
   * @param {Number} modifier - the modifier type.
   * @returns {Number}
   */
  _getNumberOffset: function (delta, modifier) {
    var increment = 0.5;

    if (modifier == DraggableNumber.MODIFIER_SMALL) {
      increment *= 0.1;
    }
    else if (modifier == DraggableNumber.MODIFIER_LARGE) {
      increment *= 10;
    }
    // Negative increment if delta is negative.
    if (delta < 0) {
      increment *= -1;
    }
    return increment;
  },

  /**
   * Return the largest difference between two positions, either x or y.
   * @private
   * @param {Object} newMousePosition - the new mouse position.
   * @param {Object} lastMousePosition - the last mouse position.
   * @returns {Number}
   */
  _getLargestDelta: function (newPosition, oldPosition) {
    var result = 0;
    var delta = {
      x: newPosition.x - oldPosition.x,
      y: newPosition.y - oldPosition.y,
    };

    if (Math.abs(delta.x) > Math.abs(delta.y)) {
      return delta.x;
    }
    else {
      // Inverse the position.y since mouse move to up should increase the _value.
      return delta.y * -1;
    }
  },

  /**
   * Constrain a value between min and max.
   * @private
   * @param {Number} value - The value to constrain.
   * @returns {Number}
   */
  _constraintValue: function (value) {
    value = Math.min(value, this._max);
    value = Math.max(value, this._min);
    return value;
  }
};