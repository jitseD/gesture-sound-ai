
// --- selectors --- //

const $canvas = document.querySelector('.canvas--canvas');
const $video = document.querySelector(`.video`);
const $loader = document.querySelector(`.camera__loader`);
const $visualizers = document.querySelectorAll(`.sound__visualizer`);


// --- global variables --- //

let players = [];
let currentPlayer = 0;


// --- objects --- //

const hand = {
    classifier: null,
    inputs: null,
    modelLoaded: false,
    prevPose: 0,
    ctx: null,
    canvas: document.querySelector('.canvas--hand')
}

const face = {
    classifier: null,
    inputs: null,
    modelLoaded: false,
    prevPose: 0,
    ctx: null,
    canvas: document.querySelector('.canvas--face')
}

const sounds = [
    { num: 0, name: 'nothing is playing', sign: '', src: '', sameCount: 0 },
    { num: 1, name: 'beat', sign: 'finger up', src: './assets/sound/beat.mp3', sameCount: 0 },
    { num: 2, name: 'beatboxing', sign: 'cover mouth', src: './assets/sound/beatboxing.mp3', sameCount: 0 },
    { num: 3, name: 'bubbles', sign: 'fingers together', src: './assets/sound/bubbles.mp3', sameCount: 0 },
    { num: 4, name: 'chime', sign: 'piano', src: './assets/sound/chime.mp3', sameCount: 0 },
    { num: 5, name: 'comic', sign: 'walking', src: './assets/sound/comic.mp3', sameCount: 0 },
    { num: 6, name: 'drop', sign: 'hand down', src: './assets/sound/drop.mp3', sameCount: 0 },
    { num: 7, name: 'heartbeat', sign: 'on heart', src: './assets/sound/heartbeat.mp3', sameCount: 0 },
    { num: 8, name: 'knocking', sign: 'fist', src: './assets/sound/knocking.mp3', sameCount: 0 }
]

const boxes = [
    { num: 9, name: 'zero', sign: 'right fist', soundName: '', volume: 0, speed: 1, loop: true, currentState: false, newState: false, color: '#FEDBBB', sameCount: 0 },
    { num: 10, name: 'one', sign: 'one finger', soundName: '', volume: 0, speed: 1, loop: true, currentState: false, newState: false, color: '#FF5F65', sameCount: 0 },
    { num: 11, name: 'two', sign: 'two fingers', soundName: '', volume: 0, speed: 1, loop: true, currentState: false, newState: false, color: '#FFA32A', sameCount: 0 },
    { num: 12, name: 'three', sign: 'three fingers', soundName: '', volume: 0, speed: 1, loop: true, currentState: false, newState: false, color: '#4C66F0', sameCount: 0 },
    { num: 13, name: 'four', sign: 'four fingers', soundName: '', volume: 0, speed: 1, loop: true, currentState: false, newState: false, color: '#1B6457', sameCount: 0 }
]

const actions = [
    { num: 14, name: 'pause', sign: 'palm', action: false, sameCount: 0 },
    { num: 15, name: 'play', sign: 'backhand', action: true, sameCount: 0 }
]

const manipulations = [
    { num: 0, name: 'nothing is happening', expression: '', action: '' },
    { num: 1, name: 'louder', expression: 'open mouth', action: 'higher', object: 'volume', sameCount: 0 },
    { num: 2, name: 'softer', expression: 'frowning', action: 'lower', object: 'volume', sameCount: 0 },
    { num: 3, name: 'slower', expression: 'look left', action: 'lower', object: 'speed', sameCount: 0 },
    { num: 4, name: 'faster', expression: 'look right', action: 'higher', object: 'speed', sameCount: 0 },
    { num: 5, name: 'higher', expression: 'look up', action: 'true', object: 'loop', sameCount: 0 },
    { num: 6, name: 'lower', expression: 'look down', action: 'false', object: 'loop', sameCount: 0 },
]


// --- initialization functions --- //

const playVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    $video.srcObject = stream;
    $video.play();

    $video.addEventListener('canplay', () => {
        $loader.textContent = `Set ...`;
    })
}

const createPlayers = () => {
    for (let i = 0; i < boxes.length; i++) {
        const player = new Tone.Player().toDestination();
        players.push(player);
    }
}

const createCanvases = () => {
    const ctx = $canvas.getContext('2d');
    hand.ctx = hand.canvas.getContext('2d');
    face.ctx = face.canvas.getContext('2d');

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

const modelLoadedHandler = () => {
    hand.classifier.load('./assets/data/handPoseModel.json', () => {
        hand.modelLoaded = true;
    });

    face.classifier.load('./assets/data/faceMeshModel.json', () => {
        face.modelLoaded = true;
        $loader.textContent = `Go !`;
        setTimeout(() => {
            $loader.classList.add(`hide`);
        }, 1000);
    });
}


// --- hand functions --- //

const handPoseResultHandler = (results) => {
    hand.ctx.clearRect(0, 0, 640, 480);

    if (!results.length) return;

    if (hand.modelLoaded && face.modelLoaded) {
        hand.ctx.fillStyle = '#333549';
        results[0].landmarks.forEach((landmark) => {
            hand.ctx.beginPath();
            hand.ctx.arc(landmark[0], landmark[1], 3, 0, 2 * Math.PI);
            hand.ctx.fill();
        });

        hand.inputs = results[0].landmarks.flat();

        hand.classifier.classify(hand.inputs, handClassifyResultHandler);
    }
}

const handClassifyResultHandler = (error, result) => {
    if (error) {
        return console.error(error);
    }
    const handPoseNum = Number(result.label)

    let handPoseLabel;

    if (handPoseNum < sounds.length) {
        const matchingSound = sounds[handPoseNum];
        handPoseLabel = matchingSound.name;

        updateSound(matchingSound);
    } else if (handPoseNum < sounds.length + boxes.length) {
        const matchingSoundBox = boxes[handPoseNum - 9];
        handPoseLabel = matchingSoundBox.name;

        updateSoundBox(matchingSoundBox);
    } else {
        const matchingSoundAction = actions[handPoseNum - 14];
        handPoseLabel = matchingSoundAction.name;

        updateSoundAction(matchingSoundAction);
    }

    hand.prevPose = handPoseNum;
}


// --- face functions --- //

const faceMeshResultHandler = (results) => {
    face.ctx.clearRect(0, 0, 640, 480);

    if (!results.length) return;

    if (hand.modelLoaded && face.modelLoaded) {
        face.ctx.fillStyle = '#333549';
        results[0].scaledMesh.forEach((mesh) => {
            face.ctx.beginPath();
            face.ctx.arc(mesh[0], mesh[1], 2, 0, 2 * Math.PI);
            face.ctx.fill();
        });

        face.inputs = results[0].scaledMesh.flat();

        face.classifier.classify(face.inputs, faceClassifyResultHandler);
    }
}

const faceClassifyResultHandler = (error, result) => {
    if (error) {
        return console.error(error);
    }

    const matchingManipulations = manipulations[Number(result.label)];

    if (face.prevPose !== matchingManipulations.num) {
        matchingManipulations.sameCount = 0;
    } else {
        matchingManipulations.sameCount++;
    }

    if (matchingManipulations.sameCount > 10 && matchingManipulations.num !== 0) {
        updateManipulations(matchingManipulations);
    }

    face.prevPose = matchingManipulations.num;
    updatePlayer();
    updateVisualizers();
}


// --- update functions --- //

const updateSound = (newSound) => {
    if (hand.prevPose !== newSound.num) {
        sounds.forEach(sound => {
            sound.sameCount = 0;
        });
        newSound.sameCount = 0;
    }

    if (newSound.sameCount > 10) {
        if (boxes[currentPlayer].soundName !== newSound.name && newSound.num !== 0) {
            players[currentPlayer].stop();
            players[currentPlayer].load(newSound.src).then(() => {
                players[currentPlayer].start();
                boxes[currentPlayer].currentState = true;
                boxes[currentPlayer].newState = true;
            });
            boxes[currentPlayer].soundName = newSound.name;
        }
    }

    newSound.sameCount++;
}

const updateSoundBox = (newBox) => {
    if (hand.prevPose !== newBox.num) {
        boxes.forEach(box => {
            box.sameCount = 0;
        })
        newBox.sameCount = 0;
    }

    if (newBox.sameCount > 10) {
        currentPlayer = newBox.num - 9;
        document.querySelector(`body`).style.backgroundColor = newBox.color;
    }

    newBox.sameCount++;
}

const updateSoundAction = (newAction) => {
    if (hand.prevPose !== newAction.num) {
        actions.forEach(action => {
            action.sameCount = 0;
        })
        newAction.sameCount = 0;
    }

    if (newAction.sameCount > 10 && boxes[currentPlayer].soundName !== '') {
        boxes[currentPlayer].newState = newAction.action;
        updatePlayer();
        updateVisualizers();
    }

    newAction.sameCount++;
}

const updateManipulations = (manipulation) => {
    let volume = boxes[currentPlayer].volume;
    let speed = boxes[currentPlayer].speed;

    if (manipulation.object === 'volume') {
        if (manipulation.action === 'higher') {
            volume += 0.1;
            boxes[currentPlayer].volume = Math.round(volume * 10) / 10;
        } else if (manipulation.action === 'lower') {
            volume -= 0.1;
            boxes[currentPlayer].volume = Math.round(volume * 10) / 10;
        }
    } else if (manipulation.object === 'speed') {
        if (manipulation.action === 'higher' && speed < 8.0) {
            speed += 0.01;
            boxes[currentPlayer].speed = Math.round(speed * 100) / 100;
        } else if (manipulation.action === 'lower' && speed > 0.1) {
            speed -= 0.01;
            boxes[currentPlayer].speed = Math.round(speed * 100) / 100;
        }
    } else if (manipulation.object === 'loop') {
        if (manipulation.action === 'true') {
            boxes[currentPlayer].loop = true;
        } else if (manipulation.action === 'false') {
            boxes[currentPlayer].loop = false;
        }
    }
}

const updatePlayer = () => {
    for (let i = 0; i < players.length; i++) {
        players[i].volume.value = boxes[i].volume;                // -00 to +00
        players[i].playbackRate = boxes[i].speed;                 // 0.1 to 8.0
        players[i].loop = boxes[i].loop;

        if (boxes[i].currentState !== boxes[i].newState) {
            if (boxes[i].newState) {
                players[i].start();
                console.log(`playing`);
                
            } else {
                players[i].stop();
            }
            boxes[i].currentState = boxes[i].newState;
        }
    }
}

const updateVisualizers = () => {
    for (let i = 0; i < $visualizers.length; i++) {
        $visualizers[i].querySelector(`.sound__color`).style.backgroundColor = boxes[i].color;
        if (boxes[i].currentState) {
            $visualizers[i].querySelector(`.sound__pause`).classList.remove(`hide`);
            $visualizers[i].querySelector(`.sound__play`).classList.add(`hide`);
        } else {
            $visualizers[i].querySelector(`.sound__play`).classList.remove(`hide`);
            $visualizers[i].querySelector(`.sound__pause`).classList.add(`hide`);
        }
        if (boxes[i].soundName !== '') {
            $visualizers[i].querySelector(`.sound__name`).textContent = boxes[i].soundName;
        } else {
            $visualizers[i].querySelector(`.sound__name`).textContent = `empty`;
        }
        $visualizers[i].querySelector(`.sound__volume`).textContent = `${boxes[i].volume}v`;
        $visualizers[i].querySelector(`.sound__speed`).textContent = `${boxes[i].speed}s`;
        if (boxes[i].loop) {
            $visualizers[i].querySelector(`.sound__noloop`).classList.remove(`hide`);
            $visualizers[i].querySelector(`.sound__loop`).classList.add(`hide`);
        } else {
            $visualizers[i].querySelector(`.sound__loop`).classList.remove(`hide`);
            $visualizers[i].querySelector(`.sound__noloop`).classList.add(`hide`);
        }
    }
}


// --- init --- //

const init = async () => {
    playVideo();
    createPlayers();
    createCanvases();
    updateVisualizers();

    hand.classifier = ml5.KNNClassifier();
    const handpose = await ml5.handpose($video);
    handpose.on('predict', handPoseResultHandler);


    face.classifier = ml5.KNNClassifier();
    const facemesh = await ml5.facemesh($video);
    facemesh.on('predict', faceMeshResultHandler);

    modelLoadedHandler();
}

init();
