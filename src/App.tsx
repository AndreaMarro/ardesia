import Room from "./Room"
import ElabBlinkDemo from "./design/ElabBlinkDemo"
import { isElabBlinkDemo } from "./store/elabBlinkDemo"

export default function App() {
  if (isElabBlinkDemo()) return <ElabBlinkDemo />
  return <Room />
}
