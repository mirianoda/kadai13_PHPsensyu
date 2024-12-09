//モジュールの取得
const { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4, LocalVideoStream, LocalAudioStream, RemoteVideoStream, RemoteAudioStream} = skyway_room;

//SkyWay Auth Tokenの作成
import config from './config.js';
const token = new SkyWayAuthToken({
    jti: uuidV4(),
    iat: nowInSec(),
    exp: nowInSec() + 60 * 60 * 24,
    scope: {
      app: {
        id: config.skywayId,
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
  }).encode(config.skywayKey);

  //Mediapipeのセットアップ
  import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
  const { FaceLandmarker, FilesetResolver } = vision;

  //カメラ映像、マイク音声の取得
  (async () => {
    //HTMLの要素取得
    const joinScreen = document.getElementById('join-screen');
    const chatScreen = document.getElementById('chat-screen');
    const roomNameInput = document.getElementById("room-name");
    const roomNameDisplay = document.getElementById('room-name-display');
    const myId = document.getElementById("my-id");
    const joinButton = document.getElementById("join");
    const leaveButton = document.getElementById('leave');
    const previewContainer = document.getElementById('preview-container');
    const chatContainer = document.getElementById('chat-container');
    const localVideo = document.getElementById("local-video");
    const remoteMediaArea = document.getElementById("remote-media-area");
      
    const canvas = document.getElementById("my-canvas");
    const ctx = canvas.getContext("2d");

    const avatarElements = document.querySelectorAll('.animals span');
    let selectedAvatar = 'assets/azarashi.png'; // デフォルトのアバター

    let canvasStream = "";
    let processedAudioStream = "";

    // アバター選択のイベントリスナーを設定
    avatarElements.forEach((span) => {
      span.addEventListener('click', () => {
        // すべての選択を解除
        avatarElements.forEach((el) => el.classList.remove('selected'));
        // 選択された要素に "selected" クラスを追加
        span.classList.add('selected');
        // 選択されたアバターを更新
        selectedAvatar = span.dataset.avatar;
        console.log(`Selected avatar: ${selectedAvatar}`);
      });
    });  
    
    //映像を取得して加工
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      localVideo.srcObject = stream;
      localVideo.play();
  
      localVideo.addEventListener("loadeddata", async () => {
        canvas.width = localVideo.videoWidth;
        canvas.height = localVideo.videoHeight;
  
        console.log("Video loaded. Starting Face Landmark Detection...");
  
        const faceLandmarker = await initializeFaceLandmarker();
        startFaceLandmarkDetection(faceLandmarker);
        // 加工済み映像のストリームを取得
        canvasStream = canvas.captureStream(30); // 30fpsの映像ストリーム
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
              // avatarImg.src = "assets/avatar.png";
              avatarImg.src = selectedAvatar; // 選択されたアバターを使用
                          
              avatarImg.onload = () => {
                console.log("Avatar image loaded successfully");
              };
              
              if (results.faceLandmarks) {
                for (const landmarks of results.faceLandmarks) {
                  const nose = landmarks[1];
                  const x = nose.x * canvas.width;
                  const y = nose.y * canvas.height;
              
                  const size = 550; // アバター画像のサイズ
                  ctx.drawImage(avatarImg, x - size / 2, y - size / 2, size, size);
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

    // 音声を取得してエフェクトを適用
    const micAudio = new Tone.UserMedia();
    // マイクがオープンしたときのコールバック関数にgetUserMediaを格納
    micAudio.open().then( async() => {
      await Tone.start(); // 必要に応じてTone.jsのオーディオコンテキストを開始
      console.log('Tone.js audio context started');
      const shifter = new Tone.PitchShift(5);
      const reverb = new Tone.Freeverb();
      // 加工済みの音声を受け取る空のノードを用意
      const effectedDest = Tone.context.createMediaStreamDestination();
      micAudio.connect(shifter);
      shifter.connect(reverb);
      // リバーブを空のノードに接続
      reverb.connect(effectedDest);
      
      // カメラ映像取得
      navigator.mediaDevices.getUserMedia({audio: true})
        .then( stream => {
        // ストリームにエフェクトがかかった音声トラックを追加
        processedAudioStream = effectedDest.stream;
      }).catch( error => {
        // 失敗時にはエラーログを出力
        console.error('mediaDevice.getUserMedia() error:', error);
        return;
      });
    });   
        
  
  //room の作成と入室
  //joinボタンを押すと、トークンを使ってcontext（認証認可やログの設定方法が設定されたグローバルな情報）を作成
    joinButton.onclick = async () => {
      if (!roomNameInput.value) {
        alert("ルーム名を入力してください");
        return;
      }

      // CanvasをChatコンテナに移動
      chatContainer.appendChild(canvas);
      //画面を切り替え
      joinScreen.style.display = "none";
      chatScreen.style.display = "block";
      //入力したルーム名を動的に表示
      roomNameDisplay.textContent = roomNameInput.value;
      
      //contextを作成
      const context = await SkyWayContext.Create(token);
      //contextを使ってroomを作成
      const room = await SkyWayRoom.FindOrCreate(context, {
          type: "p2p", //”sfu”を指定すると SFU ルームを作成可能
          name: roomNameInput.value,
        });
      //ルームに入室し、Memberオブジェクトを取得
      const me = await room.join({
        name: String(userName) // PHPから渡された値を利用
      });
      console.log("Joined room as:", me.id,userName);

      document.getElementById("my-username").textContent = userName;  
      myId.textContent = me.id;
      
      //自分の音声と映像をパブリッシュ（Memberオブジェクトの中にpublish関数がある）
        const canvasStream = new LocalVideoStream(canvas.captureStream().getVideoTracks()[0]);
        const audioStream = new LocalAudioStream(processedAudioStream.getAudioTracks()[0]);
             
        await me.publish(canvasStream);
        await me.publish(audioStream);
      
      //相手の映像と音声を読み込み、表示する
      const subscribeAndAttach = async(publication) => {
      if (publication.publisher.id === me.id) return;

           try {
      const { stream } = await me.subscribe(publication.id); // ストリームを取得
            let newMedia;
      
            // 映像か音声に応じて要素を作成
            switch (stream.track.kind) {
              case "video":
                newMedia = document.createElement("video");
                // newMedia.playsInline = true;
                newMedia.autoplay = true;
                newMedia.controls = false; // コントロールを非表示にする
                newMedia.playsInline = true; // モバイルブラウザで必須
                break;
              case "audio":
                newMedia = document.createElement("audio");
                newMedia.controls = true; // コントロールを非表示にする
                newMedia.autoplay = true;
                break;
              default:
                console.warn("Unsupported media type:", stream.track.kind);
                return; // 映像でも音声でもない場合は無視
            }
      
            // 作成した要素にストリームをアタッチしてUIに追加
            newMedia.id = `media-${publication.id}`;
            if (newMedia) {
              stream.attach(newMedia);
              remoteMediaArea.appendChild(newMedia);
            } else {
              console.warn("Failed to create media element for stream:", stream);
            }                        
          } catch (error) {
            console.error("Failed to subscribe to stream:", error);
          }
        };

      room.publications.forEach(subscribeAndAttach); // 1
      //roomのpublicationsプロパティに、roomに存在するpublicationの配列が入っている

      room.onStreamPublished.add((e) => {
        console.log("Stream published by:", e.publication.publisher.id);
        subscribeAndAttach(e.publication);
      });
      //roomのonStreamPublishedはEvent型で、addという関数がある

    // 参加したメンバーの名前を取得して表示
    room.onMemberJoined.add((member) => {
      if (member.id !== me.id) {
        let peerUserName = member.name || "相手";
        document.getElementById("peer-username").textContent = peerUserName;
      
        // 名前を取得できるまで再確認
        const intervalId = setInterval(() => {
          const updatedMember = room.members.find((m) => m.id === member.id); // 参加したメンバーを特定
          if (updatedMember && updatedMember.name) {
            peerUserName = updatedMember.name; // 正しい名前を取得
            document.getElementById("peer-username").textContent = peerUserName;
            console.log("Updated peer username:", peerUserName);
            clearInterval(intervalId); // 確認が完了したら停止
          }
        }, 500); // 0.5秒ごとに確認
      }
    });
            
      
      // 相手が退出した場合の処理
      room.onMemberLeft.add((member) => {
        if (member.id !== me.id) {
          document.getElementById("peer-username").textContent = "相手が退室しました";
          console.log("Peer left the room");
        }
      });

      //既にいるメンバーの名前を取得して表示
      const existingMembers = room.members.filter((member) => member.id !== me.id);
      if (existingMembers.length > 0) {
        const peer = existingMembers[0]; // 最初の相手メンバーを取得
        const peerUserName = peer.name || "相手";
        document.getElementById("peer-username").textContent = peerUserName;
        console.log("Existing peer username:", peerUserName);
      }      
      
  //自分の退室処置
  leaveButton.onclick = async () => {
    await me.leave();
    await room.dispose();
  
    myId.textContent = "";
    remoteMediaArea.replaceChildren();
    // CanvasをPreviewコンテナに戻す
    previewContainer.appendChild(canvas);
    //参加前画面に切り替え
    chatScreen.style.display = "none";
    joinScreen.style.display = "block";
  };

  //相手の退室処理
  room.onStreamUnpublished.add((e) => {
    document.getElementById(`subscribe-button-${e.publication.id}`)?.remove();
    document.getElementById(`media-${e.publication.id}`)?.remove();
  });
 };
})();





