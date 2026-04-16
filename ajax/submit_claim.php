<?php
// ============================================================
//  ajax/submit_claim.php — Handle claim request submission
// ============================================================
session_start();
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit;
}

$itemId  = isset($_POST['item_id'])       ? (int) $_POST['item_id']           : 0;
$name    = isset($_POST['claimant_name']) ? trim($_POST['claimant_name'])      : '';
$message = isset($_POST['message'])       ? trim($_POST['message'])            : '';

if (!$itemId) {
    $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Invalid item. Please try again.'];
    header('Location: ../index.php');
    exit;
}

// verify item exists and is approved
$db   = getDB();
$item = $db->prepare("SELECT id, name FROM items WHERE id = ? AND status IN ('approved')");
$item->execute([$itemId]);
$row  = $item->fetch();

if (!$row) {
    $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Item not found or already claimed.'];
    header('Location: ../index.php');
    exit;
}

$stmt = $db->prepare("INSERT INTO claim_requests (item_id, claimant_name, message) VALUES (?,?,?)");
$stmt->execute([$itemId, $name ?: null, $message ?: null]);

$_SESSION['flash'] = ['type' => 'info', 'msg' => '★ Claim request sent for "' . $row['name'] . '"! Admin will review it shortly.'];
header('Location: ../index.php');
exit;
