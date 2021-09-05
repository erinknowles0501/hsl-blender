// In rough order of importance:
// TODO: Refactor:
//       - Add Hue class with methods
//       - Some functions could use more/less complexity.
//       - Cleverer or more readable versions of some functions.
//       - Ensure hue0 and hue1 everywhere - not color, not 1+2.
// TODO: Figure out error system. Just for devs - let's put it in the console.
// TODO: Add polar+cartesian charts with points.
// TODO: Some sanity styling for intuitive use. (also add bg to text on color for easier reading)
// TODO: Add docblocks to functions/methods
// TODO: Build polar-based color selector.
// TODO: Add support for multiple hues to be blended
// TODO: Fix null/null bug

// Constants
const BLANK_CARTESIAN_COORDS = { x: 0, y: 0 };
const BLANK_POLAR_COORDS = { r: 0, theta: 0 }; // theta.degrees, theta.radians? Updating issues? Use getter/setter?
// const BLANK_POLAR_COORDS = { r: 0, theta: { degrees: 0, radians: 0 } }; // theta.degrees, theta.radians? Updating issues? Use getter/setter?
const COORD_SYSTEM_TYPES = { POLAR: "polar", CARTESIAN: "cartesian" };

// TODO: Move this into the error class, and import these values when needed elsewhere
const DEV_MESSAGE_TYPES = {
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

// Set up global variables:
let currentAverageHue = 0;

// Page load things:
// Get input elements
const hue0Element = document.getElementById("hue0");
const hue1Element = document.getElementById("hue1");
const appBackgroundElement = document.getElementById("app-background");

// Set up event listeners
hue0Element.addEventListener("change", () => {
  updateDisplay([hue0Element]);
});
hue1Element.addEventListener("change", () => {
  updateDisplay([hue1Element]);
});
document.getElementById("blend").addEventListener("click", getBlendedColor);

// Initialize the connection with the DOM.
const domInterface = new DOMInterface();
domInterface.updateDisplay(); // first run, to display default settings.

// Classes
class DOMInterface {
  /**
   * Creates CSS hsl (hue, saturation, lightness) string from hue, with default saturation and lightness.
   * Displays error if hue is outside of that range, or wrong type.
   * hue = Number from 0-360
   * */
  hslFromHue(hue) {
    if (!hue || isNaN(hue) || hue < 0 || hue > 360) {
      new Error(DEV_MESSAGE_TYPES.ERROR, `Hue ${hue} does not exist.`);
      return;
    }
    return `hsl(${hue}, 100%, 50%)`;
  }

  /**
   * Call to update backgrounds of passed input elements, and update background color
   * elements = array of DOM elements
   * */
  updateDisplay(elements = [hue0Element, hue1Element]) {
    appBackgroundElement.style.backgroundColor =
      this.hslFromHue(currentAverageHue);

    if (!elements) {
      return;
    }

    elements.forEach((element) => {
      this.updateInputBackground(element);
    });
  }

  /**
   * Update the specified input element's background color.
   * element = DOM element
   * */
  updateInputBackground(element) {
    element.style.backgroundColor = this.hslFromHue(element.value);
  }
}

// Displays a message to the console. Intended to be useful when debugging future features and other changes.
class Error {
  // type: one of the DEV_MESSAGE_TYPES objects, which contain a string label property and a string color property (to give color context to the message).
  // message: string.
  constructor(type, message) {
    console.log(`%c ${type.label}: ${message}`, `color: ${type.color}`);
  }
}

// Handles any hue information and logic.
class Hue {
  // coords: One of polar or cartesian coordinate object
  // type:   One of 'polar' or 'cartesian'. See constants above - COORD_SYSTEM_TYPES
  constructor(coords, type) {
    // Refactor this part....could be better.
    // a factory...
    if (type === "cartesian") {
      this.polarCoords = setPolarCoords(coords);
    } else if (type === "polar") {
      this.cartesianCoords = setCartesianCoords(coords);
    } else {
      new Error(
        DEV_MESSAGE_TYPES.ERROR,
        `Coordinate system ${type} is not supported or does not exist.`
      );
    }
  }

  // returns cartesian coordinates object
  // error on missing or invalid polar coords,
  // error on cartesian already defined.
  setCartesianCoords() {
    // Math.cos() and .sin() expect radians. Convert the hue degree to radians first,
    // then convert it back to degrees for the cartesian coords.

    const hueRadians = getRadiansFromDegrees(this.polarCoords.theta);
    const hueCartesian = {};
    hueCartesian.x = getDegreesFromRadians(Math.cos(hueRadians));
    hueCartesian.y = getDegreesFromRadians(
      Math.sin(hueRadians) * (180 / Math.PI)
    );
    return hueCartesian;
  }

  // returns polar coordinates object
  // error on missing or invalid polar coords,
  // error on cartesian already defined.
  setPolarCoords() {
    //
  }

  getDegreesFromRadians(radians) {
    return radians * (180 / Math.PI);
  }

  getRadiansFromDegrees(degrees) {
    return degrees * (Math.PI / 180);
  }
}

// The business!
function getBlendedColor(hue0 = null, hue1 = null) {
  hue0 = new Hue(!!hue0 ? hue0 : Number(hue0Element.value));
  hue1 = new Hue(!!hue1 ? hue1 : Number(hue1Element.value));

  // Hues range from 0-360, with red at both ends. We can think of them as degrees of a circle.
  // Take each hue and turn its polar coordinate to cartesian
  //   const hue0Cartesian = getCartesian(hue0);
  //   const hue1Cartesian = getCartesian(hue1);

  //Average cartesian.
  //TODO: Refactor this. map()?
  const averageHueCartesian = new Hue({
    x: (hue0.cartesian.x + hue1.cartesian.x) / 2,
    y: (hue0.cartesian.y + hue1.cartesian.y) / 2,
  });

  // Convert back and save to global.
  currentAverageHue = averageHueCartesian.polar.theta;

  domInterface.updateDisplay();
}

function getPolar(hueCartesian) {
  let hueRadians = Math.atan2(hueCartesian.y, hueCartesian.x);
  let hueDegrees = hueRadians * (180 / Math.PI);
  console.log("hue degrees anyway", hueDegrees);
  // console.log('hue radians');

  // Special case if both are negative - we're in quadrant 3, where the degree has to be flipped from quad 1 to quad 3 (add 180);
  if (hueCartesian.x < 0 && hueCartesian.y < 0) {
    // console.log("hue cartesian if quad 3", hueCartesian);
    // console.log("hue radians if quad 3", hueRadians);
    // console.log("degrees if inverse radians: ", hueRadians * (180 / Math.PI));
    //hueRadians = -hueRadians;
    hueRadians = 2 * Math.PI + hueRadians;
    hueDegrees = hueRadians * (180 / Math.PI);
    //console.log("regular degrees before quad 3", hueDegrees);
    //hueDegrees += 180;
    console.log("huedegrees in quad3", hueDegrees);
  }

  // Convert to degrees and return
  return hueDegrees;
}
