# HSL (hue-saturation-lightness) blender

## Overview

HSL (color format: Hue Saturation Lightness) values start at red, at 0, pass through the rainbow, and end up at red again at 360. This makes accurately blending (ie getting the color halfway between two given colors) counter-intuitive - the classic way to average a number (`(x+y)/2`) doesn’t always work here (take the example of hue `30` (orange) and hue `330` (magenta) - they should average to red (`0` or `360`), but instead, `(30+330)/2 = 180`, which is cyan!) And so, you need to think of the hues as a circle, convert the polar coordinates to cartesian coordinates, get the average of the hypotenuse, and convert the average back into polar.

Because the HSL blender started as a codepen experiment, I decided to lean in to how to organize the code so it would make sense and be readable all in one file, instead of using folder structure like I usually do.

Written in pure JS (es6);

## File structure

TODOs at top. Then define a global variable (currentAverageHue) and some DOM elements as consts.
Then, define the classes - DOMConnector, Hue (which is inherited by HuePolar and HueCartesian), and Error.
Them the DOMConnector is initialized, it does its first run (to set values based on defaults). We set some event listeners (input change, button click).
Then there's one little function that actually does the blending of the colors.

## Development

This was originally intended as a quick proof-of-concept for implementing the polar->cartesian->polar method in another project, but when I finished, I found myself wanting to refactor and improve it, and it became its own mini-project. You can see the list of TODO's in comments near the top of the main file.

Usually these fiddles/pens are just to check if something definitely works in isolation before trying to introduce it into a project (and sometimes the reverse - something isn't working, let's see if I can make it work by itself). Sometimes, I suppose, they turn into their own project - I now want to both build out this tool, and isolate the blending so I can export it as a module and use it out-of-the-box in the project this was originally meant for.

For fun, I ended up thinking a lot about how to make it accessible for the 'next' dev. I noticed I used descriptive (longer) var, prop, and function names - eg, 'radius' instead of 'r', or 'getRadiansFromDegrees(degrees)' instead of 'getRfromD(d)', because it removes the 'translation' step required for comprehension.
I also got serious about reminding the reader what's going into and out of a function. I made (mock...it's JS) docblocks with what the function does, what values it expects, and what values it outputs, along with a reminder of the content or structure of any arrays or objects.
I moved the business logic into classes to separate them (and allow collapsing..!).
I also added an Error class as a proof-of-concept - it just spits out a descriptive, color-coded console error when something I anticipate goes wrong - but it has actually saved me time!

I spent a lot of time thinking about how to set up a Hue, where it's defined as either a polar or a cartesian hue, and hues usually have to convert back and forth. My first approaches involved passing a `type` to the constructor that was `switch`ed on whether or not it matched the constant value for cartesian or polar, but I really hate switches.
Eventually I realized I'm only intending to work with two discrete types of hues with a lot of functionality and data structure in common, and that a new Hue, given the scope of what I have planned for this tool, will always require being defined with a type, so now, classes HuePolar and HueCartesian inherit from Hue.
