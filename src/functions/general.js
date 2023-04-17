

// Sleep function
/**
 * Sets timeout for the input milliseconds.
 * Ensure to call with await.
 * @param {*} ms
 * @returns 
 */
const sleep = (ms) => new Promise ((r) => setTimeout(r, ms));

// Generate file name
function generateFileName(fileName, fileExtension, prefix) {
  let date = new Date().toISOString();
  date = date                                                       // Create new formatted date:
    .replaceAll("T", " ")                                           // Remove 'T' from ISO string
    .replaceAll(":", "-")                                           // Replace ':' with '-'
    .replace(/\.[^/.]+$/, "");                                      // Remove milliseconds and 'Z'
  return prefix + date + " " + fileName                             // Format the new prefix & DateTime
    .replace(/^(U_|S_)*(\d\d\d\d-\d\d-\d\d \d\d-\d\d-\d\d )*/, "")  // Remove date-time prefixes
    .replace(/\.[^\/.]+$/, fileExtension);                          // Replace file extension
}

export default { generateFileName, sleep }