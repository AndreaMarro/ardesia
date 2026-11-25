# Primary independent force geometry

The applied force is tangential. On the retained-contact branch, normal acceleration vanishes and weight projection perpendicular to the ramp is −mg cosθ. Therefore N=mg cosθ>0 throughout m∈[0.5,5] kg and θ∈[0,55]°. It is independent of a tangential F∈[−25,25] N. Tangential weight component is −mg sinθ. This review does not validate the separately withdrawn friction-domain issue.

In screen coordinates, x increases right and y increases down. The uphill unit tangent is t=(cosθ,−sinθ), and outward normal is n=(−sinθ,−cosθ). Weight is P=(0,mg), normal reaction is Nn, and tangential weight projection is (P·t)t. Hence P·t=−mg sinθ and P·n=−mg cosθ.

For any common positive drawing scale k, vectors must be kP=(0,kmg), kNn=(−kmg sinθ cosθ,−kmg cos²θ), and kP_parallel=(−kmg sinθ cosθ,kmg sin²θ). Subtract the drawn reaction normal from the drawn parallel weight component to reconstruct the drawn weight exactly. Their modulus ratios to weight are cosθ and sinθ, and they are mutually orthogonal. Common rescaling may normalize the weight arrow, but then no cross-trial absolute length comparison in newtons is implied.

The rendered ramp edge must use the same t, not a separate shifted line. Every arrowhead should point backward from the tip, fit behind it without crossing the tail, and remain visible inside the SVG viewport. A correct numerical endpoint outside the viewport is not a correct visible force diagram. Labels must occupy a separate band rather than intersecting shafts. These geometric conditions are additional to numerical force ratios.

For the read 11bb1e6 edition, k=42/(mg) makes the weight 42 SVG units, normal length42 cosθ and tangential component length42 sinθ. At θ=0 the block is(225,159), so the weight endpoint(225,201) lies beyond the viewBox bottom198. The new label spans x22..291.66 and y173.5..190 in the browser, intersecting that shaft. At θ55 the separate ramp-edge origin(75,160), rather than(85,159), also alters the visible ramp direction and crosses the top label. These are read and rendered findings, not failures of the newly unified algebraic force scale.
