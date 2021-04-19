import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils.js';
import { BrowserService } from '../browser.service';

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
var camera: THREE.PerspectiveCamera;
var controls: OrbitControls;
const scene = new THREE.Scene();


const size = 20000;
const divisions = size / 100;

const gridHelper = new THREE.GridHelper( size, divisions, new THREE.Color(0.2,0.2,0.2), new THREE.Color(0.2,0.2,0.2) );
scene.add( gridHelper );

let scores: Record<number, number> = {};

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

export class FileManager {
    FilePath: any;
    FileDataView: any;
    Material: any;
    Geometry: any;
    VelocityGeometry: any;
    Line: any;
    Points: any;
    Samples: any;
    LastSample: any;

    cubegeometry = new THREE.BoxGeometry();
    cubematerial: any;
    cube: any;

    constructor(filePath: any, dataView: DataView) {
        this.FilePath = filePath;
        this.FileDataView = dataView;
        var randomColor = 0x1000000 + Math.random() * 0xffffff
        this.cubematerial = new THREE.MeshBasicMaterial({ color: randomColor });
        this.cube = new THREE.Mesh(this.cubegeometry, this.cubematerial);
        this.Material = new THREE.LineBasicMaterial({
            color: randomColor,
            linewidth: 100
        });
        controls.object.position.set(camera.position.x, camera.position.y, camera.position.z);
        scene.add(this.cube);
        this.create();
    }
    create() {
        this.Samples = [];
        this.Points = [];
        for (var i = 0; i < this.FileDataView.byteLength; i += 76) {
            var s = new Sample(this.FileDataView, i);
            if (i + 84 >= this.FileDataView.byteLength) {
                if (scores[s.CurrentRaceTime]) {
                    scores[s.CurrentRaceTime]++;
                } else {
                    scores[s.CurrentRaceTime] = 0;
                }
                break;
            }
            this.Samples.push(s);
            this.Points.push(s.Position);
        }
        console.log(scores);
        this.Geometry = new THREE.BufferGeometry().setFromPoints(this.Points);
        this.Line = new THREE.Line(this.Geometry, this.Material);
        scene.add(this.Line);
        if (camera.position.x == 0 &&
            camera.position.y == 0 &&
            camera.position.z == 0) {
            
            controls.target = new THREE.Vector3(this.Samples[0].Position.x, this.Samples[0].Position.y, this.Samples[0].Position.z);
            //camera.position.set(this.Samples[0].Position.x, this.Samples[0].Position.y, this.Samples[0].Position.z);
            //camera.lookAt(this.Samples[0].Position.x, this.Samples[0].Position.y, this.Samples[0].Position.z);
            controls.update();
        }
    }
    destroy() {
        scene.remove(this.Line);
    }
    loadUntil(racetime: any) {

        for (var i = 0; i < this.Samples.length; i++) {
            if (this.Samples[i].CurrentRaceTime <= racetime && !this.Samples[i].Loaded) {
                this.Points.push(this.Samples[i].Position);
                this.Samples[i].Loaded = true;
                this.LastSample = this.Samples[i];
            }
        }
        var xd = new THREE.Vector3().copy(this.LastSample.Position);
        var newPos = xd.add(this.LastSample.Velocity);
        if (newPos) {
            this.cube.position.x = newPos.x;
            this.cube.position.y = newPos.y;
            this.cube.position.z = newPos.z;
        }
        this.Geometry = new THREE.BufferGeometry().setFromPoints(this.Points);
        this.Line = new THREE.Line(this.Geometry, this.Material);
        scene.add(this.Line);
    }
}

export class Sample {
    OffSet: any;
    CurrentRaceTime: any;
    Position: THREE.Vector3;
    AimYaw: any;
    AimPitch: any;
    AimDirection: THREE.Vector3;
    Velocity: THREE.Vector3;
    Speed: any;
    InputSteer: any;
    InputGasPedal: any;
    InputIsBraking: any;
    EngineRpm: any;
    EngineCurGear: any;
    WheelsContactCount: any;
    WheelsSkiddingCount: any;
    UISequence: any;
    Loaded: any = false;
    constructor(dataView: DataView, offset: number) {
        this.OffSet = offset;
        this.CurrentRaceTime = this.readInt32(dataView);
        this.Position = this.readVector3(dataView);
        this.AimYaw = this.readFloat(dataView);
        this.AimPitch = this.readFloat(dataView);
        this.AimDirection = this.readVector3(dataView);
        this.Velocity = this.readVector3(dataView);
        this.Speed = this.readFloat(dataView);
        this.InputSteer = this.readFloat(dataView);
        var gazAndBrake = this.readInt32(dataView);
        this.InputGasPedal = gazAndBrake & 1;
        this.InputIsBraking = gazAndBrake & 2;
        this.EngineRpm = this.readFloat(dataView);
        this.EngineCurGear = this.readInt32(dataView);
        this.WheelsContactCount = this.readInt32(dataView);
        this.WheelsSkiddingCount = this.readInt32(dataView);
    }
    readInt32(dataView: DataView) {
        this.OffSet += 4;
        return (dataView.getInt32(this.OffSet - 4, true));
    }
    readFloat(dataView: DataView) {
        this.OffSet += 4;
        return (dataView.getFloat32(this.OffSet - 4, true));
    }
    readVector3(dataView: DataView) {
        var x = this.readFloat(dataView);
        var y = this.readFloat(dataView);
        var z = this.readFloat(dataView);
        return (new THREE.Vector3(x, y, z));
    }
}

@Component({
    selector: 'app-data-view',
    templateUrl: './data-view.component.html',
    styleUrls: ['./data-view.component.css']
})
export class DataViewComponent implements OnInit {
    @ViewChild('canvasContainer') el: any | undefined;
    loadedFiles: FileManager[] = [];
    controls: any;
    renderer: any;
    scene: any;
    camera: any;
    CurrentRaceTime: any = 0;
    CurrentRaceTimeIncrement: any = 15;
    constructor(private elementRef: ElementRef, private browserService: BrowserService) { }

    ngOnInit(): void {

    }
    onWindowResize() {
        console.log("resize");
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth - 1, window.innerHeight - 1);
    }
    onWindowResize2() {
        console.log("resize2");
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth - 1, window.innerHeight - 1);
    }
    ngAfterViewInit() {
        var d1 = this.elementRef.nativeElement.querySelector('.canvasContainer');
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 50000);
        controls = new OrbitControls(camera, renderer.domElement);
        renderer.setSize(window.innerWidth - 1, window.innerHeight - 1);
        d1.appendChild(renderer.domElement);
        animate();
        window.addEventListener('resize', this.onWindowResize, false );
        d1.addEventListener('resize', this.onWindowResize2, false );
        /*
        const hilbertPoints = GeometryUtils.hilbert3D( new THREE.Vector3( 0, 0, 0 ), 200.0, 1, 0, 1, 2, 3, 4, 5, 6, 7 );
        const geometry1 = new THREE.BufferGeometry();
        const subdivisions = 6;

        let vertices = [];
        let colors1 = [];
        const point = new THREE.Vector3();
        const color = new THREE.Color();
        const spline = new THREE.CatmullRomCurve3( hilbertPoints );
        for ( let i = 0; i < hilbertPoints.length * subdivisions; i ++ ) {

            const t = i / ( hilbertPoints.length * subdivisions );
            spline.getPoint( t, point );

            vertices.push( point.x, point.y, point.z );

            color.setHSL( 0.6, 1.0, Math.max( 0, - point.x / 200 ) + 0.5 );
            colors1.push( color.r, color.g, color.b );


        }
        var	material = new THREE.LineBasicMaterial( { color: 0xffffff, vertexColors: true } );
        geometry1.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        geometry1.setAttribute( 'color', new THREE.Float32BufferAttribute( colors1, 3 ) );
        
        const scale = 0.3, d = 225;

        var line = new THREE.Line( geometry1, material );
        line.scale.x = line.scale.y = line.scale.z = scale * 1.5;
        scene.add( line );
        
        controls.object.position.set(camera.position.x, camera.position.y, camera.position.z);
            controls.target = new THREE.Vector3(line.position.x, line.position.y, line.position.z);
            //camera.position.set(this.Samples[0].Position.x, this.Samples[0].Position.y, this.Samples[0].Position.z);
            //camera.lookAt(this.Samples[0].Position.x, this.Samples[0].Position.y, this.Samples[0].Position.z);
            controls.update();
            */
    }

    resumeReplay() {
        console.log(this.loadedFiles);
        this.CurrentRaceTime = -10;
        var that = this;
        that.loadedFiles.forEach(file => {
            file.destroy();
            file.Points = [];
        });
        setInterval(function () {
            that.CurrentRaceTime += that.CurrentRaceTimeIncrement;
            that.loadedFiles.forEach(file => {
                file.loadUntil(that.CurrentRaceTime);
                //controls.object.position.set(camera.position.x, camera.position.y, camera.position.z);
                controls.target = new THREE.Vector3(file.LastSample.Position.x, file.LastSample.Position.y, file.LastSample.Position.z);
            });
        }, 1);
    }

    speedSliderChange(e: any) {
        console.log(e);
        this.CurrentRaceTimeIncrement = e.value;
    }
    toggleData2(checked: any, raceData: any) {
        console.log(checked, raceData);
        if (checked) {
            var that = this;
            var rawFile = new XMLHttpRequest();

            rawFile.open("GET", "http://localhost:3000/get-race-data?filePath=" + raceData.file_path, true);
            rawFile.responseType = "arraybuffer";
            rawFile.onreadystatechange = function () {
                if (rawFile.readyState === 4) {
                    if (rawFile.status === 200 || rawFile.status == 0) {
                        var dataView = new DataView(rawFile.response);
                        var xd = new FileManager(raceData.file_path, dataView);
                        console.log(xd);
                        that.loadedFiles.push(xd);
                    }
                }
            }
            rawFile.send(null);
        } else {
            var file = this.loadedFiles.find((x: any) => x.FilePath == raceData.file_path);
            if (file) {
                file.destroy();
                var index = this.loadedFiles.indexOf(file);
                if (index > -1) {
                    this.loadedFiles.splice(index, 1);
                }
            }
        }
    }
    toggleData(checked: any, filePath: any) {
        if (checked) {
            var that = this;
            var rawFile = new XMLHttpRequest();

            rawFile.open("GET", "http://localhost:3000/get-race-data?filePath=" + filePath, true);
            rawFile.responseType = "arraybuffer";
            rawFile.onreadystatechange = function () {
                if (rawFile.readyState === 4) {
                    if (rawFile.status === 200 || rawFile.status == 0) {
                        var dataView = new DataView(rawFile.response);
                        var xd = new FileManager(filePath, dataView);
                        console.log(xd);
                        that.loadedFiles.push(xd);
                    }
                }
            }
            rawFile.send(null);
        } else {
            console.log("remove ", filePath);
            var file = this.loadedFiles.find((x: any) => x.FilePath == filePath);
            if (file) {
                file.destroy();
                var index = this.loadedFiles.indexOf(file);
                if (index > -1) {
                    this.loadedFiles.splice(index, 1);
                }
            }
        }
    }
}
