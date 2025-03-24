// Ensure a composition is active
var comp = app.project.activeItem;
if (!(comp && comp instanceof CompItem)) {
    alert("Please select or open a composition first.");
} else {
    app.beginUndoGroup("Syntax Highlighting Script");

    // 1. Paste your JavaScript code here (using your provided code)
    var codeString = 
        "// Data structures\n" +
        "let groups = []; // Each group: { id, label, nodes: [ {id, label, targetPos, delay} ], center }\n" +
        "let edges = [];  // Each edge: { from: nodeID, to: nodeID }\n" +
        "let allNodes = {}; // For lookup: nodeID -> node object\n" +
        "\n" +
        "// Animation settings\n" +
        "let canvasSize = 2500; // Original fixed canvas size, now used as reference\n" +
        "let globalCenter;\n" +
        "let totalAnimationDuration = 15000; // 15 seconds (not used directly here)\n" +
        "let nodeAnimDuration = 2000;  // Duration for an individual node's burst animation\n" +
        "let delayBetweenNodes = 150;  // Delay in ms between consecutive nodes\n" +
        "\n" +
        "// Animation control\n" +
        "let animationPaused = true;\n" +
        "let animationStartTime = 0;\n" +
        "let pausedTime = 0;\n" +
        "let frameCount = 0;     // Track animation frames\n" +
        "let recordingFrameOffset = 0; // Offset for frame-based recording\n" +
        "\n" +
        "// Scale factors\n" +
        "let scaleRatio = 1;\n" +
        "let groupDistance;\n" +
        "let nodeCircleRadius;\n" +
        "\n" +
        "// Native MediaRecorder API variables\n" +
        "let mediaRecorder;\n" +
        "let recordedChunks = [];\n" +
        "let isRecording = false;\n" +
        "let recordButton;\n" +
        "let saveButton;\n" +
        "let statusElement;\n" +
        "let fps = 60; // Higher framerate for smoother recording\n" +
        "let recordingStartTime;\n" +
        "let frameCounter = 0;\n" +
        "\n" +
        "function setup() {\n" +
        "  // Create responsive canvas based on window size\n" +
        "  let canvasW = min(windowWidth, windowHeight);\n" +
        "  let canvasH = canvasW; // Keep it square\n" +
        "  createCanvas(canvasW, canvasH);\n" +
        "  \n" +
        "  // Calculate scale ratio based on window size vs original design size\n" +
        "  scaleRatio = canvasW / canvasSize;\n" +
        "  \n" +
        "  textFont('Arial');\n" +
        "  globalCenter = createVector(width/2, height/2);\n" +
        "  \n" +
        "  // Adjust spacing parameters based on scale\n" +
        "  groupDistance = 500 * scaleRatio; // distance from center to each group's center\n" +
        "  nodeCircleRadius = 150 * scaleRatio;\n" +
        "  \n" +
        "  // Parse the mermaid code into groups, nodes, and edges.\n" +
        "  parseMermaid(mermaidCode);\n" +
        "  \n" +
        "  // Compute layout for groups\n" +
        "  let numGroups = groups.length;\n" +
        "  for (let i = 0; i < groups.length; i++) {\n" +
        "    let angle = map(i, 0, numGroups, 0, TWO_PI);\n" +
        "    groups[i].center = p5.Vector.add(globalCenter, createVector(groupDistance * cos(angle), groupDistance * sin(angle)));\n" +
        "    \n" +
        "    // Arrange nodes in this group in a small circle around the group center.\n" +
        "    let numNodes = groups[i].nodes.length;\n" +
        "    for (let j = 0; j < numNodes; j++) {\n" +
        "      let nodeAngle = map(j, 0, numNodes, 0, TWO_PI);\n" +
        "      let targetPos = p5.Vector.add(groups[i].center, createVector(nodeCircleRadius * cos(nodeAngle), nodeCircleRadius * sin(nodeAngle)));\n" +
        "      // Each node gets a delay based on its order in the complete list.\n" +
        "      let globalDelay = delayBetweenNodes * (Object.keys(allNodes).indexOf(groups[i].nodes[j].id));\n" +
        "      groups[i].nodes[j].targetPos = targetPos;\n" +
        "      groups[i].nodes[j].delay = globalDelay;\n" +
        "    }\n" +
        "  }\n" +
        "  \n" +
        "  // Gather all nodes into a single array for collision resolution.\n" +
        "  let allNodesArray = [];\n" +
        "  for (let group of groups) {\n" +
        "    allNodesArray = allNodesArray.concat(group.nodes);\n" +
        "  }\n" +
        "  \n" +
        "  // Resolve collisions: ensure that node boxes do not overlap.\n" +
        "  resolveCollisions(allNodesArray, 10 * scaleRatio, 30 * scaleRatio);\n" +
        "\n" +
        "  // Get references to HTML elements\n" +
        "  recordButton = select('#recordButton');\n" +
        "  saveButton = select('#saveButton');\n" +
        "  statusElement = select('#status');\n" +
        "  let replayButton = select('#replayBtn');\n" +
        "  let playPauseButton = select('#playPauseBtn');\n" +
        "  \n" +
        "  // Add event listeners\n" +
        "  recordButton.mousePressed(toggleRecording);\n" +
        "  saveButton.mousePressed(saveVideo);\n" +
        "  replayButton.mousePressed(replayAnimation);\n" +
        "  playPauseButton.mousePressed(togglePlayPause);\n" +
        "  \n" +
        "  // Set a consistent frame rate\n" +
        "  frameRate(fps);\n" +
        "  \n" +
        "  // Initial status message\n" +
        "  statusElement.html('Animation paused. Click \"Play\" to begin.');\n" +
        "}\n";

    // 2. Create a new text layer with the code
    var textLayer = comp.layers.addText(codeString);
    var textProp = textLayer.property("Source Text");
    var textDocument = textProp.value;
    textDocument.resetCharStyle();
    textProp.setValue(textDocument);

    // 3. Total character count (for percentage conversion)
    var totalLength = codeString.length;
    function indexToPercent(index) {
        return (index / totalLength) * 100;
    }

    // 4. Define syntax rules (RegExp patterns and colors)
    var syntaxRules = [
        // Keywords (blue)
        { pattern: /\b(let|function|return|if|else|for|while|createCanvas|min|map|cos|sin|p5\.Vector|add|select|mousePressed|frameRate|html)\b/g, color: [0.2, 0.6, 1], name: "Keyword" },
        // Strings (green)
        { pattern: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, color: [0, 1, 0], name: "String" },
        // Single-line comments (gray)
        { pattern: /(\/\/[^\n]*)/g, color: [0.5, 0.5, 0.5], name: "Comment" }
        // You can add more rules for multi-line comments, numbers, etc.
    ];

    // 5. Helper function: adds a Fill Color animator for a given character range
    function addColorAnimator(layer, startIndex, endIndex, colorRGB, animatorName) {
        var animators = layer.property("Text").property("Animators");
        var animator = animators.addProperty("ADBE Text Animator");
        animator.name = animatorName;
        
        // Add and set the Fill Color property
        var fillColorProp = animator.property("ADBE Text Animator Properties").addProperty("ADBE Text Fill Color");
        fillColorProp.setValue(colorRGB);
        
        // Add a Range Selector and convert character indexes to percentages
        var rangeSelector = animator.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        var startPercent = indexToPercent(startIndex);
        var endPercent = indexToPercent(endIndex);
        rangeSelector.property("Start").setValue(startPercent);
        rangeSelector.property("End").setValue(endPercent);
    }

    // 6. Loop through each syntax rule and add animators for every match
    for (var r = 0; r < syntaxRules.length; r++) {
        var rule = syntaxRules[r];
        var regex = rule.pattern;
        var match;
        // Reset regex index for global matching
        regex.lastIndex = 0;
        while ((match = regex.exec(codeString)) !== null) {
            var startIndex = match.index;
            var endIndex = startIndex + match[0].length;
            // Create a unique animator name (e.g., "Keyword 1 @ 15")
            var animatorName = rule.name + " @ " + startIndex;
            addColorAnimator(textLayer, startIndex, endIndex, rule.color, animatorName);
        }
    }

    app.endUndoGroup();
}
