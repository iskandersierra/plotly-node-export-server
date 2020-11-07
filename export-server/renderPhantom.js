/*
    Plotly.js offline image export server with Node.js
    Copyright (C) 2018  Dirk Stolle

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";

var page = require('webpage').create();
var system = require('system');
var fs = require('fs');

if (system.args.length !== 4) {
  console.log('Usage: phantom renderPhantom.js template.html plot.json output.png');
  phantom.exit(1);
} else {
  // Get all file names from command line parameters.
  var template = system.args[1];
  var templatePath = fs.absolute(template);
  var plotData = system.args[2];
  var plotDataPath = fs.absolute(plotData);
  var outFile = system.args[3];

  // Read the JSON data for the plot of Plotly.js.
  var plotString = fs.read(plotDataPath);
  var chartJson = {};
  try {
    chartJson = JSON.parse(plotString);
  } catch (e) {
    console.log('Could not parse plot data into JSON!');
    phantom.exit(1);
  }

  page.onLoadFinished = function (status) {
    // Create the chart by making a new plot with the given data.
    console.log('Creating chart ...');
    page.evaluate(function (chartJson) {
      Plotly.newPlot('plot', [chartJson]);
    }, chartJson);

    // The evaluation and drawing is done, now render it to PNG.
    console.log('rendering image...');
    page.render(outFile, {
      format: 'png'
    });
    // Success. (Unless someone specified useless JSON data.)
    phantom.exit(0);
  };

  // Setting content of the page directly is effectively the same as a reload.
  page.content = fs.read(templatePath);
}
