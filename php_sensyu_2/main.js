//モジュールの取得
const { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4, LocalVideoStream} = skyway_room;

//SkyWay Auth Tokenの作成
import skywayId from './config.js';
import skywayKey from './config.js';
const token = new SkyWayAuthToken({
    jti: uuidV4(),
    iat: nowInSec(),
    exp: nowInSec() + 60 * 60 * 24,
    scope: {
      app: {
        id: `${skywayId}`,
        turn: true,
        actions: ["read", "write"],
        channels: [
          {
            id: "*",
            name: "*",
            actions: ["write"],
            members: [
              {
                id: "*",
                name: "*",
                actions: ["write"],
                publication: {
                  actions: ["write"],
                },
                subscription: {
                    actions: ["write"],
                },
            },
        ],
            sfuBots: [
              {
                actions: ["write"],
                forwardings: [
                  {
                      actions: ["write"],
                  },
                ],
            },
            ],
        },
        ],
    },
},
  }).encode(`${skywayKey}`);

  //Mediapipeのセットアップ
  import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
  const { FaceLandmarker, FilesetResolver } = vision;

  //カメラ映像、マイク音声の取得
  (async () => {
      //HTMLの要素取得
    const localVideo = document.getElementById("local-video");
    const buttonArea = document.getElementById("button-area");
    const remoteMediaArea = document.getElementById("remote-media-area");
    const roomNameInput = document.getElementById("room-name");

    const myId = document.getElementById("my-id");
    const joinButton = document.getElementById("join");
    const leaveButton = document.getElementById('leave');

    const canvas = document.getElementById("my-canvas");
    const ctx = canvas.getContext("2d");
  
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      localVideo.srcObject = stream;
      localVideo.play();
  
      localVideo.addEventListener("loadeddata", async () => {
        canvas.width = localVideo.videoWidth;
        canvas.height = localVideo.videoHeight;
  
        console.log("Video loaded. Starting Face Landmark Detection...");
  
        const faceLandmarker = await initializeFaceLandmarker();
        startFaceLandmarkDetection(faceLandmarker);
      });
    });
  
    async function startFaceLandmarkDetection(faceLandmarker) {
      const detect = async () => {
        if (!localVideo.videoWidth || !localVideo.videoHeight) {
          requestAnimationFrame(detect);
          return;
        }
  
        const results = faceLandmarker.detectForVideo(localVideo, performance.now());
  
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(localVideo, 0, 0, canvas.width, canvas.height);

        if (results.faceLandmarks) {
            for (const landmarks of results.faceLandmarks) {
              const nose = landmarks[1];
              const x = nose.x * canvas.width;
              const y = nose.y * canvas.height;
          
              // アバター画像を描画
              const avatarImg = new Image();
              avatarImg.src = "assets/avatar.png";
                          
              avatarImg.onload = () => {
                console.log("Avatar image loaded successfully");
              };
              
              if (results.faceLandmarks) {
                for (const landmarks of results.faceLandmarks) {
                  const nose = landmarks[1];
                  const x = nose.x * canvas.width;
                  const y = nose.y * canvas.height;
              
                  const size = 400; // アバター画像のサイズ
                  ctx.drawImage(avatarImg, x - size / 2, y - size / 2 - 70, size, size);
                }
              }
            }
          }
  
        requestAnimationFrame(detect);
      };
  
      detect();
    }
  
    async function initializeFaceLandmarker() {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );
  
      const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
      });
  
      console.log("Face Landmarker initialized");
      return faceLandmarker;
    };
  
  //room の作成と入室
  //joinボタンを押すと、トークンを使ってcontext（認証認可やログの設定方法が設定されたグローバルな情報）を作成
    joinButton.onclick = async () => {
      if (roomNameInput.value === "") return; //roomnameが空の場合は戻る
  
      const context = await SkyWayContext.Create(token);
      
      //contextを使ってroomを作成
      const room = await SkyWayRoom.FindOrCreate(context, {
          type: "p2p", //”sfu”を指定すると SFU ルームを作成可能
          name: roomNameInput.value,
        });
      //ルームに入室し、Memberオブジェクトを取得
      const me = await room.join();
      console.log("Joined room as:", me.id);
        
      myId.textContent = me.id;
      
      //自分の音声と映像をパブリッシュ（Memberオブジェクトの中にpublish関数がある）
        const canvasStream = new LocalVideoStream(canvas.captureStream().getVideoTracks()[0]);
             
         try {
           console.log("Publishing media stream...");
           await me.publish(canvasStream); // 新しいストリームで送信
           console.log("Media stream published successfully");
         } catch (error) {
           console.error("Failed to publish media stream:", error);
         }
      
      //相手の映像と音声を読み込み、表示する
      const subscribeAndAttach = (publication) => {
      console.log("Attaching stream from publisher:", publication.publisher.id);
      if (publication.publisher.id === me.id) return;
      
      //相手のIDのボタンを作成する
      const subscribeButton = document.createElement("button"); // 3-1
      subscribeButton.id = `subscribe-button-${publication.id}`;
      subscribeButton.textContent = `${publication.publisher.id}: ${publication.contentType}`;
      
      buttonArea.appendChild(subscribeButton);
      
      //作成したボタンを押したときの処理
      subscribeButton.onclick = async () => {
          console.log("Subscribing to stream:", publication.id);
          const { stream } = await me.subscribe(publication.id); // 3-2-1、相手の情報を読み込み可能な形式で取得
          
      let newMedia; // 3-2-2、HTML要素として映像or音声データを作成し、画面に表示
      switch (stream.track.kind) {
        case "video":
          newMedia = document.createElement("video");
          newMedia.playsInline = true;
          newMedia.autoplay = true;
          break;
        case "audio":
            newMedia = document.createElement("audio");
          newMedia.controls = true;
          newMedia.autoplay = true;
          break;
          default:
          return;
        }
      newMedia.id = `media-${publication.id}`;
      stream.attach(newMedia); // 3-2-3
      remoteMediaArea.appendChild(newMedia);
    };
};

room.publications.forEach(subscribeAndAttach); // 1
//roomのpublicationsプロパティに、roomに存在するpublicationの配列が入っている
  
  room.onStreamPublished.add((e) => {
    console.log("Stream published by:", e.publication.publisher.id);
    subscribeAndAttach(e.publication);
  });
  //roomのonStreamPublishedはEvent型で、addという関数がある


  //自分の退室処置
  leaveButton.onclick = async () => {
    await me.leave();
    await room.dispose();
  
    myId.textContent = "";
    buttonArea.replaceChildren();
    remoteMediaArea.replaceChildren();
  };

  //相手の退室処理
  room.onStreamUnpublished.add((e) => {
    document.getElementById(`subscribe-button-${e.publication.id}`)?.remove();
    document.getElementById(`media-${e.publication.id}`)?.remove();
  });
 };
})();





