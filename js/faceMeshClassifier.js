
// --- selectors --- //
let ctx;
const $canvas = document.querySelector('.canvas--canvas');
let ctxFaceMesh;
const $canvasFaceMesh = document.querySelector('.canvas--facemesh');

const $video = document.querySelector(`.video`);

let knnClassifier;
let inputs;

// --- functions --- //
const playVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    $video.srcObject = stream;
    $video.play();
}

const createCanvases = () => {
    ctx = $canvas.getContext('2d');
    ctxFaceMesh = $canvasFaceMesh.getContext('2d');

    ctx.strokeStyle = 'rgba(51,53,57,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(320, 0);
    ctx.lineTo(320, 480);
    ctx.moveTo(0, 240);
    ctx.lineTo(640, 240);
    ctx.stroke();
    ctx.closePath();
}

const faceMeshResultHandler = (results) => {
    ctxFaceMesh.clearRect(0, 0, 640, 480);
    
    if (!results.length) return;
    
    ctxFaceMesh.fillStyle = '#333549';
    results[0].scaledMesh.forEach((mesh) => {
        ctxFaceMesh.beginPath();
        ctxFaceMesh.arc(mesh[0], mesh[1], 2, 0, 2 * Math.PI);
        ctxFaceMesh.fill();
    });
    
    inputs = results[0].scaledMesh.flat();
}

const addDataHandler = () => {
    const $label = document.querySelector('.label');
    const output = $label.value;
    knnClassifier.addExample(inputs, output);
}

const classifyHandler = () => {
    knnClassifier.classify(inputs, classifyResultHandler);
}

const classifyResultHandler = (error, result) => {
    if (error) {
        return console.error(error);
    }
    console.log(result.label);
    document.querySelector('.status').textContent = result.label;
}

const saveModelHandler = () => {
    knnClassifier.save();
}

const init = async () => {
    playVideo();
    createCanvases();

    const facemesh = await ml5.facemesh($video);
    facemesh.on('predict', faceMeshResultHandler);
    
    knnClassifier = ml5.KNNClassifier();
    
    const $addDataButton = document.querySelector('.addData');
    $addDataButton.addEventListener('click', addDataHandler);
    
    const $classifyButton = document.querySelector('.classify');
    $classifyButton.addEventListener('click', classifyHandler);

    const $saveButton = document.querySelector('.saveModel');
    $saveButton.addEventListener('click', saveModelHandler);
}

init();

