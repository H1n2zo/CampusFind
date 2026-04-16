<?php
// ============================================================
//  admin/login.php — Admin Login
// ============================================================
session_start();
require_once __DIR__ . '/../includes/functions.php';

// already logged in → redirect
if (!empty($_SESSION['admin_logged_in'])) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!$username || !$password) {
        $error = 'Please enter both username and password.';
    } else {
        $db   = getDB();
        $stmt = $db->prepare("SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1");
        $stmt->execute([$username]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($password, $admin['password_hash'])) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_id']        = $admin['id'];
            $_SESSION['admin_username']  = $admin['username'];
            header('Location: index.php');
            exit;
        } else {
            $error = 'Invalid username or password.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login | CampusFind</title>
<link rel="stylesheet" href="../assets/style.css">
<style>
  body { display:flex; align-items:center; justify-content:center; min-height:100vh; background:var(--maroon-dark); }
  .login-box {
    background:white; border-radius:18px; padding:2.5rem 2rem;
    width:100%; max-width:380px; box-shadow:0 20px 60px rgba(0,0,0,0.35);
  }
  .login-logo {
    width:52px; height:52px; background:var(--gold);
    border-radius:12px; display:flex; align-items:center; justify-content:center;
    font-family:'Playfair Display',serif; font-weight:900; font-size:24px;
    color:var(--maroon-dark); margin:0 auto 1rem;
  }
  .login-title { font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:700; color:var(--maroon-dark); text-align:center; }
  .login-sub   { font-size:13px; color:var(--text-light); text-align:center; margin-bottom:1.8rem; }
  .login-field { margin-bottom:1.1rem; }
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
    font-size:15px; font-weight:600; cursor:pointer; transition:background 0.2s; margin-top:0.5rem;
  }
  .login-btn:hover { background:var(--maroon-dark); }
  .login-error { background:#FEE2E2; color:#991B1B; border:1px solid #FECACA; border-radius:7px; padding:10px 13px; font-size:13px; margin-bottom:1rem; }
  .login-register { text-align:center; margin-top:1.2rem; font-size:12px; color:var(--text-light); }
  .login-register a { color:var(--maroon); font-weight:600; }
</style>
</head>
<body>
<div class="login-box">
  <div class="login-logo">CF</div>
  <div class="login-title">Admin Panel</div>
  <div class="login-sub">CampusFind — Lost &amp; Found Registry</div>

  <?php if ($error): ?>
    <div class="login-error"><?= e($error) ?></div>
  <?php endif; ?>

  <form method="POST">
    <div class="login-field">
      <label class="login-label">Username</label>
      <input class="login-input" type="text" name="username" autocomplete="username" autofocus required value="<?= e($_POST['username'] ?? '') ?>">
    </div>
    <div class="login-field">
      <label class="login-label">Password</label>
      <input class="login-input" type="password" name="password" autocomplete="current-password" required>
    </div>
    <button class="login-btn" type="submit">Sign In</button>
  </form>

  <div class="login-register">
    No account yet? <a href="register.php">Register admin account</a>
  </div>
</div>
</body>
</html>