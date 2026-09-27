import * as THREE from 'three';
import './style.css';

window.addEventListener('DOMContentLoaded', () => {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.innerWidth < 720;

  function canvasTex(draw,size){
    size=size||128; var cv=document.createElement('canvas'); cv.width=cv.height=size;
    draw(cv.getContext('2d'), size); return new THREE.CanvasTexture(cv);
  }
  function glow(inner,outer,size){
    return canvasTex(function(ctx,s){
      var g=ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
      g.addColorStop(0,inner); g.addColorStop(1,outer);
      ctx.fillStyle=g; ctx.fillRect(0,0,s,s);
    },size);
  }
  var groundTex = canvasTex(function(ctx,s){
    ctx.fillStyle='#CFE0D0'; ctx.fillRect(0,0,s,s);
    for(var i=0;i<520;i++){
      var r=4+Math.random()*16;
      ctx.fillStyle = Math.random()<0.5?'rgba(175,203,178,0.4)':'rgba(232,241,226,0.32)';
      ctx.beginPath(); ctx.arc(Math.random()*s,Math.random()*s,r,0,6.283); ctx.fill();
    }
  },320);
  groundTex.wrapS=groundTex.wrapT=THREE.RepeatWrapping; groundTex.repeat.set(26,36);
  var pathTex = glow('rgba(255,255,255,0.95)','rgba(255,255,255,0)',128);
  var shadowTex = glow('rgba(18,32,24,0.5)','rgba(18,32,24,0)',96);
  var sparkleTex = glow('rgba(255,252,235,1)','rgba(255,252,235,0)',64);
  var sunTex = glow('rgba(255,247,214,0.4)','rgba(255,247,214,0)',256);

  var canvas=document.getElementById('c');
  var renderer=new THREE.WebGLRenderer({canvas:canvas, antialias:!mobile, alpha:true});
  renderer.setClearColor(0x000000,0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, mobile?1.3:2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene=new THREE.Scene();
  scene.background=null;
  scene.fog=new THREE.Fog(0xDCEAE6, 16, mobile?78:128);

  var camera=new THREE.PerspectiveCamera(56, window.innerWidth/window.innerHeight, 0.1, 400);
  camera.position.set(0,3.2,9);
  var lookCur=new THREE.Vector3(0,2,0);
  var camPos=new THREE.Vector3().copy(camera.position);

  scene.add(new THREE.HemisphereLight(0xfff3d8, 0x5c6f56, 0.85));
  var sun=new THREE.DirectionalLight(0xfff2d6, 1.05);
  sun.position.set(-24,32,14); scene.add(sun);
  if(!mobile){
    sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024);
    var sc=sun.shadow.camera; sc.left=-55; sc.right=55; sc.top=55; sc.bottom=-55; sc.near=1; sc.far=110;
    sun.shadow.bias=-0.0015;
  }
  var rim=new THREE.DirectionalLight(0xcfe0ff, 0.3); rim.position.set(20,10,-20); scene.add(rim);

  var sunSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:sunTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
  sunSprite.scale.set(60,60,1); sunSprite.position.set(-30,26,-30); scene.add(sunSprite);

  var ground=new THREE.Mesh(new THREE.PlaneGeometry(240,340), new THREE.MeshStandardMaterial({map:groundTex, roughness:1}));
  ground.rotation.x=-Math.PI/2; ground.position.set(-6,0,-60); ground.receiveShadow=true; scene.add(ground);

  var nodes={
    start:[0,0,6], fork:[0,0,-14],
    objavhub:[-10,0,-24], onas:[-18,0,-48], tim:[-24,0,-72], hackclub:[-30,0,-96], projekty:[-36,0,-120],
    pridajhub:[10,0,-24], harmonogram:[18,0,-48], pridajsafinal:[24,0,-72]
  };
  var segs=[['start','fork'],['fork','objavhub'],['objavhub','onas'],['onas','tim'],['tim','hackclub'],['hackclub','projekty'],['fork','pridajhub'],['pridajhub','harmonogram'],['harmonogram','pridajsafinal']];
  var pathMat=new THREE.MeshBasicMaterial({map:pathTex, transparent:true, depthWrite:false, opacity:.9});
  segs.forEach(function(s){
    var a=nodes[s[0]], b=nodes[s[1]];
    var dx=b[0]-a[0], dz=b[2]-a[2], len=Math.sqrt(dx*dx+dz*dz)+4;
    var plane=new THREE.Mesh(new THREE.PlaneGeometry(5.5,len), pathMat);
    plane.rotation.x=-Math.PI/2; plane.rotation.z=-Math.atan2(dx,dz);
    plane.position.set((a[0]+b[0])/2,0.035,(a[2]+b[2])/2);
    scene.add(plane);
  });

  var canopies=[];
  var trunkGeo=new THREE.CylinderGeometry(0.22,0.34,2.3,7);
  var trunkMat=new THREE.MeshStandardMaterial({color:0x6b5842, roughness:0.95, flatShading:true});
  var coneGeo=new THREE.ConeGeometry(1,2.15,9);
  var palettes=[[0x1f3d2c,0x2f5a40,0x5c8f6a],[0x203a2a,0x3e6b4e,0x76a882],[0x1c3626,0x336148,0x69976f]];

  function tree(x,z,scale){
    var g=new THREE.Group();
    var trunk=new THREE.Mesh(trunkGeo,trunkMat); trunk.position.y=1.1; trunk.castShadow=!mobile; g.add(trunk);
    var canopy=new THREE.Group();
    var pal=palettes[(Math.random()*palettes.length)|0];
    for(var i=0;i<3;i++){
      var c=new THREE.Mesh(coneGeo,new THREE.MeshStandardMaterial({color:pal[i], flatShading:true, roughness:0.8}));
      c.position.y=2.15+i*1.35; c.scale.set(1-i*0.24,1-i*0.14,1-i*0.24);
      c.castShadow=!mobile;
      canopy.add(c);
    }
    g.add(canopy);
    g.position.set(x,0,z); g.rotation.y=Math.random()*6.28; g.scale.setScalar(scale);
    scene.add(g);
    var shadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({map:shadowTex, transparent:true, depthWrite:false}));
    shadow.rotation.x=-Math.PI/2; shadow.position.set(x,0.025,z); shadow.scale.setScalar(2.1*scale); scene.add(shadow);
    canopies.push({m:canopy, phase:Math.random()*10, speed:0.5+Math.random()*0.4});
  }

  function scatter(count, cx, zMin, zMax){
    for(var i=0;i<count;i++){
      var z=zMin+Math.random()*(zMax-zMin);
      var xc=cx(z);
      var side=Math.random()<0.5?-1:1;
      var x=xc+side*(2.8+Math.random()*12);
      var scale=1.15+Math.random()*1.75;
      tree(x,z,scale);
    }
  }
  var n=mobile?18:34;
  scatter(mobile?9:16, function(){return 0;}, -14, 7);
  scatter(n, function(z){ return THREE.MathUtils.mapLinear(z,-14,-124,0,-40); }, -124,-14);
  scatter(n, function(z){ return THREE.MathUtils.mapLinear(z,-14,-76,0,40); }, -76,-14);

  var pCount=mobile?70:170, pPos=new Float32Array(pCount*3);
  for(var i=0;i<pCount;i++){ pPos[i*3]=(Math.random()-0.5)*80; pPos[i*3+1]=Math.random()*7+0.4; pPos[i*3+2]=6-Math.random()*130; }
  var pGeo=new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3));
  var particles=new THREE.Points(pGeo, new THREE.PointsMaterial({map:sparkleTex, color:0xfff6df, size:0.4, transparent:true, opacity:0.8, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true}));
  scene.add(particles);

  var CAM={
    'start':{p:nodes.start,l:[0,2,-6]},
    'objav-hub':{p:[-4,3,-16],l:[-10,2,-26]},
    'onas':{p:[-13,3,-40],l:[-18,2,-50]},
    'tim':{p:[-20,3,-64],l:[-24,2,-74]},
    'hackclub':{p:[-27,3,-88],l:[-30,2,-98]},
    'projekty':{p:[-33,3,-112],l:[-36,2,-122]},
    'pridaj-hub':{p:[4,3,-16],l:[10,2,-26]},
    'harmonogram':{p:[13,3,-40],l:[18,2,-50]},
    'pridajsa-final':{p:[20,3,-64],l:[24,2,-74]}
  };
  var desiredPos=new THREE.Vector3().copy(camera.position);
  var desiredLook=new THREE.Vector3().copy(lookCur);
  function setCam(id){
    var c=CAM[id]; if(!c) return;
    desiredPos.set(c.p[0],c.p[1],c.p[2]);
    desiredLook.set(c.l[0],c.l[1],c.l[2]);
    if(reduced){ camPos.copy(desiredPos); lookCur.copy(desiredLook); }
  }

  var clock=new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    var t=clock.getElapsedTime();
    var lerp=reduced?1:0.045;
    camPos.lerp(desiredPos, lerp);
    lookCur.lerp(desiredLook, lerp);
    var bob = reduced?0:Math.sin(t*0.55)*0.06;
    camera.position.set(camPos.x, camPos.y+bob, camPos.z);
    camera.lookAt(lookCur.x, lookCur.y+bob*0.5, lookCur.z);
    canopies.forEach(function(c){ c.m.rotation.z=Math.sin(t*c.speed+c.phase)*0.035; c.m.rotation.x=Math.cos(t*c.speed*0.8+c.phase)*0.02; });
    particles.rotation.y=t*0.008;
    renderer.render(scene,camera);
  }
  animate();
  window.addEventListener('resize', function(){
    camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------- UI / SCENES ---------- */
  var scenes = document.querySelectorAll('.scene');
  function goTo(id){
    var next = document.getElementById(id);
    if(!next) return;
    scenes.forEach(function(s){ s.classList.remove('active'); });
    next.classList.add('active');
    setCam(id);
    document.querySelectorAll('.maplist button').forEach(function(b){
      b.removeAttribute('aria-current');
      if(b.dataset.go === id) b.setAttribute('aria-current','true');
    });
    setTimeout(function(){ next.focus(); }, 50);
  }
  document.body.addEventListener('click', function(e){
    var t = e.target.closest('[data-go]');
    if(t){ goTo(t.dataset.go); closeMap(); }
  });

  var mapOverlay = document.getElementById('mapOverlay');
  function openMap(){ mapOverlay.classList.add('open'); document.getElementById('mapClose').focus(); }
  function closeMap(){ mapOverlay.classList.remove('open'); }
  document.getElementById('mapOpen').addEventListener('click', openMap);
  document.getElementById('mapClose').addEventListener('click', closeMap);
  mapOverlay.addEventListener('click', function(e){ if(e.target === mapOverlay) closeMap(); });

  var signupModal = document.getElementById('signupModal');
  document.getElementById('openSignup').addEventListener('click', function(){ signupModal.classList.add('open'); document.getElementById('sName').focus(); });
  function closeSignup(){ signupModal.classList.remove('open'); }
  document.getElementById('signupClose').addEventListener('click', closeSignup);
  document.getElementById('signupForm').addEventListener('submit', function(e){
    e.preventDefault();
    this.innerHTML = '<h3 class="title-lg" style="font-size:1.4rem;">Ďakujeme! 🌲</h3><p>Ozveme sa ti čo najskôr. Uvidíme sa v lese.</p><button type="button" class="mapclose" id="signupClose2">Zavrieť</button>';
    document.getElementById('signupClose2').addEventListener('click', closeSignup);
  });
  signupModal.addEventListener('click', function(e){ if(e.target === signupModal) closeSignup(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeMap(); closeSignup(); } });
});
