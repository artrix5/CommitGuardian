/**
 * Parses markdown text into a structured JSON format
 * @param {string} markdown - Input markdown text
 * @returns {Object} - Parsed markdown structure
 */
function parseMarkdown(markdown) {
  // Trim the input and split into lines
  const lines = markdown.trim().split('\n');
  
  // Result object to store parsed content
  const result = {
    sections: []
  };

  // Current section being processed
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    // Trim the line
    let line = lines[i].trim();

    // Check for section headers (more flexible matching)
    const sectionHeaderMatch = line.match(/^(.*?):\s*$/);
    if (sectionHeaderMatch) {
      // If there's a previous section, add it to results
      if (currentSection) {
        result.sections.push(currentSection);
      }
      
      // Start a new section
      currentSection = {
        title: sectionHeaderMatch[1],
        content: [],
        type: 'section'
      };
      continue;
    }

    // If no current section, create a default one
    if (!currentSection) {
      currentSection = {
        title: 'Default',
        content: [],
        type: 'section'
      };
    }

    // Handle list items (more flexible matching)
    const listItemMatch = line.match(/^[-*]\s*(.+)$/);
    if (listItemMatch) {
      currentSection.content.push({
        type: 'listItem',
        text: listItemMatch[1].replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
      });
      continue;
    }

    // Handle regular text with bold sections
    if (line) {
      // Replace bold markers while preserving the text
      const boldReplacedLine = line.replace(/\*\*(.*?)\*\*/g, '$1');
      
      currentSection.content.push({
        type: 'text',
        text: boldReplacedLine
      });
    }
  }

  // Add the last section if exists
  if (currentSection) {
    result.sections.push(currentSection);
  }

  return result;
}

module.exports = parseMarkdown;