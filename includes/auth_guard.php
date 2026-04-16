<?php
// ============================================================
//  includes/auth_guard.php
//  Include at the top of every admin page (after session_start)
// ============================================================
if (empty($_SESSION['admin_logged_in'])) {
    header('Location: ' . dirname($_SERVER['SCRIPT_NAME']) . '/login.php');
    exit;
}