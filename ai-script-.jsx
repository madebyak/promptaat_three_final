// Adobe Illustrator ExtendScript
if (app.documents.length > 0) {
    var doc = app.activeDocument;
    var sel = doc.selection;
    if (sel.length > 0) {
        for (var i = 0; i < sel.length; i++) {
            var item = sel[i];
            // Ensure the item is filled and the fill color is RGB
            if (item.filled && item.fillColor.typename === "RGBColor") {
                var fill = item.fillColor;
                var r = Math.round(fill.red);
                var g = Math.round(fill.green);
                var b = Math.round(fill.blue);
                var hex = "#" + dec2hex(r) + dec2hex(g) + dec2hex(b);
                var colorName = getColorName(hex);
                
                // Calculate brightness using luminance formula
                var brightness = (r * 0.299 + g * 0.587 + b * 0.114);
                var textFill = new RGBColor();
                if (brightness < 128) {
                    // If dark fill, use white text
                    textFill.red = 255;
                    textFill.green = 255;
                    textFill.blue = 255;
                } else {
                    // If light fill, use black text
                    textFill.red = 0;
                    textFill.green = 0;
                    textFill.blue = 0;
                }
                
                // Get the object's geometric bounds
                // Illustrator returns bounds as [left, top, right, bottom]
                var bounds = item.geometricBounds;
                var left = bounds[0], top = bounds[1], right = bounds[2], bottom = bounds[3];
                var centerX = (left + right) / 2;
                var centerY = (top + bottom) / 2;
                
                // Create a point text object at the center of the item
                var textFrame = doc.textFrames.pointText([centerX, centerY]);
                textFrame.contents = colorName + " (" + hex + ")";
                textFrame.textRange.characterAttributes.size = 12.8;
                // Set the font to Arial (the internal name is usually "ArialMT")
                textFrame.textRange.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
                textFrame.textRange.fillColor = textFill;
                // Center the text within the text frame
                textFrame.textRange.paragraphAttributes.justification = Justification.CENTER;
            }
        }
    } else {
        alert("Please select one or more objects.");
    }
} else {
    alert("No document open.");
}

// Helper function: converts a number (0-255) to a two-digit hex string.
function dec2hex(dec) {
    var hex = dec.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// Helper function: returns a color name for a given hex code if it matches a preset list.
function getColorName(hex) {
    // Define a simple mapping for some common colors.
    var colorNames = {
        "#FF0000": "Red",
        "#00FF00": "Green",
        "#0000FF": "Blue",
        "#FFFF00": "Yellow",
        "#FFA500": "Orange",
        "#800080": "Purple",
        "#FFFFFF": "White",
        "#000000": "Black"
    };
    // Ensure the hex code is in uppercase.
    hex = hex.toUpperCase();
    return (colorNames[hex]) ? colorNames[hex] : "Custom";
}
