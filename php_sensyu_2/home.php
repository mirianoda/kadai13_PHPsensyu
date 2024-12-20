<?php
//0. SESSION開始！！
session_start();

//１．関数群の読み込み
include("funcs.php");

//LOGINチェック → funcs.phpへ関数化しましょう！
sschk();
?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Animal Chat</title>
    <link rel="stylesheet" href="css/home.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bungee+Tint&family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400..900&family=Dongle:wght@300;400;700&family=Galada&family=Montserrat+Alternates:wght@100;200;300;400&family=Poiret+One&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&family=Zen+Maru+Gothic&display=swap" rel="stylesheet">
  </head>
  <body>

  <!-- 参加前画面 -->
  <div id="join-screen">
    <header>
      <div class="login-msg">
          <p><?=$_SESSION["name"]?>さんがログインしています</p>
            <a id="logout" href="logout.php"><img src="assets/logout.png" alt="">ログアウト</a>
      </div>
      <h1 class="logo">Animal Chat</h1>
    </header>

   <div class="middle">
     <!-- <p>ID: <span id="my-id"></span></p> -->
     <div class="middle-text">
      <p>相手と決めたルーム名（英字のみ）を入力してください</p>
      <p>room name: <input id="room-name" type="text" /></p>
    </div>
    <div class="middle-video">
      <video id="local-video" muted playsinline></video>
      <div id="preview-container">
        <canvas id="my-canvas"></canvas>
      </div>
    </div>
    <div class="middle-button">
       <div id="characterSelect">
        <p>変身するキャラクターを選択</p>
        <div class="animals">
          <span data-avatar="assets/azarashi.png" class="selected"><img src="assets/azarashi.png" alt=""></span>
          <span data-avatar="assets/pengin.png"><img src="assets/pengin.png" alt=""></span>
          <span data-avatar="assets/shirokuma.png"><img src="assets/shirokuma.png" alt=""></span>
          <span data-avatar="assets/niwatori.png"><img src="assets/niwatori.png" alt=""></span>
          <span data-avatar="assets/kaba.png"><img src="assets/kaba.png" alt=""></span>
          <span data-avatar="assets/azarashi2.png"><img src="assets/azarashi2.png" alt=""></span>
          <span data-avatar="assets/hituji.png"><img src="assets/hituji.png" alt=""></span>
          <span data-avatar="assets/saru.png"><img src="assets/saru.png" alt=""></span>
          <span data-avatar="assets/gorira.png"><img src="assets/gorira.png" alt=""></span>
        </div>
       </div>
       <button id="join">入室する</button>
     </div>
   </div>
  </div>

  <!-- 通話中画面 -->
  <div id="chat-screen">
    <header>
      <div class="login-msg">
      </div>
      <h1 class="logo">Animal Chat</h1>
      <img src="assets/REC.png" alt="" class="RECicon">
    </header>

   <div class="middle">
     <p>ID: <span id="my-id"></span></p>
     <div class="middle-text">
       ROOM: <span id="room-name-display"></span>
     </div>
     <div class="middle-video">
       <!-- <video id="local-video" muted playsinline></video> -->
       <div class="youVideo">
        <div id="my-username"></div>
        <div id="chat-container">
         <!-- 通話中はここにCanvasを移動 -->
        </div>
      </div>
      <div class="remoteVideo">
        <div id="peer-username">相手のユーザー</div>
        <div id="remote-media-area" width="400px"></div>
      </div>
     </div>
     <div class="middle-button">
       <button id="leave">退室する</button>
     </div>
   </div>
  </div>

    <!-- SKY WAYをインポート -->
    <script src="https://cdn.jsdelivr.net/npm/@skyway-sdk/room/dist/skyway_room-latest.js"></script>
    <!-- MediaPipeをインポート -->
    <!-- <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest"></script> -->
    <!-- Tone.jsをインポート -->
    <script src="http://unpkg.com/tone"></script>

    <!-- セッション値をJavaScriptに渡す -->
    <script>
      const userName = <?php echo json_encode($_SESSION['name']); ?>;
    </script>    
    <script type="module" src="main.js"></script>
  </body>
</html>
