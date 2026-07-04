import Room from "./Room"
import ReferenceBlinkDemo from "./design/ReferenceBlinkDemo"
import ToolLab from "./design/ToolLab"
import { isReferenceBlinkDemo } from "./store/referenceBlinkDemo"
import { isToolLabView } from "./store/toolLabView"

export default function App() {
  if (isToolLabView()) return <ToolLab />
  if (isReferenceBlinkDemo()) return <ReferenceBlinkDemo />
  return <Room />
}
