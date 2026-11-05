import {softwareRenderer} from './software-aircraft.js';
import * as THREE from './assets/three.module.min.js';
const $=s=>document.querySelector(s);
// A steering aircraft and a two-engine, turbulent smoke wake, clipped to the hero.
function initFlight(){
 const hero=$('#home'),layer=$('.flight-layer'),canvas=$('#flight-smoke'),ctx=canvas.getContext('2d',{alpha:true}),marker=$('.flight-target');
 const aircraftCanvas=$('#flight-aircraft'),gl=aircraftCanvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
 let renderer;if(gl){renderer=new THREE.WebGLRenderer({canvas:aircraftCanvas,context:gl,alpha:true,antialias:true,powerPreference:'low-power'})}else{const fallback=document.createElement('canvas');fallback.id='flight-aircraft';aircraftCanvas.replaceWith(fallback);renderer=softwareRenderer(THREE,fallback)};
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,1,1,5000);
 scene.add(new THREE.HemisphereLight(0xe3f3ff,0x394b5b,2.1));
 const sun=new THREE.DirectionalLight(0xfff0d8,4.2);sun.position.set(-150,250,350);scene.add(sun);
 const rim=new THREE.DirectionalLight(0xa3caff,2.8);rim.position.set(160,-80,-100);scene.add(rim);
 const aircraft=new THREE.Group(),body=new THREE.Group();aircraft.add(body);scene.add(aircraft);
 const paint=new THREE.MeshPhysicalMaterial({color:0xf4f4ed,metalness:.38,roughness:.24,clearcoat:1,clearcoatRoughness:.2});
 const silver=new THREE.MeshStandardMaterial({color:0xaab6bd,metalness:.75,roughness:.3});
 const dark=new THREE.MeshStandardMaterial({color:0x101e29,metalness:.3,roughness:.3});
 const glass=new THREE.MeshPhysicalMaterial({color:0x123749,metalness:.5,roughness:.12,clearcoat:1});
 const green=new THREE.MeshPhysicalMaterial({color:0x164b40,metalness:.4,roughness:.28});
 function mesh(geo,mat,x=0,y=0,z=0,parent=body){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m}
 // Circular cross-sections create a continuous rounded hull, narrowing at both ends.
 const profile=[[-69,0],[-66,1.5],[-53,3.2],[-36,6.6],[-15,8.2],[20,8.2],[36,7.5],[46,5.7],[54,3.7],[60,1.7],[63,0]];
 const curve=new THREE.SplineCurve(profile.map(([y,r])=>new THREE.Vector2(r,y)));
 mesh(new THREE.LatheGeometry(curve.getPoints(90),48),paint).scale.z=.88;
 function foil(points,depth,mat=paint,z=0){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.35,bevelThickness:.3});g.translate(0,0,-depth/2);return mesh(g,mat,0,0,z)}
 for(const sign of [-1,1]){
  const wing=foil([[sign*5,12],[sign*57,-23],[sign*61,-31],[sign*54,-32],[sign*19,-17],[sign*5,-20]],1.5,paint,-2);
  foil([[sign*7,-2],[sign*52,-26],[sign*48,-27],[sign*16,-14]],.15,silver,-.95);
  // Swept stabilizers, winglets and a metallic leading edge.
  foil([[sign*2,-43],[sign*24,-57],[sign*25,-62],[sign*3,-58]],1.0,paint,5);
  const winglet=foil([[0,0],[0,7],[2,4],[2,-3]],.7,green);winglet.position.set(sign*58,-28,1);winglet.rotation.y=sign*1.15;
  const pod=new THREE.Group();pod.position.set(sign*15,-33,1);body.add(pod);
  const nacelle=mesh(new THREE.CylinderGeometry(4.6,3.5,21,32,1,true),paint,0,0,0,pod);
  mesh(new THREE.CylinderGeometry(3.8,3.8,1,32),dark,0,10,0,pod);
  const inlet=mesh(new THREE.TorusGeometry(4.15,.55,10,32),silver,0,10.5,0,pod);inlet.rotation.x=Math.PI/2;
  const hub=mesh(new THREE.ConeGeometry(1.4,3,16),silver,0,10.4,0,pod);
  for(let i=0;i<12;i++){const fan=mesh(new THREE.BoxGeometry(.45,.25,5.5),silver,0,10.1,0,pod);fan.rotation.y=i*Math.PI/6}
  const exhaust=mesh(new THREE.CylinderGeometry(2.8,2.7,3,24,1,true),dark,0,-11,0,pod);
  mesh(new THREE.BoxGeometry(9,8,1.3),paint,sign*10,-32,0);
  for(let i=0;i<7;i++){const w=mesh(new THREE.SphereGeometry(1,14,10),glass,sign*7.65,23-i*6,2.2);w.scale.set(.34,1.65,1.25)}
  const light=mesh(new THREE.SphereGeometry(.85,10,8),new THREE.MeshBasicMaterial({color:sign<0?0xe74339:0x85ffb7}),sign*59,-29,2);
 }
 const fin=foil([[-51,3],[-62,3],[-57,23],[-52,24],[-40,5]],1.4,green);
 // Map the fin's profile into the longitudinal/vertical plane.
 fin.rotation.set(Math.PI/2,Math.PI/2,0);
 for(const sign of [-1,1]){const cockpit=mesh(new THREE.SphereGeometry(1,24,16),glass,sign*2.8,46,4.2);cockpit.scale.set(2.7,6.4,2.2);cockpit.rotation.z=sign*.18;}
 const stripe=foil([[-1.1,-45],[-1.1,35],[1.1,35],[1.1,-45]],.1,green,7.2);
 const exhausts=[];for(const x of [-15,15]){const anchor=new THREE.Object3D();anchor.position.set(x,-45,1);body.add(anchor);exhausts.push(anchor)}
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;$('#toggle-flight').textContent='3D paused'});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{ready=true;setLabel()});

 const query=matchMedia('(prefers-reduced-motion: reduce)');
 let width=hero.clientWidth,height=hero.clientHeight,dpr=1,clock=0,last=0,visible=true,enabled=safeStorage.get('found-flight',true)!==false,boost=0,emission=0,ready=false,trail=[],raf=0;
 const target={x:width*.7,y:height*.29,last:-100,active:false};
 const plane={x:width*.50,y:height*.18,a:0,speed:95,bank:0};
 const r=(min,max)=>min+Math.random()*(max-min),clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const cloud=document.createElement('canvas');cloud.width=128;cloud.height=128;const sc=cloud.getContext('2d');
 // Uneven overlapping density lobes make a soft vapour puff, rather than a solid dot.
 for(let i=0;i<13;i++){const x=64+r(-18,18),y=64+r(-18,18),radius=r(23,40),g=sc.createRadialGradient(x,y,0,x,y,radius);g.addColorStop(0,'rgba(244,248,255,.13)');g.addColorStop(.35,'rgba(238,244,255,.095)');g.addColorStop(.7,'rgba(231,239,255,.025)');g.addColorStop(1,'rgba(235,244,255,0)');sc.fillStyle=g;sc.fillRect(0,0,128,128)}
 const glow=document.createElement('canvas');glow.width=64;glow.height=64;const gc=glow.getContext('2d'),gg=gc.createRadialGradient(32,32,0,32,32,31);gg.addColorStop(0,'rgba(255,255,255,.85)');gg.addColorStop(.18,'rgba(235,244,255,.5)');gg.addColorStop(.6,'rgba(218,235,255,.12)');gg.addColorStop(1,'rgba(255,255,255,0)');gc.fillStyle=gg;gc.fillRect(0,0,64,64);
 function resize(){const oldW=width||1,oldH=height||1;width=hero.clientWidth;height=hero.clientHeight;plane.x=plane.x/oldW*width;plane.y=plane.y/oldH*height;target.x=clamp(target.x,50,width-50);target.y=clamp(target.y,70,height-70);dpr=Math.min(devicePixelRatio||1,1.75);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);trail=[];renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setSize(width,height);camera.aspect=width/height;camera.position.z=height/(2*Math.tan(Math.PI/8));camera.updateProjectionMatrix();drawPlane()}
 function drawPlane(){
  aircraft.position.set(plane.x-width/2,height/2-plane.y,0);
  aircraft.rotation.z=-plane.a-Math.PI/2;
  body.rotation.x=.50+Math.sin(clock*.7)*.065+Math.min(.12,Math.abs(plane.bank)*.12);
  body.rotation.y=-plane.bank*1.75;
  body.rotation.z=-plane.bank*.16;
  const scale=width<760?.91:1.23;aircraft.scale.setScalar(scale);
  aircraft.updateMatrixWorld(true);renderer.render(scene,camera);
 }
 function setLabel(){const running=enabled&&!query.matches;$('#toggle-flight').textContent=query.matches?'flight: reduced':`flight: ${running?'on':'paused'}`;$('#toggle-flight').setAttribute('aria-pressed',running);layer.classList.toggle('paused',!running)}
 function clearTrail(){trail=[];ctx.clearRect(0,0,width,height);toast('Clear skies. Ready for another flight.')}
 function point(e){if(e.target.closest('button,a,input,textarea,dialog'))return;const box=hero.getBoundingClientRect();target.x=clamp(e.clientX-box.left,55,width-55);target.y=clamp(e.clientY-box.top,75,height-65);target.last=clock;target.active=true;marker.style.transform=`translate3d(${target.x-8}px,${target.y-8}px,0)`;marker.classList.add('show')}
 hero.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')point(e)},{passive:true});
 hero.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,input,textarea,dialog'))return;point(e);if(enabled&&!query.matches)boost=1},{passive:true});
 hero.addEventListener('pointerleave',()=>{target.active=false;marker.classList.remove('show')});
 $('#toggle-flight').onclick=()=>{if(query.matches){toast('Reduced motion is enabled. The airplane stays still.');return}enabled=!enabled;safeStorage.set('found-flight',enabled);setLabel();if(!enabled)marker.classList.remove('show')};
 $('#clear-trail').onclick=clearTrail;
 $('#launch-plane').onclick=()=>{if(query.matches){toast('The airplane stays still with reduced motion enabled.');return}enabled=true;safeStorage.set('found-flight',true);setLabel();boost=1;target.active=false;hero.scrollIntoView({behavior:'smooth',block:'start'});toast('Move your cursor to guide the airplane. Click for a flyby.')};
 function emit(x,y,side){
  const scale=width<760?.91:1.23,point=new THREE.Vector3();
  exhausts[side<0?0:1].getWorldPosition(point);point.project(camera);
  const nx=-Math.sin(plane.a),ny=Math.cos(plane.a),rearX=(point.x+1)*width/2+(x-plane.x),rearY=(1-point.y)*height/2+(y-plane.y);
  trail.push({x:rearX+r(-1,1),y:rearY+r(-1,1),vx:-Math.cos(plane.a)*r(6,14)+nx*side*4,vy:-Math.sin(plane.a)*r(6,14)+ny*side*4,age:0,life:r(3.1,4.4),radius:r(3,5)*scale,growth:r(5.5,9.5)*scale,phase:r(0,Math.PI*2),spin:r(-.28,.28),rot:r(0,Math.PI*2),alpha:r(.55,.85),side,nx,ny});
 }
 function smoke(dt){
  ctx.clearRect(0,0,width,height);const active=[];
  // A faint continuous vapour core joins the turbulent puffs into one wake.
  for(const side of [-1,1]){const points=trail.filter(p=>p.side===side);for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];if(Math.hypot(a.x-b.x,a.y-b.y)>30)continue;const fade=Math.pow(Math.max(0,1-b.age/b.life),1.7);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(241,247,255,${fade*.10})`;ctx.lineWidth=1.4+b.age*2.0;ctx.lineCap='round';ctx.shadowColor='rgba(241,247,255,.38)';ctx.shadowBlur=4+b.age*2;ctx.stroke()}}ctx.shadowBlur=0;

  for(const p of trail){p.age+=dt;if(p.age>=p.life)continue;const t=p.age/p.life,swirl=Math.sin(p.age*1.4+p.phase),curl=Math.cos(p.age*1.1+p.phase);p.vx+=(swirl*3+p.nx*p.side*.8)*dt;p.vy+=(curl*3-2.2)*dt;p.vx*=Math.exp(-.12*dt);p.vy*=Math.exp(-.12*dt);p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.spin*dt;const radius=p.radius+p.age*p.growth,fade=Math.pow(1-t,1.45)*Math.min(1,p.age*12+.4)*p.alpha;
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=fade;ctx.drawImage(cloud,-radius*1.6,-radius*1.25,radius*3.2,radius*2.5);ctx.restore();
   if(p.age<.30){const core=(1-p.age/.3)*.20;ctx.globalAlpha=core;ctx.drawImage(glow,p.x-5,p.y-5,10,10)}active.push(p);
  }
  ctx.globalAlpha=1;trail=active;
 }
 function step(time){const dt=last?Math.min(time-last,.035):.016;last=time;if(!visible||document.hidden||!ready)return;
  if(!enabled||query.matches||document.querySelector('dialog[open]')){if(trail.length)smoke(dt);return}
  clock+=dt;boost=Math.max(0,boost-dt*.45);
  const manual=target.active&&clock-target.last<7;
  let tx,ty;
  if(manual){const radius=width<760?32:44;tx=target.x+Math.cos(clock*.65)*radius;ty=target.y+Math.sin(clock*.65)*radius*.7}
  else{marker.classList.remove('show');const t=clock*.23;tx=width*(.51+.30*Math.cos(t));ty=height*(width<760?.19+.09*Math.sin(t*1.38):.28+.17*Math.sin(t*1.38))}
  tx=clamp(tx,55,width-55);ty=clamp(ty,70,height-65);
  const dx=tx-plane.x,dy=ty-plane.y,dist=Math.hypot(dx,dy),edge=70;
  let ax=dx/(dist||1),ay=dy/(dist||1);
  if(plane.x<edge)ax+=(edge-plane.x)/edge*3;if(plane.x>width-edge)ax-=(plane.x-(width-edge))/edge*3;
  if(plane.y<edge)ay+=(edge-plane.y)/edge*3;if(plane.y>height-edge)ay-=(plane.y-(height-edge))/edge*3;
  const desired=Math.atan2(ay,ax),delta=Math.atan2(Math.sin(desired-plane.a),Math.cos(desired-plane.a)),maxTurn=(width<760?2.0:1.65)+boost*.6,turn=clamp(delta*2.8,-maxTurn,maxTurn);
  plane.a+=turn*dt;plane.bank+=(clamp(turn*.28,-.65,.65)-plane.bank)*(1-Math.exp(-4*dt));
  const cruise=(width<760?60:78)+Math.min(dist*.28,width<760?60:95),wanted=(cruise+boost*75)*(1-Math.min(Math.abs(turn)*.07,.19));plane.speed+=(wanted-plane.speed)*(1-Math.exp(-2.4*dt));
  const oldX=plane.x,oldY=plane.y;plane.x+=Math.cos(plane.a)*plane.speed*dt;plane.y+=Math.sin(plane.a)*plane.speed*dt;
  // Bound the scene after resizes; steering turns it back well before the edge.
  plane.x=clamp(plane.x,18,width-18);plane.y=clamp(plane.y,25,height-25);
  drawPlane();emission+=dt*(width<760?44:78);const count=Math.min(4,Math.floor(emission));if(count){emission-=count;for(let i=0;i<count;i++){const mix=(i+1)/count;emit(oldX+(plane.x-oldX)*mix,oldY+(plane.y-oldY)*mix,-1);emit(oldX+(plane.x-oldX)*mix,oldY+(plane.y-oldY)*mix,1)}}
  const cap=width<760?360:760;if(trail.length>cap)trail.splice(0,trail.length-cap);smoke(dt);
 }
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(!visible){trail=[];ctx.clearRect(0,0,width,height)}},{threshold:.01}).observe(hero);
 new ResizeObserver(resize).observe(hero);query.addEventListener('change',()=>{setLabel();clearTrail()});
 ready=true;layer.classList.add('ready');
 if(window.gsap)gsap.ticker.add(step);else{const loop=ms=>{step(ms/1000);raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop)}
 resize();setLabel();
}
try{initFlight()}catch(error){console.error(error);document.querySelector(".flight-layer").hidden=true;document.querySelector("#toggle-flight").textContent="3D unavailable";}
