<?php
// ============================================================
//  admin/register.php — Temporary Admin Registration
//  You can delete or password-protect this file once you've
//  created your admin account.
// ============================================================
session_start();
require_once __DIR__ . '/../includes/functions.php';

if (!empty($_SESSION['admin_logged_in'])) {
    header('Location: index.php');
    exit;
}

$error   = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username  = trim($_POST['username']  ?? '');
    $password  = $_POST['password']  ?? '';
    $password2 = $_POST['password2'] ?? '';

    if (!$username || !$password || !$password2) {
        $error = 'All fields are required.';
    } elseif (strlen($username) < 3) {
        $error = 'Username must be at least 3 characters.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters.';
    } elseif ($password !== $password2) {
        $error = 'Passwords do not match.';
    } else {
        $db = getDB();

        // check if username taken
        $check = $db->prepare("SELECT id FROM admins WHERE username = ?");
        $check->execute([$username]);
        if ($check->fetch()) {
            $error = 'Username already taken. Choose another.';
        } else {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $db->prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)")
               ->execute([$username, $hash]);
            $success = 'Account created! <a href="login.php">Sign in now →</a>';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Register Admin | CampusFind</title>
<link rel="stylesheet" href="../assets/style.css">
<style>
  body { display:flex; align-items:center; justify-content:center; min-height:100vh; background:var(--maroon-dark); }
  .login-box {
    background:white; border-radius:18px; padding:2.5rem 2rem;
    width:100%; max-width:400px; box-shadow:0 20px 60px rgba(0,0,0,0.35);
  }
  .login-logo {
    width:52px; height:52px; background:var(--gold);
    border-radius:12px; display:flex; align-items:center; justify-content:center;
    font-family:'Playfair Display',serif; font-weight:900; font-size:24px;
    color:var(--maroon-dark); margin:0 auto 1rem;
  }
  .login-title { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700; color:var(--maroon-dark); text-align:center; }
  .login-sub   { font-size:12px; color:var(--text-light); text-align:center; margin-bottom:1.6rem; }
  .temp-badge  {
    background:var(--gold-pale); color:var(--gold-dark); border:1px solid rgba(201,152,42,0.3);
    border-radius:6px; padding:7px 12px; font-size:11px; font-weight:500;
    text-align:center; margin-bottom:1.3rem; line-height:1.5;
  }
  .login-field { margin-bottom:1rem; }
  .login-label { display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:var(--text-muted); margin-bottom:5px; }
  .login-input {
    width:100%; padding:11px 13px; border:1.5px solid var(--border-strong);
    border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px;
    color:var(--text); outline:none; transition:border 0.2s;
  }
  .login-input:focus { border-color:var(--maroon); }
  .login-btn {
    width:100%; padding:12px; background:var(--maroon); color:white;
    border:none; border-radius:8px; font-family:'DM Sans',sans-serif;
    font-size:15px; font-weight:600; cursor:pointer; transition:background 0.2s; margin-top:0.4rem;
  }
  .login-btn:hover { background:var(--maroon-dark); }
  .login-error   { background:#FEE2E2; color:#991B1B; border:1px solid #FECACA; border-radius:7px; padding:10px 13px; font-size:13px; margin-bottom:1rem; }
  .login-success { background:#DCFCE7; color:#166534; border:1px solid #BBF7D0; border-radius:7px; padding:10px 13px; font-size:13px; margin-bottom:1rem; }
  .login-success a { color:#166534; font-weight:700; }
  .back-link { text-align:center; margin-top:1.1rem; font-size:12px; color:var(--text-light); }
  .back-link a { color:var(--maroon); font-weight:600; }
</style>
</head>
<body>
<div class="login-box">
  <div class="login-logo">CF</div>
  <div class="login-title">Create Admin Account</div>
  <div class="login-sub">CampusFind — Lost &amp; Found Registry</div>

  <?php if ($error):   ?><div class="login-error"><?= e($error) ?></div><?php endif; ?>
  <?php if ($success): ?><div class="login-success"><?= $success ?></div><?php endif; ?>

  <?php if (!$success): ?>
  <form method="POST">
    <div class="login-field">
      <label class="login-label">Username</label>
      <input class="login-input" type="text" name="username" autocomplete="off" autofocus required value="<?= e($_POST['username'] ?? '') ?>">
    </div>
    <div class="login-field">
      <label class="login-label">Password</label>
      <input class="login-input" type="password" name="password" required>
    </div>
    <div class="login-field">
      <label class="login-label">Confirm Password</label>
      <input class="login-input" type="password" name="password2" required>
    </div>
    <button class="login-btn" type="submit">Create Account</button>
  </form>
  <?php endif; ?>

  <div class="back-link"><a href="login.php">← Back to login</a></div>
</div>
</body>
</html>