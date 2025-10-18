// script.js

// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
  // === 1. DOM Element Selection ===
  // Get references to all necessary HTML elements
  const selectImageBtn = document.getElementById("selectImageBtn");
  const imageInput = document.getElementById("imageInput");
  const imageCanvas = document.getElementById("imageCanvas");
  const clickLogArea = document.getElementById("clickLogArea");
  const colorLogArea = document.getElementById("colorLogArea");

  // Get the 2D rendering context for the canvas
  const ctx = imageCanvas.getContext("2d");

  // Store the loaded image object
  const img = new Image();

  let startFlag = false;

  // === 2. Event Listeners ===

  /**
   * This triggers the hidden file input element.
   */
  selectImageBtn.addEventListener("click", () => {
    imageInput.click();
  });

  /**
   * This is triggered when the user chooses a file.
   */
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a URL for the selected file
      const objectURL = URL.createObjectURL(file);
      // Set the image source. This will trigger the 'load' event (see below)
      img.src = objectURL;
    }
  });

  /**
   * This runs after img.src is set and the image data is loaded.
   * We draw the image onto the canvas here.
   */
  img.addEventListener("load", () => {
    // Set the canvas's *internal* dimensions
    // to match the *original* image's dimensions.
    imageCanvas.width = img.naturalWidth;
    imageCanvas.height = img.naturalHeight;

    // Draw the image onto the canvas, filling it
    ctx.drawImage(img, 0, 0);

    // (Optional) Revoke the object URL to free up memory
    URL.revokeObjectURL(img.src);
  });

  /**
   * This calculates and logs the original image coordinates.
   */
  imageCanvas.addEventListener("click", (e) => {
    // Get the (x, y) coordinates based on the original image size
    const { x, y } = getOriginalCoords(e);

    // Log the coordinates to the clickLogArea
    const logText = `(${x}, ${y})\n`;
    clickLogArea.value += logText;
    // Auto-scroll to the bottom
    clickLogArea.scrollTop = clickLogArea.scrollHeight;
  });

  /**
   * This prevents the default menu, gets the pixel color, and displays it.
   */
  imageCanvas.addEventListener("contextmenu", (e) => {
    // Prevent the default right-click context menu from appearing
    e.preventDefault();

    // Get the (x, y) coordinates
    const { x, y } = getOriginalCoords(e);

    // Get the pixel data (RGBA) at the specified coordinate
    // getImageData(x, y, width, height)
    const pixelData = ctx.getImageData(x, y, 1, 1).data;

    // Convert the RGBA values to a HEX string
    const hexColor = rgbaToHex(pixelData[0], pixelData[1], pixelData[2]);

    // Display the hex color in the colorLogArea
    colorLogArea.value = hexColor.toUpperCase();
  });

  // === 3. Helper Functions ===

  /**
   * Calculates the original (x, y) coordinates on the image,
   * compensating for CSS scaling.
   * @param {MouseEvent} e - The mouse event.
   * @returns {{x: number, y: number}} - The original image coordinates.
   */
  function getOriginalCoords(e) {
    // Get the canvas's current size and position on the page
    const rect = imageCanvas.getBoundingClientRect();

    // Calculate the scaling factors
    // (Internal Width) / (Displayed Width)
    const scaleX = imageCanvas.width / rect.width;
    // (Internal Height) / (Displayed Height)
    const scaleY = imageCanvas.height / rect.height;

    // Calculate the click position relative to the displayed canvas
    const displayX = e.clientX - rect.left;
    const displayY = e.clientY - rect.top;

    // Convert the displayed coordinates to the original image coordinates
    const originalX = Math.floor(displayX * scaleX);
    const originalY = Math.floor(displayY * scaleY);

    return { x: originalX, y: originalY };
  }

  /**
   * Converts R, G, B color values to a HEX string format.
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @returns {string} - The color in #RRGGBB format.
   */
  function rgbaToHex(r, g, b) {
    // Helper function to convert a single number to a 2-digit hex string
    const toHex = (c) => c.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
});
