/* Yusr website v4 — plain JS, no libraries. Screens are real app screenshots (folder s/). */
(function () {
'use strict';
var CFG = {
  hero: [['welcome', 'شاشة يُسر الأولى'], ['home', 'الشاشة الرئيسية'], ['listing', 'صفحة عقار'], ['job', 'صفحة فرصة عمل'], ['chalet', 'شاليه للإيجار'], ['showroom', 'معرض مركبات']],
  arc: ['welcome', 'listing', 'home', 'chalet', 'job', 'showroom', 'apartment', 'cv', 'project', 'search', 'malki', 'applicant', 'tourhub', 'studio', 'developer'],
  rooms: [['living', 'الصالة', -1.9], ['dining', 'المطبخ والسفرة', -2.6], ['bedroom', 'غرفة النوم', 1.25]]
};
if (window.YUSR_CFG) for (var k in window.YUSR_CFG) CFG[k] = window.YUSR_CFG[k];

var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
var lerp = function (a, b, t) { return a + (b - a) * t; };
var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function pinProgress(el) { var h = el.offsetHeight - window.innerHeight; return h > 0 ? clamp(-el.getBoundingClientRect().top / h) : 0; }
function onView(el, cb, margin) {
  if (!('IntersectionObserver' in window)) { cb(true); return; }
  new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.isIntersecting); }); }, { rootMargin: margin || '200px' }).observe(el);
}

/* دخول ناعم */
$$('.tiles .tile, .facts div').forEach(function (el, i) { el.style.setProperty('--i', i % 4); });
if ('IntersectionObserver' in window && !reduce) {
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(function (el) { io.observe(el); });
} else $$('.rv').forEach(function (el) { el.classList.add('in'); });

/* 1 · الافتتاحية: هاتف مائل يستوي ويصعد فوق العنوان */
var hero = $('#hero'), rig = $('#rig'), title = $('#title'), heroScreen = $('#heroScreen');
if (!$('img', heroScreen)) CFG.hero.forEach(function (h, i) {
  var im = new Image(); im.src = 's/' + h[0] + '.webp'; im.alt = h[1]; if (!i) im.className = 'on'; heroScreen.appendChild(im);
});
(function () {
  var imgs = $$('img', heroScreen), n = 0;
  if (imgs.length > 1) setInterval(function () { imgs[n].classList.remove('on'); n = (n + 1) % imgs.length; imgs[n].classList.add('on'); }, 3200);
})();
var hCur = 0, hTarget = 0;
function heroFrame() {
  hCur += (hTarget - hCur) * .12; if (Math.abs(hTarget - hCur) < .0005) hCur = hTarget;
  var p = ease(hCur), lift = -Math.min(72, hero.offsetHeight * .075) * p;
  rig.style.transform = 'translateY(' + lift.toFixed(1) + 'px) scale(' + (.94 + .06 * p).toFixed(4) + ') rotateX(' + (22 * (1 - p)).toFixed(2) + 'deg)';
  title.style.transform = 'translateY(' + (-40 * p).toFixed(1) + 'px)'; title.style.opacity = (1 - .35 * p).toFixed(3);
  return hCur !== hTarget;
}

/* 2 · شريط الشاشات: تنحني من طرف، تستوي في الوسط، وتغيب عند الطرف الآخر */
var arc = $('#arc'), arcX = 0, arcVel = 0, arcDrag = null, arcLive = false, cards = [];
CFG.arc.concat(CFG.arc).forEach(function (name) {
  var f = document.createElement('figure'); f.className = 'card';
  var im = new Image(); im.src = 's/' + name + '.webp'; im.alt = ''; im.loading = 'lazy'; im.draggable = false;
  f.appendChild(im); arc.appendChild(f); cards.push(f);
});
function arcFrame() {
  var W = arc.clientWidth, cw = cards[0].offsetWidth, step = cw * 1.1, total = cards.length * step, half = W / 2;
  if (!arcDrag) { if (!reduce) arcX += .45; arcX += arcVel; arcVel *= .94; if (Math.abs(arcVel) < .05) arcVel = 0; }
  for (var i = 0; i < cards.length; i++) {
    var c = (((i * step - arcX) % total) + total) % total - total / 2;
    var d = c / Math.max(half, cw * 1.6), a = Math.abs(d);
    if (a > 1.7) { cards[i].style.opacity = 0; continue; }
    cards[i].style.opacity = clamp((1.5 - a) / .45).toFixed(3);
    cards[i].style.transform = 'translate(-50%,-50%) translate3d(' + (c * (1 - .1 * a * a)).toFixed(1) + 'px,0,' + (d * d * 170).toFixed(1) + 'px) rotateY(' + (-d * 42).toFixed(2) + 'deg)';
    cards[i].style.zIndex = 100 - Math.round(a * 50);
  }
}
arc.addEventListener('pointerdown', function (e) { arcDrag = { x: e.clientX, last: e.clientX, v: 0 }; arc.classList.add('drag'); try { arc.setPointerCapture(e.pointerId); } catch (_) {} });
arc.addEventListener('pointermove', function (e) { if (!arcDrag) return; var dx = e.clientX - arcDrag.last; arcDrag.last = e.clientX; arcX -= dx; arcDrag.v = -dx; });
function arcEnd() { if (arcDrag) { arcVel = arcDrag.v; arcDrag = null; arc.classList.remove('drag'); } }
arc.addEventListener('pointerup', arcEnd); arc.addEventListener('pointercancel', arcEnd);
onView(arc, function (on) { arcLive = on; kick(); });

/* 3 · العمل: هاتف ثابت وشاشته تتبدّل */
var workPin = $('#workPin'), stepEls = $$('#steps .step'), dotEls = $$('#dots i'), workImgs = $$('#workScreen img'), workIdx = 0;
function workSet(i) {
  if (i === workIdx) return; workIdx = i;
  stepEls.forEach(function (el, j) { el.classList.toggle('on', j === i); });
  dotEls.forEach(function (el, j) { el.classList.toggle('on', j === i); });
  workImgs.forEach(function (el, j) { el.classList.toggle('on', j === i); });
}

/* 4 · المسكن: إطار يكبر حتى يملأ الشاشة */
var grow = $('#grow'), frame = $('#frame'), growTitle = $('#growTitle'), tourUi = $('#tourUi'), growE = 0;
function growSet() {
  var st = frame.parentElement, vw = st.clientWidth, vh = st.clientHeight, p = pinProgress(grow);
  var e = reduce ? (p > .3 ? 1 : 0) : ease(clamp((p - .04) / .56));
  var t0 = growTitle.offsetTop + growTitle.offsetHeight + 26, w0 = Math.min(vw * .86, 880), h0 = Math.max(150, Math.min(vh - t0 - 24, w0 * .62));
  frame.style.width = lerp(w0, vw, e).toFixed(1) + 'px';
  frame.style.height = lerp(h0, vh, e).toFixed(1) + 'px';
  frame.style.transform = 'translate(-50%,' + lerp(t0, 0, e).toFixed(1) + 'px)';
  frame.style.borderRadius = lerp(28, 0, e).toFixed(1) + 'px';
  growTitle.style.opacity = (1 - clamp(e * 1.7)).toFixed(3);
  growTitle.style.transform = 'translateY(' + (-30 * e).toFixed(1) + 'px)';
  tourUi.classList.toggle('on', e > .9);
  growE = e;
}

/* WebGL: أدوات صغيرة */
function glOf(canvas, opts) { try { return canvas.getContext('webgl2', Object.assign({ antialias: true, premultipliedAlpha: true, alpha: true }, opts)); } catch (e) { return null; } }
function prog(gl, vs, fs) {
  function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
  var p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (var i = 0; i < n; i++) { var a = gl.getActiveUniform(p, i); u[a.name.replace('[0]', '')] = gl.getUniformLocation(p, a.name); }
  return { p: p, u: u };
}
function fit(c, max) {
  var d = Math.min(window.devicePixelRatio || 1, max || 2), w = Math.round(c.clientWidth * d), h = Math.round(c.clientHeight * d);
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return d;
}
function loadImg(src) { return new Promise(function (ok, no) { var i = new Image(); i.decoding = 'async'; i.onload = function () { ok(i); }; i.onerror = no; i.src = src; }); }

/* جولة 360: الشيدر نفسه الذي في التطبيق */
var pano = {
  room: 0, yaw: CFG.rooms[0][2], pitch: -0.04, gl: null, texA: null, texB: null, mix: 1, fadeT: 0, idle: 0, drag: null, cache: {},
  init: function () {
    var self = this, c = $('#pano'), gl = this.gl = glOf(c, { antialias: false });
    this.labels();
    if (!gl) { c.parentElement.style.background = 'url(pano/' + CFG.rooms[0][0] + '.jpg) center/cover'; return; }
    this.max = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this.pr = prog(gl, '#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}', '#version 300 es\nprecision highp float;\nuniform sampler2D uA,uB;uniform float uMix,uYaw,uPitch,uF;uniform vec2 uSize,uWA,uWB;out vec4 o;\nconst float PI=3.14159265;\nvec3 dirOf(vec2 p){vec3 d=normalize(vec3(p.x,p.y,-uF));float c=cos(uPitch),s=sin(uPitch);d=vec3(d.x,d.y*c-d.z*s,d.y*s+d.z*c);c=cos(uYaw);s=sin(uYaw);return vec3(d.x*c-d.z*s,d.y,d.x*s+d.z*c);}\nvec4 pick(sampler2D t,vec3 d,vec2 w){float y=atan(d.x,-d.z),p=asin(clamp(d.y,-1.,1.));float u=y/(2.*PI)+.5;if(w.x>.5){u=fract(u)*2.;if(u>1.)u=2.-u;}return textureLod(t,vec2(u,clamp(.5-p/w.y,0.,1.)),0.);}\nvoid main(){vec2 p=gl_FragCoord.xy-uSize*.5;vec3 d=dirOf(p);vec4 a=pick(uA,d,uWA),b=pick(uB,d,uWB);o=vec4(mix(a.rgb,b.rgb,uMix),1.);}');
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(this.pr.p, 'a'); this.vao = gl.createVertexArray(); gl.bindVertexArray(this.vao);
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.show(true);
    c.addEventListener('pointerdown', function (e) { self.drag = { x: e.clientX, y: e.clientY, yaw: self.yaw, pitch: self.pitch }; try { c.setPointerCapture(e.pointerId); } catch (_) {} self.idle = 0; });
    c.addEventListener('pointermove', function (e) {
      if (!self.drag) return; var f = self.focal();
      self.yaw = self.drag.yaw - (e.clientX - self.drag.x) / f;
      var lim = CFG.rooms[self.room][3] ? .16 : 1.2;
      self.pitch = clamp(self.drag.pitch + (e.clientY - self.drag.y) / f, -lim, lim);
    });
    var end = function () { self.drag = null; self.idle = 0; };
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
    c.tabIndex = 0;
    c.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') self.yaw -= .15; if (e.key === 'ArrowRight') self.yaw += .15; });
  },
  focal: function () { var c = $('#pano'); return (Math.max(c.clientWidth, c.clientHeight) / 2) / Math.tan((window.innerWidth < 700 ? 100 : 84) * Math.PI / 360); },
  tex: function (name) {
    var self = this, gl = this.gl;
    if (this.cache[name]) return Promise.resolve(this.cache[name]);
    return loadImg('pano/' + name + '.jpg').then(function (img) {
      var el = img;
      if (img.width > self.max) { var k = self.max / img.width, cv = document.createElement('canvas'); cv.width = self.max; cv.height = Math.round(img.height * k); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); el = cv; }
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return (self.cache[name] = t);
    });
  },
  show: function (first) {
    var self = this;
    return this.tex(CFG.rooms[this.room][0]).then(function (t) {
      var w = CFG.rooms[self.room][3] ? [1, CFG.rooms[self.room][3]] : [0, Math.PI];
      if (first || !self.texA) { self.texA = self.texB = t; self.wA = self.wB = w; self.mix = 1; }
      else { self.texA = self.texB; self.wA = self.wB; self.texB = t; self.wB = w; self.mix = 0; self.fadeT = performance.now(); }
    }).catch(function () {});
  },
  go: function (i) { if (i === this.room || !this.gl) return; this.room = i; this.yaw = CFG.rooms[i][2]; this.pitch = -0.04; this.show(false); this.labels(); },
  labels: function () {
    var self = this;
    $('#rooms').innerHTML = CFG.rooms.map(function (r, i) { return '<button type="button" data-room="' + i + '" class="' + (i === self.room ? 'on' : '') + '" aria-pressed="' + (i === self.room) + '">' + r[1] + '</button>'; }).join('');
  },
  frame: function (now) {
    var gl = this.gl; if (!gl || !this.texA) return;
    var c = $('#pano'), d = fit(c, 1.5), u = this.pr.u;
    if (!this.drag && !reduce) { this.idle++; if (this.idle > 90) this.yaw += 0.0009; }
    if (this.mix < 1) this.mix = clamp((now - this.fadeT) / 700);
    gl.viewport(0, 0, c.width, c.height); gl.useProgram(this.pr.p); gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.texA);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.texB);
    gl.uniform1i(u.uA, 0); gl.uniform1i(u.uB, 1); gl.uniform1f(u.uMix, this.mix);
    gl.uniform1f(u.uYaw, this.yaw); gl.uniform1f(u.uPitch, this.pitch); gl.uniform1f(u.uF, this.focal() * d);
    gl.uniform2f(u.uSize, c.width, c.height); gl.uniform2f(u.uWA, this.wA[0], this.wA[1]); gl.uniform2f(u.uWB, this.wB[0], this.wB[1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
};
$('#rooms').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pano.go(+b.dataset.room); });

/* السيارة: المجسّم نفسه الذي في التطبيق (YS3D) */
var STATES = [['ok', '#CFEBDD', 'سليم أصلي'], ['touch', '#F7E3A1', 'طلاء جزئي'], ['paint', '#F6C08A', 'مدهون'], ['new', '#A9C8F2', 'مبدّل'], ['rust', '#E99A9A', 'صدأ'], ['dmg', '#5B5F5E', 'متضرر']];
var PARTS = { f_bumper: 'المِصدّ الأمامي', hood: 'الغطاء الأمامي', fender_fl: 'الرفرف الأمامي الأيسر', fender_fr: 'الرفرف الأمامي الأيمن', roof: 'السقف', trunk: 'الصندوق الخلفي', r_bumper: 'المِصدّ الخلفي', door_fl: 'الباب الأمامي الأيسر', door_fr: 'الباب الأمامي الأيمن', door_rl: 'الباب الخلفي الأيسر', door_rr: 'الباب الخلفي الأيمن', quarter_rl: 'الرفرف الخلفي الأيسر', quarter_rr: 'الرفرف الخلفي الأيمن' };
var hex = function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); };
var m4 = {
  mul: function (a, b) { var o = new Float32Array(16); for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; },
  persp: function (f, asp, n, fa) { var t = 1 / Math.tan(f / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) / (n - fa), -1, 0, 0, 2 * fa * n / (n - fa), 0]); },
  ry: function (a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); },
  rx: function (a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); },
  tr: function (x, y, z) { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); }
};
var CAR_SMOOTH = window.YUSR_CS === undefined ? 0 : window.YUSR_CS, CAR_NSMOOTH = window.YUSR_CN === undefined ? 10 : window.YUSR_CN;
var car = {
  gl: null, model: null, states: { door_fl: 'paint', door_fr: 'paint', fender_fl: 'touch', quarter_rr: 'touch', hood: 'ok', trunk: 'new' }, sel: 'paint', yaw: 0.75, pitch: 0.2, drag: null, flash: 0, flashZone: 0, lastPart: null,
  init: function () {
    var self = this, c = $('#car'), gl = this.gl = glOf(c, { antialias: true });
    this.labels();
    if (!gl || !window.YUSR_CAR_SEDAN) { $('#carSum').textContent = ''; return; }
    this.pr = prog(gl, '#version 300 es\nin vec3 aP;in vec3 aN;in vec2 aT;in float aZ;uniform mat4 uVP,uM;out vec3 vN;out vec2 vT;out vec3 vW;flat out int vZ;\nvoid main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=mat3(uM)*aN;vT=aT;vZ=int(aZ+.5);gl_Position=uVP*w;}', '#version 300 es\nprecision highp float;in vec3 vN;in vec2 vT;in vec3 vW;flat in int vZ;uniform sampler2D uTex;uniform vec4 uCol[20];uniform int uFlash;uniform float uPulse;uniform vec3 uEye;out vec4 o;\nvoid main(){vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;vec3 base=texture(uTex,vT).rgb;vec4 st=vZ>0&&vZ<20?uCol[vZ]:vec4(0.);\nfloat l=max(dot(n,normalize(vec3(.4,.9,.5))),0.);vec3 V=normalize(uEye-vW);vec3 H=normalize(normalize(vec3(.4,.9,.5))+V);float sp=pow(max(dot(n,H),0.),48.)*.2;\nfloat rim=pow(1.-max(dot(n,V),0.),3.)*.35;vec3 sky=mix(vec3(.30,.27,.24),vec3(1.,.93,.82),n.y*.5+.5);\nvec3 alb=mix(base,st.rgb*(.74+.26*dot(base,vec3(.33))),st.a);vec3 c=alb*(sky*.55+l*.75)+sp+rim*vec3(1.,.8,.55);\nif(vZ==uFlash)c=mix(c,vec3(1.),uPulse*.35);o=vec4(c,1.);}');
    this.pk = prog(gl, '#version 300 es\nin vec3 aP;in float aZ;uniform mat4 uVP,uM;flat out int vZ;void main(){vZ=int(aZ+.5);gl_Position=uVP*uM*vec4(aP,1.);}', '#version 300 es\nprecision highp float;flat in int vZ;out vec4 o;void main(){o=vec4(float(vZ)/255.,0.,0.,1.);}');
    this.fbo = gl.createFramebuffer();
    this.load();
    c.addEventListener('pointerdown', function (e) { self.drag = { x: e.clientX, y: e.clientY, yaw: self.yaw, pitch: self.pitch, moved: 0 }; try { c.setPointerCapture(e.pointerId); } catch (_) {} });
    c.addEventListener('pointermove', function (e) {
      if (!self.drag) return; var dx = e.clientX - self.drag.x, dy = e.clientY - self.drag.y;
      self.drag.moved = Math.max(self.drag.moved, Math.hypot(dx, dy));
      self.yaw = self.drag.yaw + dx / 160; self.pitch = clamp(self.drag.pitch + dy / 300, -0.05, 0.7);
    });
    c.addEventListener('pointerup', function (e) { var d = self.drag; self.drag = null; if (d && d.moved < 6) self.tap(e); });
    c.addEventListener('pointercancel', function () { self.drag = null; });
  },
  load: function () {
    var self = this, gl = this.gl, s = atob(window.YUSR_CAR_SEDAN), u8 = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
    loadImg('car_sedan.jpg').then(function (img) {
      var m = self.parse(u8.buffer);
      m.vao = gl.createVertexArray(); gl.bindVertexArray(m.vao);
      var put = function (loc, data, size) { if (loc < 0) return; var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); };
      var P = self.pr.p;
      put(gl.getAttribLocation(P, 'aP'), m.pos, 3); put(gl.getAttribLocation(P, 'aN'), m.nor, 3); put(gl.getAttribLocation(P, 'aT'), m.uv, 2); put(gl.getAttribLocation(P, 'aZ'), m.zf, 1);
      var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.idx, gl.STATIC_DRAW);
      m.pvao = gl.createVertexArray(); gl.bindVertexArray(m.pvao);
      var K = self.pk.p; put(gl.getAttribLocation(K, 'aP'), m.pos, 3); put(gl.getAttribLocation(K, 'aZ'), m.zf, 1);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bindVertexArray(null);
      m.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, m.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      self.model = m; self.labels(); kick();
    }).catch(function (e) { if (window.console) console.warn('car', e); });
  },
  parse: function (buf) {
    var d = new DataView(buf);
    if (d.getUint32(0, true) !== 0x44335359) throw new Error('not YS3D');
    var nv = d.getUint32(8, true), nt = d.getUint32(12, true), nl = d.getUint32(16, true), o = 20;
    var names = new TextDecoder().decode(new Uint8Array(buf, o, nl)).split('\n');
    o += nl; o += (4 - o % 4) % 4;
    var pos = new Float32Array(buf.slice(o, o + nv * 12)); o += nv * 12;
    var uv = new Float32Array(buf.slice(o, o + nv * 8)); o += nv * 8;
    var idx = new Uint16Array(buf.slice(o, o + nt * 6)); o += nt * 6;
    var zone = new Uint8Array(buf.slice(o, o + nv)), nor = new Float32Array(nv * 3);
    /* تنعيم (27/11، محمد: «مجسمها مطعوج»): المجسّم مولَّد آلياً وسطوحه متموّجة. نلحم الرؤوس المتطابقة (المكرّرة عند فواصل القطع
       وحواف النسيج)، ثم نحسب نواظم ملساء لألواح الهيكل (10 دورات). تحريك الرؤوس نفسها (CAR_SMOOTH) معطَّل لأنه يفتح شقوقاً عند فواصل القطع. الزجاج والعجلات والمصابيح لا تُمسّ. */
    var key = {}, wid = new Uint32Array(nv), wn = 0, i, j, k, a, b, c, it, pass;
    for (j = 0; j < nv; j++) { k = Math.round(pos[j * 3] * 2e4) + '_' + Math.round(pos[j * 3 + 1] * 2e4) + '_' + Math.round(pos[j * 3 + 2] * 2e4); if (key[k] === undefined) key[k] = wn++; wid[j] = key[k]; }
    var wp = new Float32Array(wn * 3), free = new Uint8Array(wn).fill(1), nb = new Array(wn);
    for (j = 0; j < nv; j++) { k = wid[j] * 3; wp[k] = pos[j * 3]; wp[k + 1] = pos[j * 3 + 1]; wp[k + 2] = pos[j * 3 + 2]; if (!zone[j]) free[wid[j]] = 0; }
    for (j = 0; j < wn; j++) nb[j] = [];
    for (i = 0; i < idx.length; i += 3) { a = wid[idx[i]]; b = wid[idx[i + 1]]; c = wid[idx[i + 2]]; nb[a].push(b, c); nb[b].push(a, c); nb[c].push(a, b); }
    var tmp = new Float32Array(wn * 3);
    function relax(arr, f, onlyFree) {
      for (var v = 0; v < wn; v++) {
        var l = nb[v], n = l.length, x = 0, y = 0, z = 0, q;
        if (!n || (onlyFree && !free[v])) { tmp[v * 3] = arr[v * 3]; tmp[v * 3 + 1] = arr[v * 3 + 1]; tmp[v * 3 + 2] = arr[v * 3 + 2]; continue; }
        for (q = 0; q < n; q++) { x += arr[l[q] * 3]; y += arr[l[q] * 3 + 1]; z += arr[l[q] * 3 + 2]; }
        tmp[v * 3] = arr[v * 3] + f * (x / n - arr[v * 3]); tmp[v * 3 + 1] = arr[v * 3 + 1] + f * (y / n - arr[v * 3 + 1]); tmp[v * 3 + 2] = arr[v * 3 + 2] + f * (z / n - arr[v * 3 + 2]);
      }
      arr.set(tmp);
    }
    for (it = 0; it < CAR_SMOOTH; it++) { relax(wp, .5, true); relax(wp, -.53, true); }
    for (j = 0; j < nv; j++) { k = wid[j] * 3; pos[j * 3] = wp[k]; pos[j * 3 + 1] = wp[k + 1]; pos[j * 3 + 2] = wp[k + 2]; }
    var wnr = new Float32Array(wn * 3);
    for (i = 0; i < idx.length; i += 3) {
      a = wid[idx[i]] * 3; b = wid[idx[i + 1]] * 3; c = wid[idx[i + 2]] * 3;
      var ux = wp[b] - wp[a], uy = wp[b + 1] - wp[a + 1], uz = wp[b + 2] - wp[a + 2], vx = wp[c] - wp[a], vy = wp[c + 1] - wp[a + 1], vz = wp[c + 2] - wp[a + 2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      wnr[a] += nx; wnr[a + 1] += ny; wnr[a + 2] += nz; wnr[b] += nx; wnr[b + 1] += ny; wnr[b + 2] += nz; wnr[c] += nx; wnr[c + 1] += ny; wnr[c + 2] += nz;
    }
    function unit() { for (var v = 0; v < wn; v++) { var l = Math.hypot(wnr[v * 3], wnr[v * 3 + 1], wnr[v * 3 + 2]) || 1; wnr[v * 3] /= l; wnr[v * 3 + 1] /= l; wnr[v * 3 + 2] /= l; } }
    unit();
    for (pass = 0; pass < CAR_NSMOOTH; pass++) { relax(wnr, .6, true); unit(); }
    for (j = 0; j < nv; j++) { k = wid[j] * 3; nor[j * 3] = wnr[k]; nor[j * 3 + 1] = wnr[k + 1]; nor[j * 3 + 2] = wnr[k + 2]; }
    var fx = 0, fn = 0, fz = names.indexOf('f_bumper') + 1;
    for (var j = 0; j < nv; j++) if (zone[j] === fz) { fx += pos[j * 3]; fn++; }
    return { pos: pos, uv: uv, idx: idx, nor: nor, zf: Float32Array.from(zone), names: names, front: fn ? Math.sign(fx) : 1, n: idx.length };
  },
  matrices: function (c) {
    var asp = c.clientWidth / Math.max(1, c.clientHeight), dist = Math.max(1.16, 0.56 / (Math.tan(0.25) * asp));
    var view = m4.mul(m4.tr(0, -0.02, -dist), m4.rx(this.pitch)), vp = m4.mul(m4.persp(0.5, asp, 0.1, 20), view);
    var model = m4.ry(this.yaw + (this.model && this.model.front < 0 ? Math.PI : 0));
    return { vp: vp, model: model, eye: [0, Math.sin(this.pitch) * dist, Math.cos(this.pitch) * dist] };
  },
  frame: function (now) {
    var gl = this.gl, m = this.model, self = this; if (!gl || !m) return;
    var c = $('#car'); fit(c, 2);
    if (!this.drag && !reduce) this.yaw += 0.0025;
    var mm = this.matrices(c), u = this.pr.u, cols = new Float32Array(80);
    gl.viewport(0, 0, c.width, c.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST);
    gl.useProgram(this.pr.p);
    m.names.forEach(function (n, i) { var s = STATES.filter(function (x) { return x[0] === self.states[n]; })[0]; if (s) { var r = hex(s[1]); cols.set([r[0] / 255, r[1] / 255, r[2] / 255, n === 'roof' ? .8 : .86], (i + 1) * 4); } });
    gl.uniform4fv(u.uCol, cols); gl.uniformMatrix4fv(u.uVP, false, mm.vp); gl.uniformMatrix4fv(u.uM, false, mm.model); gl.uniform3fv(u.uEye, mm.eye);
    var k = clamp(1 - (now - this.flash) / 700);
    gl.uniform1i(u.uFlash, k > 0 ? this.flashZone : -1); gl.uniform1f(u.uPulse, k);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, m.tex); gl.uniform1i(u.uTex, 0);
    gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES, m.n, gl.UNSIGNED_SHORT, 0); gl.bindVertexArray(null);
  },
  tap: function (e) {
    var gl = this.gl, m = this.model; if (!gl || !m) return;
    var c = $('#car'), r = c.getBoundingClientRect(), d = c.width / r.width, x = Math.round((e.clientX - r.left) * d), y = Math.round((r.bottom - e.clientY) * d), W = c.width, H = c.height;
    if (!this.pt || this.pw !== W || this.ph !== H) {
      if (this.pt) gl.deleteTexture(this.pt); if (this.pd) gl.deleteRenderbuffer(this.pd);
      this.pt = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.pt); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      this.pd = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, this.pd); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, W, H);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.pt, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.pd);
      this.pw = W; this.ph = H;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    var mm = this.matrices(c);
    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST);
    gl.useProgram(this.pk.p); gl.uniformMatrix4fv(this.pk.u.uVP, false, mm.vp); gl.uniformMatrix4fv(this.pk.u.uM, false, mm.model);
    gl.bindVertexArray(m.pvao); gl.drawElements(gl.TRIANGLES, m.n, gl.UNSIGNED_SHORT, 0); gl.bindVertexArray(null);
    var px = new Uint8Array(4); gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    var z = px[3] ? Math.round(px[0]) : 0, name = z > 0 ? m.names[z - 1] : null;
    if (!name || !PARTS[name]) return;
    if (this.states[name] === this.sel) delete this.states[name]; else this.states[name] = this.sel;
    this.flash = performance.now(); this.flashZone = z; this.lastPart = name; this.labels();
  },
  labels: function () {
    var self = this;
    $('#states').innerHTML = STATES.map(function (s) { return '<button type="button" class="st' + (s[0] === self.sel ? ' on' : '') + '" data-st="' + s[0] + '" aria-pressed="' + (s[0] === self.sel) + '"><i style="background:' + s[1] + '"></i>' + s[2] + '</button>'; }).join('');
    var m = this.model, t = '';
    if (m) {
      var all = m.names.filter(function (n) { return PARTS[n]; }), set = all.filter(function (n) { return self.states[n]; });
      var counts = STATES.map(function (s) { return [set.filter(function (n) { return self.states[n] === s[0]; }).length, s[2]]; }).filter(function (x) { return x[0]; }).map(function (x) { return x[1] + ' ' + x[0]; });
      t = (this.lastPart ? PARTS[this.lastPart] + ' · ' : '') + (counts.length ? counts.join('، ') : 'المس أيّ قطعة لتلوّنها') + ' · من ' + all.length + ' قطعة';
    }
    $('#carSum').textContent = t;
  }
};
$('#states').addEventListener('click', function (e) { var b = e.target.closest('.st'); if (!b) return; car.sel = b.dataset.st; car.labels(); });

/* 6 · الأمان: سطر يضيء مع التمرير */
var safePin = $('#safePin'), lineEls = $$('#lines li'), lineIdx = 0;
function safeSet() { var i = Math.min(lineEls.length - 1, Math.floor(pinProgress(safePin) * (lineEls.length + .3))); if (i !== lineIdx) { lineIdx = i; lineEls.forEach(function (el, j) { el.classList.toggle('on', j === i); }); } }

/* إحصاءات حيّة: أمثلة توضيحية. كل بطاقة تبدأ من الصفر حين تظهر، ثم تعيد الكرّة بمثال آخر */
(function () {
  var box = $('#lives'); if (!box) return;
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  function count(el, to, f, dur, from) {
    f = f || fmt; from = from || 0; var t0 = performance.now(); el._id = (el._id || 0) + 1; var id = el._id;
    if (reduce) { el.textContent = f(to); return; }
    el.textContent = f(from);
    (function tick(now) { if (el._id !== id) return; var t = clamp((now - t0) / (dur || 2000)), e = 1 - Math.pow(1 - t, 3); el.textContent = f(from + (to - from) * e); if (t < 1) requestAnimationFrame(tick); })(t0);
  }
  /* 1 · إحصائيات إعلان */
  var ad = $('[data-live=ad]', box), bars = $$('.bars i', ad), adI = -1;
  var ADS = [['شقة للبيع · المزة', [412, 538, 497, 683, 621, 874, 795], 118], ['ممرض عناية · حلب', [236, 281, 342, 305, 398, 451, 417], 96], ['شاليه بحري · اللاذقية', [520, 468, 589, 742, 968, 1124, 986], 163], ['بيك أب 2014 · حمص', [158, 187, 171, 263, 244, 336, 298], 47]];
  function adStep() {
    adI = (adI + 1) % ADS.length; var d = ADS[adI], mx = Math.max.apply(null, d[1]), sum = d[1].reduce(function (a, b) { return a + b; }, 0);
    $('[data-k=title]', ad).textContent = d[0];
    bars.forEach(function (b) { b.style.height = '4%'; b.classList.remove('max'); });
    setTimeout(function () { bars.forEach(function (b, i) { b.style.height = (d[1][i] / mx * 100).toFixed(1) + '%'; b.classList.toggle('max', d[1][i] === mx); }); }, reduce ? 0 : 380);
    count($('[data-k=views]', ad), sum, fmt, 2200); count($('[data-k=today]', ad), d[1][6]); count($('[data-k=req]', ad), d[2]);
    count($('[data-k=rate]', ad), d[2] / sum * 100, function (v) { return v.toFixed(1) + '%'; });
  }
  /* 2 · خريطة الطلب */
  var dm = $('[data-live=demand]', box), rows = $('[data-k=rows]', dm), dmI = -1;
  var GOV = ['ريف دمشق', 'دمشق', 'حلب', 'حمص', 'اللاذقية'], DM = [[1880, 1690, 700, 670, 310], [960, 1430, 880, 410, 520]];
  rows.innerHTML = GOV.map(function (g) { return '<li><span>' + g + '</span><span class="track"><span class="fill"></span></span><b>0</b></li>'; }).join('');
  function dmStep() {
    dmI = (dmI + 1) % DM.length; var d = DM[dmI], mx = Math.max.apply(null, d), lis = $$('li', rows);
    $$('.chips span', dm).forEach(function (c, i) { c.classList.toggle('on', i === dmI); });
    lis.forEach(function (li) { $('.fill', li).style.width = '0%'; });
    setTimeout(function () { lis.forEach(function (li, i) { $('.fill', li).style.width = (d[i] / mx * 100).toFixed(1) + '%'; }); }, reduce ? 0 : 380);
    lis.forEach(function (li, i) { count($('b', li), d[i]); });
  }
  /* 3 · إحصاءات المعرض */
  var dl = $('[data-live=dealer]', box), top = $('[data-k=top]', dl), line = $('[data-k=line]', dl), area = $('[data-k=area]', dl);
  var BASE = [['سيدان 2016 · دمشق', 6240], ['دفع رباعي 2019 · دمشق', 4870], ['بيك أب 2014 · حمص', 3915], ['دراجة نارية 2021 · حلب', 3395]], CARS = BASE, total = 18420, pts = [22, 30, 26, 38, 35, 46, 41, 55, 50, 63, 58, 72];
  function spark(draw) {
    var w = 300, h = 80, mx = Math.max.apply(null, pts) * 1.08, mn = Math.min.apply(null, pts) * .8;
    var p = pts.map(function (v, i) { return [(i / (pts.length - 1) * w).toFixed(1), (h - (v - mn) / (mx - mn) * h).toFixed(1)]; });
    var d = 'M' + p.map(function (q) { return q.join(' '); }).join(' L');
    line.setAttribute('d', d); area.setAttribute('d', d + ' L' + w + ' ' + h + ' L0 ' + h + ' Z');
    if (draw && !reduce && line.getTotalLength) {
      var len = line.getTotalLength(); line.style.transition = 'none'; area.style.transition = 'none';
      line.style.strokeDasharray = len; line.style.strokeDashoffset = len; area.style.opacity = 0; line.getBoundingClientRect();
      line.style.transition = ''; area.style.transition = ''; line.style.strokeDashoffset = 0; area.style.opacity = 1;
    } else { line.style.strokeDasharray = 'none'; }
  }
  function topDraw(zero) {
    var sorted = CARS.slice().sort(function (a, b) { return b[1] - a[1]; });
    top.innerHTML = sorted.map(function (c, i) { return '<li><i>' + (i + 1) + '</i><span>' + c[0] + '</span><b>' + (zero ? 0 : fmt(c[1])) + '</b></li>'; }).join('');
    if (zero) $$('b', top).forEach(function (b, i) { count(b, sorted[i][1]); });
  }
  function dlStart() {
    CARS = BASE.map(function (c) { return c.slice(); }); total = 18420; pts = [22, 30, 26, 38, 35, 46, 41, 55, 50, 63, 58, 72];
    count($('[data-k=total]', dl), total, fmt, 2400); spark(true); topDraw(true);
  }
  function dlStep() {
    var k = Math.floor(Math.random() * CARS.length), add = 6 + Math.floor(Math.random() * 38);
    CARS[k][1] += add; total += add; pts.push(pts[pts.length - 1] + (Math.random() * 16 - 5)); pts.shift();
    count($('[data-k=total]', dl), total, fmt, 800, total - add); spark(false); topDraw(false);
  }
  spark(false); topDraw(false);
  /* كل بطاقة تبدأ حين يُرى ثلثها، وتتوقف حين تغيب */
  function watch(el, first, loop, every, delay) {
    var t = null, w = null, on = false;
    function go(v) {
      if (v && !on) { on = true; first(); if (!reduce) w = setTimeout(function () { t = setInterval(loop, every); }, delay || 0); }
      else if (!v && on) { on = false; clearTimeout(w); clearInterval(t); }
    }
    if (!('IntersectionObserver' in window)) { go(true); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && e.intersectionRatio >= .3) go(true); else if (!e.isIntersecting) go(false); }); }, { threshold: [0, .3, .6] }).observe(el);
  }
  watch(ad, function () { adI = -1; adStep(); }, adStep, 6500);
  watch(dm, function () { dmI = -1; dmStep(); }, dmStep, 6000);
  watch(dl, dlStart, dlStep, 1700, 2600);
})();

/* مساعد يُسر: رمز القطرة بحركته في التطبيق (نقل معادلات lib/core/widgets/ai_mark.dart: خمسة نوابض)، ومثال يكتبه أمامك */
(function () {
  var cv = $('#aiMark'), card = $('#aiCard'); if (!cv || !card) return;
  var stEl = $('#aiState'), ask = $('#aiAsk'), where = $('#aiWhere'), out = $('#aiOut'), btns = $('.aibtns', card), chips = $$('.aichips li');
  var DEMO = CFG.ai || [
    [0, 'وصف فرصة العمل', 'اكتبها لي', 'مطلوب ممرّض عناية مشدّدة بخبرة سنتين على الأقل، للعمل بدوام مسائي في مستشفى خاص وسط حلب. الراتب مذكور في الإعلان، والمواصلات مؤمّنة.'],
    [1, 'نبذتك في السيرة', 'حسّنها', 'محاسب بخبرة خمس سنوات في الشركات التجارية. أتقن إعداد القوائم المالية والمطابقات البنكية، وأبحث عن فرصة بدوام كامل في دمشق.'],
    [2, 'وصف إعلان العقار', 'اكتب الوصف', 'شقة مشمسة من ثلاث غرف وصالة في المزة، في الطابق الثالث مع مصعد. إكساء جديد ومطبخ مجهّز، وقريبة من المدارس والأسواق.']
  ];
  var TXT = CFG.aiTxt || ['جاهز', 'يكتب لك…', 'تمام، راجِع النص'];
  var di = 0;
  function show(i) { var d = DEMO[i]; where.textContent = d[1]; ask.textContent = d[2]; chips.forEach(function (c, j) { c.classList.toggle('on', j === d[0]); }); }
  if (reduce || !cv.getContext) { show(0); out.textContent = DEMO[0][3]; stEl.textContent = TXT[2]; btns.classList.add('on'); return; }
  var g = cv.getContext('2d'), orb = cv.parentNode, W = 120, SZ = 78, C = W / 2, dpr = Math.min(3, window.devicePixelRatio || 1);
  cv.width = cv.height = Math.round(W * dpr);
  function spring(v, k, z) { return { v: v, t: v, vel: 0, k: k, z: z }; }
  function stepS(s, dt) { var c = 2 * s.z * Math.sqrt(s.k); s.vel += (s.k * (s.t - s.v) - c * s.vel) * dt; s.v += s.vel * dt; }
  /* الزاوية الكبيرة أسفل «النهاية»: يسار بالعربية، يمين بالإنجليزية */
  var base = document.documentElement.dir === 'ltr' ? Math.PI / 4 : 3 * Math.PI / 4, state = 'idle', time = 0, since = 0, fx = 9, last = 0, id = 0, typed = 0;
  var energy = spring(0, 55, 1), scale = spring(1, 190, .5), glow = spring(.25, 40, 1), tip = spring(.3, 80, .9), ang = spring(base, 90, .85);
  function apply(s) {
    var was = state; state = s; since = 0;
    if (s === 'think') { energy.t = 1; glow.t = .6; tip.t = .12; ang.k = 40; ang.z = 1; return; }
    energy.t = 0; tip.t = .3; ang.k = 90; ang.z = s === 'done' ? .5 : .9;
    if (was === 'think') ang.t = base + Math.ceil((ang.v - base) / (2 * Math.PI)) * 2 * Math.PI;
    if (s === 'done') { scale.vel += 3.4; glow.t = 1; fx = 0; } else glow.t = .25;
  }
  function draw() {
    var e = clamp(energy.v), i, th, d, bump, wob, r, x, y;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, W);
    var r0 = SZ * .3 * scale.v * (1 + Math.sin(time * 1.7) * .025 * (1 - e)), ga = .5 * glow.v;
    if (ga > .01) {
      var rg = g.createRadialGradient(C, C, 0, C, C, r0 * 1.9);
      rg.addColorStop(0, 'rgba(61,213,152,' + ga + ')'); rg.addColorStop(.1, 'rgba(61,213,152,' + ga + ')'); rg.addColorStop(1, 'rgba(61,213,152,0)');
      g.fillStyle = rg; g.beginPath(); g.arc(C, C, r0 * 1.9, 0, 2 * Math.PI); g.fill();
    }
    var n = 90, sharp = 1 - e;
    g.beginPath();
    for (i = 0; i <= n; i++) {
      th = i / n * 2 * Math.PI; d = Math.atan2(Math.sin(th - ang.v), Math.cos(th - ang.v));
      bump = (1 - sharp) * Math.exp(-(d * d) / (2 * .55 * .55)) + sharp * Math.exp(-Math.abs(d) / .3);
      wob = e * (.075 * Math.sin(2 * th + time * 2.1) + .05 * Math.sin(3 * th - time * 2.9) + .028 * Math.sin(5 * th + time * 1.4));
      r = r0 * (1 + tip.v * bump + wob); x = C + r * Math.cos(th); y = C + r * Math.sin(th);
      if (i) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.closePath();
    var gg = time * (.3 + e * 1.3), vx = Math.cos(gg) * r0 * 1.4, vy = Math.sin(gg) * r0 * 1.4;
    var lg = g.createLinearGradient(C - vx, C - vy, C + vx, C + vy);
    lg.addColorStop(0, '#2FC489'); lg.addColorStop(.45, '#8FEBC0'); lg.addColorStop(.8, '#F2FFF8'); lg.addColorStop(1, '#FFE08A');
    g.fillStyle = lg; g.fill();
    g.save(); g.clip();
    var hx = C - r0 * .38, hy = C - r0 * .5, hg = g.createRadialGradient(hx, hy, 0, hx, hy, r0 * 1.05);
    hg.addColorStop(0, 'rgba(255,255,255,.35)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hg; g.fillRect(0, 0, W, W);
    if (fx < .9) {
      var k = fx / .9, sx = C + (-1.7 + k * 3.4) * r0, w = r0 * .38, sg = g.createLinearGradient(sx - w, C - w * .6, sx + w, C + w * .6);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,' + (.7 * (1 - k * .4)) + ')'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sg; g.fillRect(0, 0, W, W);
    }
    g.restore();
  }
  /* الدورة: جاهز 1.7 ثانية (ضغطة على الزر) ← يكتب 2.6 ← النص يُكتب حرفاً حرفاً ثم يبقى 4 ثوانٍ ← المثال التالي */
  function tick(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    if (dt > 0) {
      time += dt; since += dt; fx += dt;
      var full = DEMO[di][3];
      if (state === 'idle') {
        ask.classList.toggle('tap', since > 1.2 && since < 1.45);
        if (since > 1.7) { apply('think'); stEl.textContent = TXT[1]; out.textContent = TXT[1]; out.classList.add('wait'); }
      } else if (state === 'think' && since > 2.6) { apply('done'); stEl.textContent = TXT[2]; out.classList.remove('wait'); out.textContent = ''; typed = 0; }
      else if (state === 'done') {
        var nCh = Math.min(full.length, Math.floor(since * 46));
        if (nCh !== typed) { typed = nCh; out.textContent = full.slice(0, nCh); if (nCh === full.length) btns.classList.add('on'); }
        if (since > full.length / 46 + 4) { di = (di + 1) % DEMO.length; show(di); apply('idle'); stEl.textContent = TXT[0]; out.textContent = ''; btns.classList.remove('on'); }
      }
      while (dt > 0) {
        var hh = Math.min(dt, 1 / 120);
        if (state === 'think') ang.t += 3 * hh;
        if (state === 'done' && since > .6) glow.t = .3;
        stepS(energy, hh); stepS(scale, hh); stepS(glow, hh); stepS(tip, hh); stepS(ang, hh);
        dt -= hh;
      }
      draw();
    }
    id = requestAnimationFrame(tick);
  }
  function go(on) { cancelAnimationFrame(id); id = 0; if (on) { last = performance.now(); id = requestAnimationFrame(tick); } }
  orb.classList.add('live'); show(0); draw();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { go(e.isIntersecting && !document.hidden); }); }).observe(card); else go(true);
})();

/* سماء يُسر: الشمس تعبر السماء مع التمرير، واللون يمضي من الفجر إلى الليل */
var SKY = [[0, [246, 252, 248], [222, 242, 232]], [.4, [247, 252, 248], [226, 244, 234]], [.72, [253, 250, 240], [238, 243, 224]], [1, [240, 249, 244], [214, 238, 226]]];
var rootStyle = document.documentElement.style;
function mix3(a, b, t) { return [0, 1, 2].map(function (i) { return Math.round(lerp(a[i], b[i], t)); }); }
function skySet() {
  var max = document.documentElement.scrollHeight - window.innerHeight, p = max > 0 ? clamp(window.scrollY / max) : 0, i = 0;
  while (i < SKY.length - 2 && p > SKY[i + 1][0]) i++;
  var t = clamp((p - SKY[i][0]) / (SKY[i + 1][0] - SKY[i][0]));
  rootStyle.setProperty('--sky-a', 'rgb(' + mix3(SKY[i][1], SKY[i + 1][1], t).join(',') + ')');
  rootStyle.setProperty('--sky-b', 'rgb(' + mix3(SKY[i][2], SKY[i + 1][2], t).join(',') + ')');
  rootStyle.setProperty('--sun', mix3([246, 205, 96], [240, 168, 92], clamp((p - .55) / .4)).join(','));
  rootStyle.setProperty('--sx', (84 - 66 * p).toFixed(2) + '%');
  rootStyle.setProperty('--sy', (15 + 40 * Math.pow(p, 1.15)).toFixed(2) + '%');
}

/* الشريط العلوي فوق الأقسام الداكنة */
var bar = $('#bar'), darkEls = $$('.end');
function barSet() {
  var dark = growE > .9 && grow.getBoundingClientRect().bottom > 60;
  if (!dark) for (var i = 0; i < darkEls.length; i++) { var r = darkEls[i].getBoundingClientRect(); if (r.top < 30 && r.bottom > 30) { dark = true; break; } }
  bar.classList.toggle('dark', dark);
}

/* حلقة واحدة: لا يُرسم إلا ما على الشاشة */
var live = { pano: false, car: false }, started = { pano: false, car: false }, raf = 0, lastY = window.scrollY;
function start(key, obj) { if (!started[key]) { started[key] = true; try { obj.init(); } catch (e) { if (window.console) console.warn(key, e); } } }
onView(grow, function (on) { live.pano = on; if (on) start('pano', pano); kick(); }, '400px');
onView($('#cars'), function (on) {
  live.car = on;
  if (on) {
    if (window.YUSR_CAR_SEDAN) start('car', car);
    else if (!car.loading) { car.loading = true; var s = document.createElement('script'); s.src = 'car_sedan.js'; s.onload = function () { start('car', car); kick(); }; document.head.appendChild(s); }
  }
  kick();
}, '600px');
function onScroll() {
  var y = window.scrollY; if (!arcDrag) arcX += (y - lastY) * .35; lastY = y;
  hTarget = clamp((y - hero.offsetTop) / Math.max(1, hero.offsetHeight - window.innerHeight));
  workSet(Math.min(stepEls.length - 1, Math.floor(pinProgress(workPin) * stepEls.length)));
  growSet(); safeSet(); barSet(); skySet(); kick();
}
var heroBusy = true;
function kick() { if (!raf) raf = requestAnimationFrame(step); }
function step(now) {
  raf = 0;
  heroBusy = reduce ? false : heroFrame();
  if (arcLive) arcFrame();
  if (live.pano) pano.frame(now);
  if (live.car) car.frame(now);
  if (heroBusy || (arcLive && !reduce) || arcVel || arcDrag || live.pano || live.car) raf = requestAnimationFrame(step);
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
arcFrame(); onScroll();
})();
