import Room from "./Room"
import ReferenceBlinkDemo from "./design/ReferenceBlinkDemo"
import { isReferenceBlinkDemo } from "./store/referenceBlinkDemo"

export default function App() {
  if (isReferenceBlinkDemo()) return <ReferenceBlinkDemo />
  return <Room />
}
