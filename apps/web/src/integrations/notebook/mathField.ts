import { MathfieldElement, convertLatexToMarkup } from "mathlive";
import DOMPurify from "dompurify";
import "mathlive/static.css";
import "mathlive/fonts.css";

const sanitizer = DOMPurify(window);
const dimensions = /^(?:-?(?:\d+\.?\d*|\.\d+)(?:em|ex|px|rem|%|pt)?|auto|normal)(?:\s+-?(?:\d+\.?\d*|\.\d+)(?:em|ex|px|rem|%|pt)?){0,3}$/i;
const dimensionalProperties = /^(?:(?:min-|max-)?(?:height|width)|top|left|right|bottom|vertical-align|font-size|line-height|letter-spacing|(?:margin|padding)(?:-(?:top|left|right|bottom))?|border(?:-(?:top|left|right|bottom))?-width)$/;
sanitizer.addHook("uponSanitizeAttribute", (_node, data) => {
  if (data.attrName !== "style") return;
  const style = document.createElement("span").style;
  style.cssText = data.attrValue;
  for (const property of Array.from(style)) {
    const value = style.getPropertyValue(property).trim();
    const allowed = dimensionalProperties.test(property) ? dimensions.test(value)
      : /^(?:color|background-color|border-color)$/.test(property) ? /^(?:[a-z]+|#[\da-f]{3,8}|(?:rgb|hsl)a?\([\d.% ,/+-]+\))$/i.test(value)
      : property === "position" ? /^(?:relative|absolute|static)$/.test(value)
      : property === "display" ? /^(?:inline|block|inline-block|flex|none)$/.test(value)
      : property === "opacity" ? /^(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(value)
      : property === "transform" ? /^(?:(?:translate[XY]?|scale[XY]?)\([-.\d%empxt ,]+\)\s*)+$/.test(value)
      : /^(?:border(?:-(?:top|left|right|bottom))?-style)$/.test(property) ? /^(?:none|solid|dashed|dotted)$/.test(value)
      : property === "box-sizing" ? /^(?:border-box|content-box)$/.test(value)
      : property === "text-align" ? /^(?:left|right|center)$/.test(value) : false;
    if (!allowed || style.getPropertyPriority(property)) style.removeProperty(property);
  }
  data.attrValue = style.cssText;
  data.keepAttr = !!data.attrValue;
});
export const sanitizeMathHTML = (html: string, editor = false) => sanitizer.sanitize(html,
  { FORBID_TAGS: ["a", "img", "iframe", "object", "style"], FORBID_ATTR: ["href", "src"],
    // MathLive's internal keyboard sink needs native beforeinput/composition events.
    // Static formula previews never receive an editable surface.
    ADD_ATTR: editor ? ["contenteditable"] : [] });
MathfieldElement.fontsDirectory = "/mathlive/0.110.0/fonts";
MathfieldElement.soundsDirectory = null;
MathfieldElement.computeEngine = null;
MathfieldElement.createHTML = html => sanitizeMathHTML(html, true);
const inertMacros = Object.fromEntries(["href", "htmlData", "class", "htmlClass", "cssId", "htmlId", "style", "htmlStyle"]
  .map(name => [name, { args: 2, def: "#2" }]));
export function formulaMarkup(value: string) {
  return sanitizeMathHTML(convertLatexToMarkup(value, { macros: inertMacros }));
}

export function createMathField(value: string, readOnly: boolean, label: string) {
  const field = new MathfieldElement();
  field.mathVirtualKeyboardPolicy = "manual";
  field.readOnly = readOnly;
  if (readOnly) field.tabIndex = -1;
  // The setter defers safely and MathLive merges its built-ins; the getter requires mounting.
  field.macros = inertMacros;
  field.setAttribute("aria-label", label);
  // The shadow tree contains the actual textbox and keyboard controls.
  field.setAttribute("role", "group");
  field.value = value;
  return field;
}
