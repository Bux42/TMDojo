import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils.js';
import { BrowserService } from '../browser.service';

type ColorMap = {value: number, color: {r: number, g: number, b: number}}[]

const COLOR_MAP_ACCELERATION: ColorMap = [
    { value: -0.2, color: { r: 0xff, g: 0x00, b: 0 } },
    { value: 0.0, color: { r: 0xff, g: 0xff, b: 0 } },
    { value: 0.2, color: { r: 0x00, g: 0xff, b: 0 } },
];

const COLOR_MAP_GEARS: ColorMap = [
    { value: 1.0, color: { r: 0xaa, g: 0x22, b: 0x66 } },
    { value: 2.0, color: { r: 0xee, g: 0x66, b: 0x77 } },
    { value: 3.0, color: { r: 0xcc, g: 0xbb, b: 0x44 } },
    { value: 4.0, color: { r: 0x66, g: 0xcc, b: 0xee } },
    { value: 5.0, color: { r: 0x22, g: 0x88, b: 0x33 } },
    { value: 6.0, color: { r: 0x66, g: 0x66, b: 0xff } },
    { value: 7.0, color: { r: 0xff, g: 0xff, b: 0xff } },
];

const getGearColor = (value: number) => {    
    return getColorFromMap(value, COLOR_MAP_GEARS);
}

const getAccelerationColor = (value: number) => {
    return getColorFromMap(value, COLOR_MAP_ACCELERATION);
}

const getColorFromMap = function (inputValue: number, colorMap: ColorMap) {
    for (var i = 1; i < colorMap.length - 1; i++) {
        if (inputValue < colorMap[i].value) {
            break;
        }
    }
    var lower = colorMap[i - 1];
    var upper = colorMap[i];

    var range = upper.value - lower.value;
    var rangePct = (inputValue - lower.value) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;

    var color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper) / 255,
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper) / 255,
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper) / 255,
    };
    return color;
};

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
var camera: THREE.PerspectiveCamera;
var controls: OrbitControls;
const scene = new THREE.Scene();


const size = 20000;
const divisions = size / 100;

const gridHelper = new THREE.GridHelper(size, divisions, new THREE.Color(0.2, 0.2, 0.2), new THREE.Color(0.2, 0.2, 0.2));
scene.add(gridHelper);

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
    RandomColor: any;
    RandomColorR: any;
    RandomColorG: any;
    RandomColorB: any;
    LastSample: any;

    Colors: any[] = [];

    cubegeometry = new THREE.BoxGeometry();
    cubematerial: any;
    cube: any;

    constructor(filePath: any, dataView: DataView, lineMode: any) {
        this.FilePath = filePath;
        this.FileDataView = dataView;
        this.RandomColor = 0x1000000 + Math.random() * 0xffffff;
        this.RandomColorR = (Math.random() * (1 - 0.5) + 0.5).toFixed(4);
        this.RandomColorG = (Math.random() * (1 - 0.5) + 0.5).toFixed(4);
        this.RandomColorB = (Math.random() * (1 - 0.5) + 0.5).toFixed(4);
        this.cubematerial = new THREE.MeshBasicMaterial({ color: this.RandomColor });
        this.cube = new THREE.Mesh(this.cubegeometry, this.cubematerial);
        this.Material = new THREE.LineBasicMaterial({
            vertexColors: true,
            linewidth: 100,
        });
        controls.object.position.set(camera.position.x, camera.position.y, camera.position.z);
        scene.add(this.cube);
        this.create(lineMode);
    }
    create(lineMode: any) {
        this.Samples = [];
        this.Points = [];

        var prevS = undefined;
        var prevDiff = 0;

        for (var i = 0; i < this.FileDataView.byteLength; i += 76) {
            var s = new Sample(this.FileDataView, i);
            if (lineMode == "Classic") {
                this.Colors.push(this.RandomColorR, this.RandomColorG, this.RandomColorB);
            } else if (lineMode == "Velocity") {
                if (prevS != undefined) {
                    const vDiff = s.Velocity.length() - prevS.Velocity.length();

                    var diffColor = getAccelerationColor(vDiff);
                    if (vDiff == 0.0) {
                        diffColor = getAccelerationColor(prevDiff);
                    }
                    this.Colors.push(diffColor.r, diffColor.g, diffColor.b);

                    if (vDiff != 0.0) {
                        prevDiff = vDiff;
                    }
                } else {
                    this.Colors.push(0, 0, 0);
                }
            } else if (lineMode == "Gear") {
                var gearColor = getGearColor(s.EngineCurGear);                
                this.Colors.push(gearColor.r, gearColor.g, gearColor.b);
            }
            this.Samples.push(s);
            this.Points.push(s.Position);
            prevS = s;
        }
        this.Geometry = new THREE.BufferGeometry().setFromPoints(this.Points).setAttribute(
            'color',
            new THREE.Float32BufferAttribute(this.Colors, 3)
        );;
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
        this.Points = [];
        this.Colors = [];
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

    lineModeSelected: any = "Classic";
    lineModes: any[] = ["Classic", "Velocity", "Gear"];
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
        window.addEventListener('resize', this.onWindowResize, false);
        d1.addEventListener('resize', this.onWindowResize2, false);
    }

    resumeReplay() {
        console.log(this.loadedFiles);
        this.CurrentRaceTime = -10;
        var that = this;
        that.loadedFiles.forEach(file => {
            file.destroy();
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
                        var xd = new FileManager(raceData.file_path, dataView, that.lineModeSelected);
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
    lineModeChanged(lineMode: any) {
        console.log(lineMode);
        console.log(this.loadedFiles);
        this.loadedFiles.forEach(file => {
            file.destroy();
            file.create(lineMode);
        });
    }
}
