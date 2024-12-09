<?php
session_start(); // セッション開始
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include "funcs.php";
?>
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1, width=device-width" />
  <title>Animal Chat</title>
  <script src="js/jquery-2.1.3.min.js"></script>
  <link rel="stylesheet" href="css/index.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Bungee+Tint&family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400..900&family=Dongle:wght@300;400;700&family=Galada&family=Montserrat+Alternates:wght@100;200;300;400&family=Poiret+One&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&family=Zen+Maru+Gothic&display=swap"
    rel="stylesheet">
</head>

<body>
    <?php if (isset($_SESSION['alert'])): ?>
    <script>
        alert("<?= h($_SESSION['alert']);?>");
    </script>
    <?php unset($_SESSION['alert']); // 表示後にメッセージを削除 ?>
    <?php endif; ?>
    <header>
      <div class="login-msg">
      </div>
      <h1 class="logo">Animal Chat</h1>
      <img src="" alt="" class="RECicon">
    </header>

  <div class="mainvisual">
      <h1 class="logo">Animal Chat =「動物たちの会話」</h1>
      <p>今すぐ動物に変身して、<br>まるで森の中にいるような自由な会話を楽しみましょう！</p>
  </div>

  <div class="form-wrapper">
        <a href="login.php"><span>ログインはこちら</span></a>
        <a href="user.php"><span>新規ユーザー登録はこちら</span></a>
  </div>

  <footer>
      <div class="footer-text">
        <h2 class="logo">Animal Chat</h2>
        <p>Copyright © 2005 ○○○○ All Rights Reserved.</p>
      </div>
      <div class="footer-icon">
        <img src="assets/Twitter.png" alt="">
        <img src="assets/Instagram.png" alt="">
      </div>
  </footer>
</body>

</html>