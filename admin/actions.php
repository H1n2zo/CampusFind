<?php
// ============================================================
//  admin/actions.php — Handle approve / reject / mark-claimed
// ============================================================
session_start();
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth_guard.php';

$action   = $_GET['action']   ?? '';
$id       = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$redirect = $_GET['redirect']  ?? 'index';

$redirectMap = [
    'index'       => 'index.php',
    'approved'    => 'approved.php',
    'claims'      => 'claims.php',
    'dashboard'   => 'dashboard.php',
    'item_detail' => "item_detail.php?id={$id}",
];
$dest = $redirectMap[$redirect] ?? 'index.php';

if (!$id || !in_array($action, ['approve','reject','claimed'])) {
    $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Invalid request.'];
    header("Location: $dest");
    exit;
}

$db = getDB();

$check = $db->prepare("SELECT id, name, status, image_path FROM items WHERE id = ?");
$check->execute([$id]);
$item = $check->fetch();

if (!$item) {
    $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Item not found.'];
    header("Location: $dest");
    exit;
}

switch ($action) {
    case 'approve':
        if ($item['status'] !== 'pending') {
            $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Item is not in pending status.'];
            break;
        }
        $db->prepare("UPDATE items SET status = 'approved' WHERE id = ?")->execute([$id]);
        $_SESSION['flash'] = ['type' => 'success', 'msg' => '✓ Post approved and published to the board!'];
        if ($redirect === 'item_detail') $dest = "item_detail.php?id={$id}";
        break;

    case 'reject':
        // delete image file if exists
        if (!empty($item['image_path'])) {
            $filePath = __DIR__ . '/../' . $item['image_path'];
            if (file_exists($filePath)) {
                @unlink($filePath);
            }
        }
        $db->prepare("DELETE FROM items WHERE id = ?")->execute([$id]);
        $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Post rejected and removed.'];
        $dest = 'index.php';
        break;

    case 'claimed':
        if ($item['status'] === 'claimed') {
            $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Item is already marked as claimed.'];
            break;
        }
        $db->prepare("UPDATE items SET status = 'claimed' WHERE id = ?")->execute([$id]);
        $_SESSION['flash'] = ['type' => 'success', 'msg' => '★ Item "' . $item['name'] . '" marked as claimed/reunited!'];
        break;
}

header("Location: $dest");
exit;