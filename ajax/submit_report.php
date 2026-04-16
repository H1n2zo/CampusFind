<?php
// ============================================================
//  ajax/submit_report.php — Handle new item submission (POST)
// ============================================================
session_start();
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit;
}

$type     = isset($_POST['type'])        && in_array($_POST['type'], ['lost','found']) ? $_POST['type'] : null;
$name     = isset($_POST['name'])        ? trim($_POST['name'])        : '';
$category = isset($_POST['category'])    ? trim($_POST['category'])    : '';
$location = isset($_POST['location'])    ? trim($_POST['location'])    : '';
$desc     = isset($_POST['description']) ? trim($_POST['description']) : '';

$valid = categories();

if (!$type || !$name || !$category || !$location || !in_array($category, $valid)) {
    $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Please fill in all required fields.'];
    header('Location: ../index.php');
    exit;
}

// ── Handle optional image upload ────────────────────────────
$imagePath = null;

if (!empty($_FILES['item_image']['name'])) {
    $file      = $_FILES['item_image'];
    $allowed   = ['image/jpeg','image/png','image/gif','image/webp'];
    $maxBytes  = 5 * 1024 * 1024; // 5 MB

    if (!in_array($file['type'], $allowed)) {
        $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Only JPG, PNG, GIF or WebP images are allowed.'];
        header('Location: ../index.php');
        exit;
    }
    if ($file['size'] > $maxBytes) {
        $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Image must be under 5 MB.'];
        header('Location: ../index.php');
        exit;
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Image upload failed. Please try again.'];
        header('Location: ../index.php');
        exit;
    }

    $uploadDir = __DIR__ . '/../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $ext       = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename  = 'item_' . uniqid('', true) . '.' . strtolower($ext);
    $destPath  = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Could not save image. Check uploads/ folder permissions.'];
        header('Location: ../index.php');
        exit;
    }

    $imagePath = 'uploads/' . $filename;
}

$db   = getDB();
$stmt = $db->prepare("INSERT INTO items (type, name, category, location, description, image_path, status) VALUES (?,?,?,?,?,?,'pending')");
$stmt->execute([$type, $name, $category, $location, $desc, $imagePath]);

$_SESSION['flash'] = ['type' => 'success', 'msg' => '✓ Report submitted! It will appear on the board after admin review.'];
header('Location: ../index.php');
exit;