// Project the same real mesh geometry when a browser has WebGL disabled.
export function softwareRenderer(THREE,canvas){
 const ctx=canvas.getContext('2d',{alpha:true});let ratio=1,w=1,h=1,last=0;
 const point=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),normal=new THREE.Vector3(),edge=new THREE.Vector3(),eye=new THREE.Vector3(),sun=new THREE.Vector3(-.4,.65,1).normalize();
 return {domElement:canvas,setClearColor(){},setPixelRatio(v){ratio=Math.min(v,1.4)},setSize(x,y){w=x;h=y;canvas.width=Math.round(x*ratio);canvas.height=Math.round(y*ratio);canvas.style.width=x+'px';canvas.style.height=y+'px'},render(scene,camera){
 const now=performance.now();if(now-last<40)return;last=now;scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);const faces=[];
 scene.traverse(object=>{if(!object.isMesh||!object.visible)return;const geo=object.geometry,pos=geo.attributes.position,index=geo.index,mat=object.material;
 for(let i=0;i<(index?index.count:pos.count);i+=3){
  a.fromBufferAttribute(pos,index?index.getX(i):i).applyMatrix4(object.matrixWorld);b.fromBufferAttribute(pos,index?index.getX(i+1):i+1).applyMatrix4(object.matrixWorld);c.fromBufferAttribute(pos,index?index.getX(i+2):i+2).applyMatrix4(object.matrixWorld);
  normal.subVectors(b,a).cross(edge.subVectors(c,a)).normalize();eye.subVectors(camera.position,a);if(normal.dot(eye)<=0)continue;
  const depth=(a.z+b.z+c.z)/3,lambert=Math.max(0,normal.dot(sun)),shine=Math.pow(Math.max(0,normal.dot(eye.normalize().add(sun).normalize())),35)*(mat.metalness||0)*.55;
  const light=mat.isMeshBasicMaterial?1:.48+lambert*.58+shine;
  const col=mat.color;const red=Math.min(255,Math.round((Math.pow(col.r,1/2.2)*light+shine*.15)*255)),green=Math.min(255,Math.round((Math.pow(col.g,1/2.2)*light+shine*.15)*255)),blue=Math.min(255,Math.round((Math.pow(col.b,1/2.2)*light+shine*.15)*255));
  const pts=[a,b,c].map(v=>{point.copy(v).project(camera);return[(point.x+1)*w/2,(1-point.y)*h/2]});faces.push({pts,depth,color:`rgb(${red},${green},${blue})`});
 }});faces.sort((a,b)=>a.depth-b.depth);ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);ctx.lineWidth=.45;
 for(const f of faces){ctx.beginPath();ctx.moveTo(...f.pts[0]);ctx.lineTo(...f.pts[1]);ctx.lineTo(...f.pts[2]);ctx.closePath();ctx.fillStyle=f.color;ctx.strokeStyle=f.color;ctx.fill();ctx.stroke()}
 }};
}
