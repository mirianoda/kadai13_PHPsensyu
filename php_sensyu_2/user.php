<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1, width=device-width" />
  <script src="js/jquery-2.1.3.min.js"></script>
  <title>Animal Chat</title>
  <link rel="stylesheet" href="css/login.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Bungee+Tint&family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400..900&family=Dongle:wght@300;400;700&family=Galada&family=Montserrat+Alternates:wght@100;200;300;400&family=Poiret+One&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&family=Zen+Maru+Gothic&display=swap"
    rel="stylesheet">
</head>

<body>
 <div class="wrapper">
     <header>
       <h1 class="logo">Animal Chat</h1>
     </header>
   
     <div class="form-wrapper">
       <div class="form1-msg">
         <h2>新規ユーザー登録</h2>
         <p>あなたのログインIDとパスワードを設定してください</p>
       </div>
   
       <form method="post" action="user_insert.php" class="form1">
        <div class="form">
            <p>ユーザー名</p><input type="text" name="name">
        </div>
        <div class="form">
            <p>ログインID</p><input type="text" name="lid">
        </div>
        <div class="form">
            <p>パスワード</p><input type="text" name="lpw">
        </div>
         <input type="submit" value="送信" class="submit">
    </form>
     </div>
 </div>
</body>

</html>