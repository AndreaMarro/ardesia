import * as T from '../../vendor/three-r180/three.module.min.js';
import { posizionaEtichetta } from './etichette.js';
import { OrbitControls } from '../../vendor/three-r180/OrbitControls.js';
const v = (p) => new T.Vector3(...p);
export const ink = 0x302a3e,
  metal = 0x786d87,
  ivory = 0xfff4d5,
  violet = 0x7151be,
  brass = 0xd7983d,
  teal = 0x217e81,
  red = 0xbc4b51,
  lime = 0xbdcf55,
  glass = 0x87d8df;
function instruments(root) {
  const materials = new Map(),
    labels = [];
  function material(color, opacity = 1) {
    const key = color + '/' + opacity;
    if (!materials.has(key))
      materials.set(
        key,
        new T.MeshStandardMaterial({
          color,
          roughness: color === metal || color === brass ? 0.32 : 0.68,
          metalness: color === metal || color === brass ? 0.42 : 0.04,
          side: T.DoubleSide,
          transparent: opacity < 1,
          opacity,
          depthWrite: opacity === 1,
        }),
      );
    return materials.get(key);
  }
  function mesh(geometry, color, position, group = root, opacity = 1) {
    const object = new T.Mesh(geometry, material(color, opacity));
    object.position.copy(v(position));
    group.add(object);
    return object;
  }
  function box(p, size, color, group, opacity) {
    return mesh(new T.BoxGeometry(...size), color, p, group, opacity);
  }
  function ball(p, r, color, group, opacity) {
    return mesh(new T.SphereGeometry(r, 24, 16), color, p, group, opacity);
  }
  function rod(a, b, r, color, group, opacity = 1, endRadius = r, openEnded = false) {
    const start = v(a),
      end = v(b),
      axis = end.clone().sub(start);
    const obj = mesh(
      new T.CylinderGeometry(endRadius, r, Math.max(0.0001, axis.length()), 32, 1, openEnded),
      color,
      start.lerp(end, 0.5).toArray(),
      group,
      opacity,
    );
    if (axis.lengthSq()) obj.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), axis.normalize());
    return obj;
  }
  function line(points, color, group = root, dashed = false) {
    const geometry = new T.BufferGeometry().setFromPoints(points.map(v));
    const mat = dashed
      ? new T.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08 })
      : new T.LineBasicMaterial({ color });
    const path = new T.Line(geometry, mat);
    if (dashed) path.computeLineDistances();
    group.add(path);
    return path;
  }
  function arrow(a, b, color, group = root, thin = 0.028) {
    const d = v(b).sub(v(a)),
      len = d.length();
    if (len < 0.012) return;
    const joint = v(b)
      .addScaledVector(d.normalize(), -Math.min(0.24, len * 0.32))
      .toArray();
    rod(a, joint, thin, color, group);
    rod(joint, b, thin * 2.9, color, group, 1, 0);
  }
  function label(p, txt, color = ink, group = root) {
    const cn = document.createElement('canvas'),
      ctx = cn.getContext('2d');
    ctx.font = '600 42px Arial';
    cn.width = Math.ceil(ctx.measureText(txt).width) + 32;
    cn.height = 68;
    ctx.fillStyle = '#fffcef';
    ctx.fillRect(0, 0, cn.width, 68);
    ctx.fillStyle = '#' + new T.Color(color).getHexString();
    ctx.font = '600 42px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, 16, 35);
    const tex = new T.CanvasTexture(cn);
    tex.colorSpace = T.SRGBColorSpace;
    tex.minFilter = T.LinearFilter;
    const sprite = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false }));
    sprite.renderOrder = 6;
    sprite.position.copy(v(p));
    sprite.scale.set((0.33 * cn.width) / 68, 0.33, 1);
    sprite.userData.textAspect = cn.width / cn.height;
    labels.push(sprite);
    group.add(sprite);
    return sprite;
  }
  function group(parent = root) {
    const g = new T.Group();
    parent.add(g);
    return g;
  }
  function ring(center, r, plane, color, parent = root) {
    const pts = Array.from({ length: 65 }, (_, i) => {
      const a = (i * Math.PI) / 32,
        c = r * Math.cos(a),
        s = r * Math.sin(a);
      return v(center)
        .add(v(plane === 'yz' ? [0, c, s] : plane === 'xy' ? [c, s, 0] : [c, 0, s]))
        .toArray();
    });
    return line(pts, color, parent);
  }
  function base(w, d, color = ivory, y = 0) {
    const cn = document.createElement('canvas');
    cn.width = cn.height = 96;
    const ctx = cn.getContext('2d');
    const gradient = ctx.createRadialGradient(48, 48, 5, 48, 48, 48);
    gradient.addColorStop(0, 'rgba(57,44,72,0.30)');
    gradient.addColorStop(0.7, 'rgba(57,44,72,0.17)');
    gradient.addColorStop(1, 'rgba(57,44,72,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 96, 96);
    const shadow = new T.Mesh(
      new T.PlaneGeometry(w * 1.42, d * 1.74),
      new T.MeshBasicMaterial({ map: new T.CanvasTexture(cn), transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0.09, y - 0.17, 0.065);
    root.add(shadow);
    box([0, y - 0.11, 0], [w, 0.22, d], color);
    for (const x of [-w / 2 + 0.26, w / 2 - 0.26])
      for (const z of [-d / 2 + 0.24, d / 2 - 0.24]) rod([x, y - 0.145, z], [x, y + 0.006, z], 0.07, metal);
  }
  function surface(positions, indices, color, opacity = 1, colors) {
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const obj = mesh(geo, color, [0, 0, 0], root, opacity);
    if (colors) {
      geo.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
      obj.material = obj.material.clone();
      obj.material.vertexColors = true;
    }
    return obj;
  }
  return { T, box, ball, rod, line, arrow, label, group, ring, base, surface, material, materials, labels };
}
function release(group, palette) {
  const geometries = new Set(),
    materials = new Set(palette?.values()),
    textures = new Set();
  group.traverse((o) => {
    if (o.geometry) geometries.add(o.geometry);
    if (o.material) materials.add(o.material);
  });
  for (const m of materials) if (m.map) textures.add(m.map);
  for (const collection of [textures, materials, geometries]) for (const r of collection) r.dispose();
  group.clear();
}
export function openScene(canvas, spec, onLoss, context, onRestore) {
  const renderer = new T.WebGLRenderer({
    canvas,
    context,
    antialias: true,
    alpha: false,
    powerPreference: 'low-power',
  });
  const scene = new T.Scene();
  scene.background = new T.Color(spec.bg || 0xf0efdf);
  const camera = new T.OrthographicCamera(-4, 4, 2, -2, 0.05, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.cursor.fromArray(spec.target);
  controls.maxTargetRadius = Math.min(spec.width, spec.height) / 4;
  controls.minZoom = 0.65;
  controls.maxZoom = 3;
  controls.maxPolarAngle = Math.PI * 0.93;
  const hemi = new T.HemisphereLight(0xfff8e7, 0x7b7294, 1.6);
  scene.add(hemi);
  const key = new T.DirectionalLight(0xfff0d8, 2.25);
  key.position.set(...(spec.light || [-4, 8, 5]));
  scene.add(key);
  const rim = new T.DirectionalLight(0xc8d4ff, 1.15);
  rim.position.set(4, 2, -4);
  scene.add(rim);
  const root = new T.Group();
  scene.add(root);
  let palette,
    action,
    currentTime = 0,
    shown = false,
    closed = false,
    lost = false,
    bufferRatio = 0,
    view = 'orbit';
  let labels = [],
    cssWidth = 0,
    cssHeight = 0;
  const projected = new T.Vector3();
  function render() {
    if (!shown || closed || lost || !canvas.isConnected || document.hidden || !cssHeight) return;
    const pixels = (cssHeight * camera.zoom) / (camera.top - camera.bottom);
    const occupied = [];
    camera.updateMatrixWorld();
    for (const tag of labels) {
      if (!tag.visible || !tag.parent.visible) continue;
      const aspect = tag.userData.textAspect,
        h = Math.max(20, 0.33 * pixels),
        w = h * aspect;
      tag.scale.set(w / pixels, h / pixels, 1);
      tag.getWorldPosition(projected).project(camera);
      const x = ((1 + projected.x) * cssWidth) / 2,
        y = ((1 - projected.y) * cssHeight) / 2;
      tag.center.set(0.5, 0.5);
      if (x < 0 || x > cssWidth || y < 0 || y > cssHeight) continue;
      // Sprite centres shift the text on screen without moving the physical anchor.
      const box = posizionaEtichetta(x, y, w, h, cssWidth, cssHeight, occupied);
      tag.center.set(0.5 + (x - box.x) / w, 0.5 + (box.y - y) / h);
    }
    renderer.render(scene, camera);
  }
  function resize() {
    const width = canvas.clientWidth,
      height = canvas.clientHeight;
    if (lost || closed || !width || !height) return;
    // Budget the instrument itself in device pixels, including in concentration mode.
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1_000_000 / (width * height)));
    if (width === cssWidth && height === cssHeight && ratio === bufferRatio) return;
    cssWidth = width;
    cssHeight = height;
    bufferRatio = ratio;
    renderer.setDrawingBufferSize(width, height, ratio);
    const aspect = width / height,
      span = Math.max(spec.height, spec.width / aspect);
    camera.left = (-span * aspect) / 2;
    camera.right = -camera.left;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.updateProjectionMatrix();
    render();
  }
  function setView(name = 'orbit') {
    view = name;
    const target = v(spec.target),
      direction = v(
        name === 'top' ? [0, 1, 0.00001] : name === 'side' || name === 'section' ? [0, 0, 1] : spec.eye,
      );
    camera.up.set(0, 1, 0);
    camera.position.copy(target).addScaledVector(direction.normalize(), 14);
    controls.target.copy(target);
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    controls.update();
    render();
  }
  function zoom(factor) {
    camera.zoom = T.MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom);
    camera.updateProjectionMatrix();
    render();
  }
  function keydown(e) {
    if (['+', '=', '-', 'Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key))
      e.preventDefault();
    else return;
    if (e.key === 'Home') return setView(view);
    if (['+', '=', '-'].includes(e.key)) return zoom(e.key === '-' ? 1 / 1.15 : 1.15);
    if (e.shiftKey) {
      camera.updateMatrixWorld();
      const horizontal = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
      const sign = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 1;
      const distance = (camera.top - camera.bottom) * 0.06 / camera.zoom;
      const delta = new T.Vector3().setFromMatrixColumn(camera.matrixWorld, horizontal ? 0 : 1)
        .multiplyScalar(sign * distance);
      camera.position.add(delta);
      controls.target.add(delta);
      controls.update();
      return;
    }
    const offset = camera.position.clone().sub(controls.target),
      s = new T.Spherical().setFromVector3(offset);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') s.theta += (e.key === 'ArrowLeft' ? -1 : 1) * 0.12;
    else
      s.phi = T.MathUtils.clamp(s.phi + (e.key === 'ArrowUp' ? -1 : 1) * 0.12, 0.01, controls.maxPolarAngle);
    camera.position.copy(controls.target).add(offset.setFromSpherical(s));
    controls.update();
    render();
  }
  function loss(e) {
    e.preventDefault();
    if (closed || lost) return;
    lost = true;
    onLoss();
  }
  function restore() {
    if (closed || !lost) return;
    // Three registers its own restore listener during construction and rebuilds its GL state first.
    lost = false;
    bufferRatio = 0;
    onRestore?.();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  canvas.addEventListener('keydown', keydown);
  canvas.addEventListener('webglcontextlost', loss);
  canvas.addEventListener('webglcontextrestored', restore);
  controls.addEventListener('change', render);
  setView();
  resize();
  return {
    rebuild(build, p, s, stage) {
      release(root, palette);
      const tools = instruments(root);
      palette = tools.materials;
      labels = tools.labels;
      action = build(tools, p, s, stage, view);
      action?.(currentTime);
      render();
    },
    frame(t) {
      currentTime = t;
      action?.(t);
      render();
    },
    visible(value) {
      shown = value;
      if (value) {
        resize();
        render();
      }
    },
    view: setView,
    gestures(enabled) {
      controls.enabled = enabled;
      canvas.style.touchAction = enabled ? 'none' : 'pan-y';
    },
    zoom,
    dispose() {
      if (closed) return;
      closed = true;
      resizeObserver.disconnect();
      controls.removeEventListener('change', render);
      controls.dispose();
      canvas.removeEventListener('keydown', keydown);
      canvas.removeEventListener('webglcontextlost', loss);
      canvas.removeEventListener('webglcontextrestored', restore);
      release(root, palette);
      renderer.dispose();
      if (!lost) renderer.forceContextLoss();
    },
  };
}
