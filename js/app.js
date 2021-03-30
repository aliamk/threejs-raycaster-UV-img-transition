import * as THREE from 'three';
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import imagesLoaded from 'imagesLoaded';
import FontFaceObserver from 'fontfaceobserver';
import Scroll from './scroll';
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";

import ON from '../img/ON.jpg'
// import pink from '../img/pink.png'
// import pyramidSAmerica from '../img/pyramidSAmerica.jpg'


export default class Sketch {
  constructor(options) {
    this.time = 0;
    this.container = options.dom;
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color( 0x4c96f7 );

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, 100, 2000 );
    this.camera.position.z = 600;

    this.camera.fov = 2 * Math.atan( (this.height / 2) / 600 ) * (180 / Math.PI);

    //
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });

    this.renderer.setSize( this.width, this.height );
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // Store dom images in an array for looping in addImages()
    this.images = [ ...document.querySelectorAll('img')];

    // const fontOpen = new Promise(resolve => {
    //   new FontFaceObserver("Open Sans").load().then(() => {
    //     resolve();
    //   });
    // });

    // const fontPlayfair = new Promise(resolve => {
    //   new FontFaceObserver("Playfair Display").load().then(() => {
    //     resolve();
    //   });
    // });

    // Preload images
    const preloadImages = new Promise((resolve, reject) => {
        imagesLoaded(document.querySelectorAll("img"), { background: true }, resolve);
    });

    let allDone = [/*fontOpen, fontPlayfair,*/ preloadImages]
    this.currentScroll = 0;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    Promise.all(allDone).then(()=>{
      this.scroll = new Scroll();
      this.addImages();
      this.setPosition();
      this.mousemovement();
      this.resize();
      this.setupResize();
      // this.addObjects();
      this.render();

    })
  }
  
  mousemovement() {
    window.addEventListener( 'mousemove', (event) => {
      this.mouse.x = ( event.clientX / this.width ) * 2 - 1;
      this.mouse.y =- ( event.clientY / this.height ) * 2 + 1;
      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera( this.mouse, this.camera );
      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects( this.scene.children );

      if(intersects.length > 0){
          console.log('mousemovement: ', intersects[0]);
          let obj = intersects[0].object;
          obj.material.uniforms.hover.value = intersects[0].uv;
      }
  }, false );
}

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize( this.width, this.height );
    this.camera.aspect = this.width / this.height;    
    this.camera.updateProjectionMatrix();
  }

  addImages() {
    // Can't use raycaster with the MeshBasicMaterial - got to be customer shader
    this.material = new THREE.ShaderMaterial({
      uniforms: { 
        time: {value: 0},
        uImage: {value: 0},
        hover: { value: new THREE.Vector2(0.5, 0.5)},
        hoverState: { value: 0},
        onTexture: { value: new THREE.TextureLoader().load(ON)},
      },
      side: THREE.DoubleSide,
      fragmentShader: fragment, 
      vertexShader: vertex,
      // wireframe: true
    })

    this.materials = []

    this.imageStore = this.images.map(img => {
      let bounds = img.getBoundingClientRect()
      // console.log(bounds)
      let geometry = new THREE.PlaneBufferGeometry( bounds.width, bounds.height, 10, 10);
      let texture = new THREE.Texture(img);
      texture.needsUpdate = true;
      // let material = new THREE.MeshBasicMaterial({ 
      //   // color: 0xFF0000,
      //   map: texture
      // })
      let material = this.material.clone();      

      img.addEventListener('mouseenter', () => {
        console.log('enter')
        gsap.to(material.uniforms.hoverState, {
          duration: 1,
          value: 1
        })
      })

      img.addEventListener('mouseout', () => {
        console.log('out')
        gsap.to(material.uniforms.hoverState, {
          duration: 1,
          value: 0
        })
      })

      this.materials.push(material)
      material.uniforms.uImage.value = texture;
      
      let mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh)

      return {
        img: img,
        mesh: mesh,
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height
      }
    })
    console.log('imageStore: ', this.imageStore)
  }


  setPosition() {
    this.imageStore.forEach(o => {
      o.mesh.position.y = this.currentScroll - o.top + this.height / 2 - o.height / 2;
      o.mesh.position.x = o.left - this.width / 2  + o.width / 2;
    })
  }
 
  addObjects() {
    this.geometry = new THREE.PlaneBufferGeometry( 200, 400, 10, 10 );
      this.material = new THREE.MeshNormalMaterial();
      
      this.material = new THREE.ShaderMaterial({
        uniforms: { 
          time: {value: 0},
          onTexture: { value: new THREE.TextureLoader().load(ON)},
        },
        side: THREE.DoubleSide,
        fragmentShader: fragment, 
        vertexShader: vertex,
        // wireframe: true
      })
    
      this.mesh = new THREE.Mesh( this.geometry, this.material );
      // this.mesh.position.x = i - 1; 
      this.scene.add( this.mesh );
    // }
  }
  


  render() {
    this.time += 0.05;    

    this.scroll.render();
    this.currentScroll = this.scroll.scrollToRender;
    this.setPosition();
    // console.log(this.scroll.scrollToRender)
    // this.material.uniforms.time.value = this.time;  

    this.materials.forEach(material => {
      material.uniforms.time.value = this.time;
    })

    this.renderer.render( this.scene, this.camera);  
    window.requestAnimationFrame(this.render.bind(this));
  }
}



new Sketch({
  dom: document.getElementById("container")
});