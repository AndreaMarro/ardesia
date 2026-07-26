// I componenti disegnano SOLO con i token --m-* di index.css/tokens.css: senza
// questo import lo snapshot mostrerebbe un fallback che nell'app non esiste mai.
import "../src/index.css"

import type { Preview } from "@storybook/react-vite"

const preview: Preview = {
  parameters: {
    // Viewport FISSI: un diff visuale ha senso solo se la larghezza non cambia
    // fra una run e l'altra. 768 = lavagna su tablet/LIM, 1280 = desktop docente.
    chromatic: {
      viewports: [768, 1280],
      // Nessuna accettazione automatica: ogni differenza e' evidenza da giudicare,
      // mai un verdetto (D-CHROMATIC, invariante 4). Il flag vive anche nel job CI:
      // qui e' ridondanza deliberata, non duplicazione di logica.
      pauseAnimationAtEnd: true,
    },
  },
}

export default preview
