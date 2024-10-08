
// --- selectors --- //
let ctx;
const $canvas = document.querySelector('.canvas--canvas');
let ctxHandPose;
const $canvasHandPose = document.querySelector('.canvas--handpose');

let knnClassifier;
let inputs;

const $video = document.querySelector(`.video`);

// --- functions --- //
const playVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    $video.srcObject = stream;
    $video.play();
}

const createCanvases = () => {
    ctx = $canvas.getContext('2d');
    ctxHandPose = $canvasHandPose.getContext('2d');

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

const handPoseResultHandler = (results) => {
    ctxHandPose.clearRect(0, 0, 640, 480);

    if (!results.length) return;
    
    ctxHandPose.fillStyle = '#333549';
    results[0].landmarks.forEach((landmark) => {
        ctxHandPose.beginPath();
        ctxHandPose.arc(landmark[0], landmark[1], 3, 0, 2 * Math.PI);
        ctxHandPose.fill();
    });

    inputs = results[0].landmarks.flat();
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

    ctxHandPose = $canvasHandPose.getContext('2d');
    const handpose = await ml5.handpose($video);
    handpose.on('predict', handPoseResultHandler);

    knnClassifier = ml5.KNNClassifier();

    const $addDataButton = document.querySelector('.addData');
    $addDataButton.addEventListener('click', addDataHandler);

    const $classifyButton = document.querySelector('.classify');
    $classifyButton.addEventListener('click', classifyHandler);

    const $saveBtn = document.querySelector('.saveModel');
    $saveBtn.addEventListener('click', saveModelHandler);
}

init();

