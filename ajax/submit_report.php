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

$db = getDB();
$stmt = $db->prepare("INSERT INTO items (type, name, category, location, description, status) VALUES (?,?,?,?,?,'pending')");
$stmt->execute([$type, $name, $category, $location, $desc]);

$_SESSION['flash'] = ['type' => 'success', 'msg' => '✓ Report submitted! It will appear on the board after admin review.'];
header('Location: ../index.php');
exit;
