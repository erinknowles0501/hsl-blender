# HSL (hue-saturation-lightness) blender

_Pure JS (ES6). Long term plan - separate the logic out into a module that I can pull into the project I originally wrote this for._

## Overview

The color format HSL has values that range from 0-360, with red at both ends. We can therefore think of it as a circle.

This experiment/tool was born because the classic way to average a number (`(x+y)/2`) doesn’t always work here (take the example of hue `30` (orange) and hue `330` (magenta) - they should average to red (`0` or `360`, but instead, `(30+330)/2 = 180`, which is cyan!).

And so, to get the average of these two colors, we convert their polar coordinates (just a degree, really, because we can assume radius=1) to cartesian coordinates, average the hypotenuse, and then convert that point back into a polar coordinate.

## File structure

TODOs at top. Then define a global variable (currentAverageHue) and some DOM elements as consts.
Then, define the classes - DOMConnector, Hue, and Error.
Them the DOMConnector is initialized, it does its first run (to set values based on defaults). We set some event listeners (input change, button click).
Then there's one little function that actually does the blending of the colors.

## Development

This was originally intended as a quick proof-of-concept for implementing the polar->cartesian->polar method in another project, but when I finished, I found myself wanting to refactor and improve it, and it became its own mini-project. You can see the list of TODO's in comments near the top of the main file.

Usually these fiddles/pens are just to check if something definitely works in isolation before trying to introduce it into a project (and sometimes the reverse - something isn't working, let's see if I can make it work by itself).

I thought a lot about how to make it accessible for the 'next' dev, if there is one. I used descriptive (longer) var, prop, and function names - eg, 'radius' instead of 'r', or 'getRadiansFromDegrees(degrees)' instead of 'getRfromD(d)', because it removes the 'translation' step required for comprehension.
I also got serious about reminding the reader what's going into and out of a function. I made (mock) docblocks with what the function does, what values it expects, and what values it outputs, along with a reminder of the content or structure of any arrays or objects.
I moved the business logic into classes to separate them (and allow collapsing..!).
I also added an Error class - it just spits out a descriptive, color-coded console error when something I anticipate goes wrong - but it has already saved me time!

- Talk about your back-and-forth about how to set Hue coordinates - either use a factory, or...?
