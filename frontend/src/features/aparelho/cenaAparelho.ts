type Ponto3D = [number, number, number]

export type Alvo = { x: number; y: number; id: number; polygon: number[][] }

// Geometria didática do painel. O teste de profundidade mantém as faces visíveis durante o giro.
const faces: { vertices: Ponto3D[]; cor: string }[] = []
const labels: { x: number; y: number; z: number; t: string; id: number; side: number; w: number; h: number }[] = []
function face(vertices: Ponto3D[], cor: string) {
  faces.push({ vertices, cor })
}
function label(x: number, y: number, z: number, t: string, id = 0, side = 1, w = 23, h = 18) {
  labels.push({ x, y, z, t, id, side, w, h })
}
function box(x: number, y: number, z: number, w: number, h: number, d: number, colors: string[]) {
  const a = x - w / 2,
    b = x + w / 2,
    c = y - h / 2,
    e = y + h / 2,
    f = z - d / 2,
    g = z + d / 2
  const p: Ponto3D[] = [
    [a, c, f],
    [b, c, f],
    [b, e, f],
    [a, e, f],
    [a, c, g],
    [b, c, g],
    [b, e, g],
    [a, e, g],
  ]
  ;[
    [4, 5, 6, 7],
    [1, 0, 3, 2],
    [0, 4, 7, 3],
    [5, 1, 2, 6],
    [0, 1, 5, 4],
    [7, 6, 2, 3],
  ].forEach((q, i) =>
    face(
      q.map((j) => p[j]),
      colors[i] || colors[0],
    ),
  )
}
function shell(
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  r: number,
  front: string,
  back: string,
) {
  const ring = []
  for (let i = 0; i < 4; i++)
    for (let s = 0; s <= 6; s++) {
      const a = (i * Math.PI) / 2 + (s * Math.PI) / 12
      ring.push([
        x + Math.sign(Math.cos((i * Math.PI) / 2 + Math.PI / 4)) * (w / 2 - r) + Math.cos(a) * r,
        y + Math.sign(Math.sin((i * Math.PI) / 2 + Math.PI / 4)) * (h / 2 - r) + Math.sin(a) * r,
      ])
    }
  const a: Ponto3D[] = ring.map(([x, y]) => [x, y, z + d / 2]),
    b: Ponto3D[] = ring.map(([x, y]) => [x, y, z - d / 2])
  face(a, front)
  face(b, back)
  for (let i = 0; i < a.length; i++) {
    const j = (i + 1) % a.length
    face([a[i], a[j], b[j], b[i]], i < 14 ? '#233c50' : '#657d8f')
  }
}
{
  shell(0, 0, 0, 146, 236, 38, 17, '#e6edf2', '#bfced7')
  shell(0, 0, 20, 133, 221, 5, 13, '#233b53', '#344b5d')
  shell(0, -65, 24, 111, 66, 5, 7, '#101d29', '#101d29')
  shell(0, -65, 28, 101, 53, 3, 4, '#a6bdb1', '#819d92')
  label(0, -65, 30, '', 3, 1, 104, 54)
  const key = (x: number, y: number, t: string, id: number, w = 29, h = 19, color = '#e0e8ee') => {
    shell(x, y, 26, w, h, 6, Math.min(w, h) * 0.43, color, '#8193a5')
    label(x, y, 30, t, id, 1, w, h)
  }
  key(0, 6, '+', 4)
  key(0, 57, '−', 4)
  key(-32, 32, '‹', 5)
  key(32, 32, '›', 5)
  key(0, 32, '', 6, 24, 24, '#56ceb5')
  ;[-48, 48].forEach((x) => {
    key(x, -18, '▴', 7, 22)
    key(x, 5, '▾', 7, 22)
  })
  key(47, 80, '⏻', 1, 22)
  key(-48, 54, '', 2, 8, 8, '#e9b162')
  key(0, -22, '', 8, 8, 8, '#76c8b7')
  label(0, 96, 27, 'NEURODYN PORTABLE')
  box(0, -39, -23, 34, 66, 9, ['#9aafb9', '#91a8b4'])
  label(0, -39, -29, 'Clip para cinto', 9, -1, 34, 66)
  box(0, 15, -21, 75, 24, 5, ['#f2f7fa'])
  label(0, 15, -25, 'Etiqueta técnica', 10, -1, 75, 24)
  box(0, 70, -22, 122, 60, 6, ['#a8bdc6', '#a0b8c2'])
  label(0, 70, -27, 'Compartimento da bateria', 11, -1, 122, 60)
  ;[-1, 1].forEach((side) => {
    const x = side * 74
    box(x, -18, 0, 7, 20, 19, ['#142538'])
    if (side === 1) box(x, 23, 0, 7, 20, 19, ['#142538'])
    label(
      x + side * 5,
      -18,
      0,
      side === 1 ? 'Canal 1' : 'Fonte de alimentação',
      side === 1 ? 12 : 14,
      side === 1 ? 2 : -2,
    )
    if (side === 1) label(x + 5, 23, 0, 'Canal 2', 13, 2)
  })
}
export function criarCena(cv: HTMLCanvasElement, aoPerderContexto: () => void) {
  const contexto = cv.getContext('2d')
  if (!contexto) return null
  const ctx = contexto
  let yaw = 0,
    pitch = 0,
    zoom = 1
  function project([x, y, z]: Ponto3D): Ponto3D {
    const u = x * Math.cos(yaw) + z * Math.sin(yaw),
      v = z * Math.cos(yaw) - x * Math.sin(yaw)
    const depth = v * Math.cos(pitch) + y * Math.sin(pitch)
    const scale = (zoom * 280) / (390 - depth)
    return [u * scale, (y * Math.cos(pitch) - v * Math.sin(pitch)) * scale, depth]
  }
  const surface = document.createElement('canvas')
  surface.addEventListener('webglcontextlost', aoPerderContexto)
  const gl = surface.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true })
  function createDeviceRenderer(gl: WebGLRenderingContext) {
    const program = gl.createProgram()
    if (!program) return null
    for (const [type, source] of [
      [
        gl.VERTEX_SHADER,
        'attribute vec3 point;attribute vec3 tint;varying vec3 color;void main(){gl_Position=vec4(point,1.0);color=tint;}',
      ],
      [
        gl.FRAGMENT_SHADER,
        'precision mediump float;varying vec3 color;void main(){gl_FragColor=vec4(color,1.0);}',
      ],
    ] as const) {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null
      gl.attachShader(program, shader)
    }
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    for (const [name, offset] of [
      ['point', 0],
      ['tint', 12],
    ] as const) {
      const attr = gl.getAttribLocation(program, name)
      gl.enableVertexAttribArray(attr)
      gl.vertexAttribPointer(attr, 3, gl.FLOAT, false, 24, offset)
    }
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clearColor(0, 0, 0, 0)
    const triangles = faces.flatMap(({ vertices, cor }) => {
      const tint = [1, 3, 5].map((i) => parseInt(cor.slice(i, i + 2), 16) / 255)
      return vertices
        .slice(1, -1)
        .flatMap((p, i) => [vertices[0], p, vertices[i + 2]].map((point) => ({ point, tint })))
    })
    const data = new Float32Array(triangles.length * 6)
    return (w: number, h: number) => {
      if (surface.width !== cv.width || surface.height !== cv.height) {
        surface.width = cv.width
        surface.height = cv.height
      }
      gl.viewport(0, 0, surface.width, surface.height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      triangles.forEach(({ point, tint }, i) => {
        const [x, y, depth] = project(point)
        data.set([(2 * x) / w, (-2 * y) / h, -depth / 200, ...tint], i * 6)
      })
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
      gl.drawArrays(gl.TRIANGLES, 0, triangles.length)
      ctx.drawImage(surface, -w / 2, -h / 2, w, h)
    }
  }
  const drawDevice = gl && createDeviceRenderer(gl)
  if (!drawDevice) return null
  return function desenhar(angulo: number, inclinacao: number, escala: number, selecionado: number | null) {
    yaw = angulo
    pitch = inclinacao
    zoom = escala
    const active = selecionado
    const w = cv.clientWidth,
      h = cv.clientHeight,
      dpr = devicePixelRatio || 1
    cv.width = Math.round(w * dpr)
    cv.height = Math.round(h * dpr)
    ctx.scale(dpr, dpr)
    ctx.translate(w / 2, h / 2)

    const shadow = ctx.createRadialGradient(0, 0, 3, 0, 0, 95)
    shadow.addColorStop(0, '#050f1b99')
    shadow.addColorStop(1, '#050f1b00')
    ctx.save()
    ctx.translate(0, 115)
    ctx.scale(1, 0.21)
    ctx.fillStyle = shadow
    ctx.fillRect(-100, -100, 200, 200)
    ctx.restore()
    drawDevice(w, h)
    const visible: Alvo[] = []
    const callouts = []
    for (const l of labels) {
      const normal = l.side === 2 ? -Math.sin(yaw) : l.side === -2 ? Math.sin(yaw) : l.side * Math.cos(yaw)
      if (normal < 0.075) continue
      const [x, y] = project([l.x, l.y, l.z])
      const coords =
        Math.abs(l.side) === 2
          ? [
              [0, -10, -10],
              [0, -10, 10],
              [0, 10, 10],
              [0, 10, -10],
            ]
          : [
              [-l.w / 2, -l.h / 2, 0],
              [l.w / 2, -l.h / 2, 0],
              [l.w / 2, l.h / 2, 0],
              [-l.w / 2, l.h / 2, 0],
            ]
      const polygon = coords.map(([dx, dy, dz]) => project([l.x + dx, l.y + dy, l.z + dz]))
      if (l.id) visible.push({ x, y, id: l.id, polygon })
      if (l.id === active && active) {
        ctx.beginPath()
        polygon.forEach(([u, v], i) => (i ? ctx.lineTo(u, v) : ctx.moveTo(u, v)))
        ctx.closePath()
        ctx.strokeStyle = '#ffda88'
        ctx.lineWidth = 2
        ctx.stroke()
      }
      if (l.id >= 9) {
        if (Math.abs(l.side) === 1 || normal > 0.35 || l.id === active) callouts.push({ ...l, px: x, py: y })
        continue
      }
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = 'bold ' + 8 * Math.min(zoom, 1.5) + 'px system-ui'
      if (l.t && normal > 0.16) {
        ctx.fillStyle = l.id ? '#263b50' : '#fff'
        ctx.fillText(l.t, x, y)
      }
    }
    callouts.sort((a, b) => a.py - b.py)
    let preceding = -h / 2
    for (const l of callouts) {
      ctx.font = '600 11px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const width = ctx.measureText(l.t).width + 16
      const right = Math.abs(l.side) === 2 ? l.px >= 0 : l.id !== 10
      const min = -w / 2 + width / 2 + 8,
        max = w / 2 - width / 2 - 8
      const x = Math.max(min, Math.min(max, l.px + (right ? 1 : -1) * (width / 2 + 25)))
      const y = Math.min(h / 2 - 12, Math.max(l.py, preceding + 24))
      preceding = y
      ctx.strokeStyle = '#91b8d2'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(l.px, l.py)
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.roundRect(x - width / 2, y - 10, width, 20, 6)
      ctx.fillStyle = l.id === active ? '#ffda88' : '#162a40'
      ctx.fill()
      ctx.fillStyle = l.id === active ? '#182637' : '#e8f2fa'
      ctx.fillText(l.t, x, y)
      visible.push({
        x,
        y,
        id: l.id,
        polygon: [
          [x - width / 2, y - 10],
          [x + width / 2, y - 10],
          [x + width / 2, y + 10],
          [x - width / 2, y + 10],
        ],
      })
    }
    return visible
  }
}
