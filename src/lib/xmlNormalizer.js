export function normalizeXML(xmlString) {
    if (!xmlString.trim()) return '';
    
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        return `Syntax Error: ${parseError[0].textContent}`;
      }
      const cleanNode = (node) => {
        if (node.nodeType === 1) { 
          const attrs = Array.from(node.attributes)
            .sort((a, b) => a.name.localeCompare(b.name));
          
          while (node.attributes.length > 0) {
            node.removeAttribute(node.attributes[0].name);
          }
          attrs.forEach(attr => node.setAttribute(attr.name, attr.value));
        }

        for (let i = 0; i < node.childNodes.length; i++) {
          cleanNode(node.childNodes[i]);
        }
      };
  
      cleanNode(xmlDoc.documentElement);
  
      const serializer = new XMLSerializer();
      return serializer.serializeToString(xmlDoc);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
  