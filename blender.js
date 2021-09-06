// In rough order of importance:
// TODO: Add polar+cartesian charts with points.
// TODO: Some sanity styling for intuitive use. (also add bg to text on color for easier reading)
// TODO: Validation on set() coordinates.
// TODO: Build polar-based color selector!
// TODO: Add support for multiple hues to be blended?

// Set up global variables:
let currentAverageHue = 0;

// Get input elements
const hue0Element = document.getElementById("hue0");
const hue1Element = document.getElementById("hue1");
const appBackgroundElement = document.getElementById("app-background");

// Define classes: DOMConnector, Hue (Inheritable), HuePolar, HueCartesian, Error
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
    if (hue !== 0 && (!hue || isNaN(hue))) {
      new Message(
        Message.DEV_MESSAGE_TYPES.ERROR,
        `Hue ${hue} does not exist.`
      );
      return;
    }
    return `hsl(${hue}, 100%, 50%)`;
  }

  /**
   * Call to update backgrounds of passed input elements, and update background color
   * Error if elements is present but not an array.
   *
   * elements = array of DOM elements. Nullable.
   * */
  updateDisplay(elements = [hue0Element, hue1Element]) {
    if (elements && !Array.isArray(elements)) {
      new Message(
        Message.DEV_MESSAGE_TYPES.ERROR,
        `Elements should be an array, value ${elements} is not an array.`
      );
      return;
    }

    this.updateAppBackground();

    // No elements need to be updated - return out of this function before the forEach runs.
    if (!elements) {
      return;
    }

    elements.forEach((element) => {
      this.updateInputBackground(element);
    });

    // Since there is at least one element, that means at least one color has changed,
    // which means we need to re-blend our colors.
    getBlendedColor();
    this.updateAppBackground();
  }

  /**
   * Update the page background to current version of currentAverageHue.
   * */
  updateAppBackground() {
    appBackgroundElement.style.backgroundColor =
      this.hslFromHue(currentAverageHue);
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
 * Not directly used except for lookup of static props - inherited by HuePolar and HueCartesian.
 * */
class Hue {
  static COORD_SYSTEM_TYPES = { POLAR: "polar", CARTESIAN: "cartesian" };
  static BLANK_CARTESIAN_COORDS = { x: 0, y: 0 };
  static BLANK_POLAR_COORDS = { theta: 0 }; // don't need radius here.

  // (JSON parse/stringify is safest/fastest/easiest/smallest overall method to deep clone an object.)
  polar = JSON.parse(JSON.stringify(Hue.BLANK_POLAR_COORDS)); // { theta }
  cartesian = JSON.parse(JSON.stringify(Hue.BLANK_CARTESIAN_COORDS)); // { x, y }

  /**
   * Error on missing or invalid value
   *
   * theta: Number: since we don't need the radius, we're just using the degree.
   * */
  setCartesianCoordsFromPolar(theta) {
    if (theta !== 0 && !theta) {
      new Message(
        Message.DEV_MESSAGE_TYPES.ERROR,
        `Theta is missing, cannot convert to cartesian coordinates.`
      );
      return;
    }

    // Math.cos() and .sin() expect radians. Convert the hue degree to radians first,
    // then convert it back to degrees for the cartesian coords.
    const hueRadians = this.getRadiansFromDegrees(theta);

    this.cartesian.x = this.getDegreesFromRadians(Math.cos(hueRadians));
    this.cartesian.y = this.getDegreesFromRadians(Math.sin(hueRadians));
  }

  /**
   * Error on missing or invalid coords
   *
   * coords: polar. No radius, so just { theta }
   * */
  setPolarCoordsfromCartesian(coords) {
    if (!coords || !coords.x || !coords.y) {
      new Message(
        Message.DEV_MESSAGE_TYPES.ERROR,
        `Coordinates ${coords} can not be converted to polar coords.`
      );
      return;
    }

    let hueRadians = Math.atan2(coords.y, coords.x);
    let hueDegrees = this.getDegreesFromRadians(hueRadians);

    // Special case if both are negative: means we're in quadrant 3,
    // where the degree has to be flipped from quad 1 to quad 3.
    if (coords.x < 0 && coords.y < 0) {
      hueRadians = 2 * Math.PI + hueRadians;
      hueDegrees = this.getDegreesFromRadians(hueRadians);
    }

    this.polar.theta = hueDegrees;
  }

  // These two could be "convertBetweenDegreesAndRadians(value, direction)" but let's not.
  getDegreesFromRadians(radians) {
    return radians * (180 / Math.PI);
  }

  getRadiansFromDegrees(degrees) {
    return degrees * (Math.PI / 180);
  }
}

class HuePolar extends Hue {
  constructor(theta) {
    super();
    this.polar.theta = theta;

    this.setCartesianCoordsFromPolar(theta);
  }
}

class HueCartesian extends Hue {
  constructor(coords) {
    super();
    this.cartesian = coords;

    this.setPolarCoordsfromCartesian(coords);
  }
}

/**
 * Displays a message to the console. Useful when debugging future features and other changes.
 *
 * type: one of the DEV_MESSAGE_TYPES objects, which contain a string label property
 *       and a string color property (to give color context to the message).
 * message: string.
 * */
class Message {
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
document.getElementById("blend").addEventListener("click", getBlendedColor());

/**
 * The business part!
 * Error if hue missing or invalid.
 * */
function getBlendedColor() {
  let hue0 = Number(hue0Element.value);
  let hue1 = Number(hue1Element.value);

  if ((hue0 !== 0 && !hue0) || (hue1 !== 0 && !hue1)) {
    new Message(
      Message.DEV_MESSAGE_TYPES.ERROR,
      `Cannot blend colors: Invalid or missing hue(s): ${hue0}, ${hue1}`
    );
    return;
  }

  hue0 = new HuePolar(hue0);
  hue1 = new HuePolar(hue1);

  // Get the hue's cartesian values and average into a new cartesian
  const averageHueCartesian = new HueCartesian({
    x: (hue0.cartesian.x + hue1.cartesian.x) / 2,
    y: (hue0.cartesian.y + hue1.cartesian.y) / 2,
  });

  // Convert back to polar and save to global.
  currentAverageHue = averageHueCartesian.polar.theta;
}
