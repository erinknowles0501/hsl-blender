// In rough order of importance:
// TODO: Refactor:
//       - Add Hue class with methods
//       - Some functions could use more/less complexity.
//       - Cleverer or more readable versions of some functions.
//       - Ensure hue0 and hue1 everywhere - not color, not 1+2.
// TODO: Add polar+cartesian charts with points.
// TODO: Some sanity styling for intuitive use. (also add bg to text on color for easier reading)
// TODO: Add docblocks to functions/methods
// TODO: Validation on set() coordinates.
// TODO: Build polar-based color selector.
// TODO: Add support for multiple hues to be blended
// TODO: Fix null/null bug

// Set up global variables:
let currentAverageHue = 0;

// Get input elements
const hue0Element = document.getElementById("hue0");
const hue1Element = document.getElementById("hue1");
const appBackgroundElement = document.getElementById("app-background");

// Define classes: DOMConnector, Hue, Error
class DOMConnector {
  /**
   * Creates CSS hsl (hue, saturation, lightness) string from hue, with default saturation and lightness.
   * Error if hue is outside of that range, or wrong type.
   *
   * hue = Number from 0-360
   * */
  hslFromHue(hue) {
    // Hue=0 is fine, everything else is not. Put the Hue=0 check first
    // because it's more likely than the other items.
    if (hue !== 0 && (!hue || isNaN(hue) || hue < 0 || hue > 360)) {
      new Error(Error.DEV_MESSAGE_TYPES.ERROR, `Hue ${hue} does not exist.`);
      return;
    }
    return `hsl(${hue}, 100%, 50%)`;
  }

  /**
   * Call to update backgrounds of passed input elements, and update background color
   * Error if elements is present but not an array.
   *
   * elements = array of DOM elements
   * */
  updateDisplay(elements = [hue0Element, hue1Element]) {
    if (elements && !Array.isArray(elements)) {
      new Error(
        Error.DEV_MESSAGE_TYPES.ERROR,
        `Elements should be an array, value ${elements} is not an array.`
      );
      return;
    }

    appBackgroundElement.style.backgroundColor =
      this.hslFromHue(currentAverageHue);

    // No elements need to be updated - return out of this function before the forEach runs.
    if (!elements) {
      return;
    }

    elements.forEach((element) => {
      this.updateInputBackground(element);
    });
  }

  /**
   * Update the specified input element's background color.
   *
   * element = DOM element
   * */
  updateInputBackground(element) {
    element.style.backgroundColor = this.hslFromHue(element.value);
  }
}

/**
 * Handles and stores hue information and logic.
 * Error if invalid type.
 *
 * coords: One of polar or cartesian coordinates object (see BLANK_* constants)
 * type: One of 'polar' or 'cartesian'. See COORD_SYSTEM_TYPES constant above
 * */
class Hue {
  // TODO: Consider: Hue is just an inheritance, and actual implementation uses HuePolar or HueCartesian?
  // Before you make that call, quickly spec out the TODO's graph views. Will using a factory be a pain in the ass there?

  static COORD_SYSTEM_TYPES = { POLAR: "polar", CARTESIAN: "cartesian" };
  static BLANK_CARTESIAN_COORDS = { x: 0, y: 0 };
  static BLANK_POLAR_COORDS = { theta: 0 }; // don't need radius here.

  polar = {};
  cartesian = {};

  constructor(coords, type) {
    if (!Object.values(Hue.COORD_SYSTEM_TYPES).includes(type)) {
      new Error(
        Error.DEV_MESSAGE_TYPES.ERROR,
        `Coordinate system ${type} is not supported or does not exist.`
      );
    }

    // (JSON parse/stringify is safest/fastest/easiest/smallest overall method to deep clone an object.)
    this.polar = JSON.parse(JSON.stringify(Hue.BLANK_POLAR_COORDS)); // polar: { radius, theta }
    this.cartesian = JSON.parse(JSON.stringify(Hue.BLANK_CARTESIAN_COORDS)); // cartesian: { x, y }

    // Does this work?
    console.log(this, coords);
    this[type] = coords;

    // then set the other, whatever isn't [type]
    // this.setPolarCoords(coords);
    // this.setCartesianCoords(coords);
  }

  /**
   * Error on missing or invalid coords
   *
   * coords: either polar or cartesian.
   * */
  setCartesianCoordsFromPolar(coords) {
    if (!coords || !coords.radius || !coords.theta) {
      new Error(
        Error.DEV_MESSAGE_TYPES.ERROR,
        `Coordinates ${coords} can not be converted to cartesian coords.`
      );
      return;
    }

    // Math.cos() and .sin() expect radians. Convert the hue degree to radians first,
    // then convert it back to degrees for the cartesian coords.
    const hueRadians = this.getRadiansFromDegrees(this.polar.theta);
    const hueCartesian = {};
    hueCartesian.x = this.getDegreesFromRadians(Math.cos(hueRadians));
    hueCartesian.y = this.getDegreesFromRadians(
      Math.sin(hueRadians) * (180 / Math.PI)
    );
    return hueCartesian;
  }

  /**
   * Error on missing or invalid coords
   *
   * coords: either polar or cartesian.
   * */
  setPolarCoordsfromCartesian(coords) {
    let hueRadians = Math.atan2(this.cartesian.y, cartesian.x);
    let hueDegrees = hueRadians * (180 / Math.PI);

    // Special case if both are negative: means we're in quadrant 3,
    // where the degree has to be flipped from quad 1 to quad 3.
    if (cartesian.x < 0 && cartesian.y < 0) {
      hueRadians = 2 * Math.PI + hueRadians;
      hueDegrees = hueRadians * (180 / Math.PI);
    }

    this.polar.theta = hueDegrees;
  }

  getDegreesFromRadians(radians) {
    return radians * (180 / Math.PI);
  }

  getRadiansFromDegrees(degrees) {
    return degrees * (Math.PI / 180);
  }
}

/**
 * Displays a message to the console. Useful when debugging future features and other changes.
 *
 * type: one of the DEV_MESSAGE_TYPES objects, which contain a string label property
 *       and a string color property (to give color context to the message).
 * message: string.
 * */
class Error {
  static DEV_MESSAGE_TYPES = {
    ERROR: {
      label: "Error",
      color: "red",
    },
    WARNING: {
      label: "Warning",
      color: "orange",
    },
    INFO: {
      label: "Info",
      color: "royalblue",
    },
  };

  constructor(type, message) {
    console.log(`%c ${type.label}: ${message}`, `color: ${type.color}`);
  }
}

// Initialize the connection with the DOM.
const domConnector = new DOMConnector();
domConnector.updateDisplay(); // first run, to display default settings.

// Set up event listeners
hue0Element.addEventListener("change", () => {
  domConnector.updateDisplay([hue0Element]);
});
hue1Element.addEventListener("change", () => {
  domConnector.updateDisplay([hue1Element]);
});
document.getElementById("blend").addEventListener("click", getBlendedColor);

// The business!
function getBlendedColor(hue0 = null, hue1 = null) {
  hue0 = new Hue(
    !!hue0 ? hue0 : Number(hue0Element.value),
    Hue.COORD_SYSTEM_TYPES.POLAR
  );
  hue1 = new Hue(
    !!hue1 ? hue1 : Number(hue1Element.value),
    Hue.COORD_SYSTEM_TYPES.POLAR
  );

  // Get the hue's cartesian values and average into a new cartesian.
  const averageHueCartesian = new Hue(
    {
      x: (hue0.cartesian.x + hue1.cartesian.x) / 2,
      y: (hue0.cartesian.y + hue1.cartesian.y) / 2,
    },
    Hue.COORD_SYSTEM_TYPES.CARTESIAN
  );

  // Convert back to polar and save to global.
  currentAverageHue = averageHueCartesian.polar.theta;

  domConnector.updateDisplay();
}
