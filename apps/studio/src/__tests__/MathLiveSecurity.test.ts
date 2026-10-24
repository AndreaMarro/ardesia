// @vitest-environment jsdom
import { expect, it } from "vitest"
import { convertLatexToMarkup } from "mathlive/ssr"

it("does not turn an untrusted enclose shadow value into an SVG event handler", () => {
  const markup = convertLatexToMarkup(String.raw`\enclose{updiagonalstrike}[shadow="x onload=alert(1)"]{x}`)
  // Inert template only: no handler/script is executed and no URL is fetched.
  const template = document.createElement("template")
  template.innerHTML = markup
  expect(template.content.querySelector("svg")).not.toBeNull()
  const eventAttributes = [...template.content.querySelectorAll("*")].flatMap((element) =>
    [...element.attributes].filter((attribute) => /^on/i.test(attribute.name)).map((attribute) => attribute.name))
  expect(eventAttributes).toEqual([])
})
