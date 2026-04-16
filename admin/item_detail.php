<?php
// ============================================================
//  admin/item_detail.php — Full item view with claims
// ============================================================
session_start();
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth_guard.php';

$id   = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$item = $id ? getItemWithClaims($id) : null;

if (!$item) {
    $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Item not found.'];
    header('Location: index.php');
    exit;
}

$flash     = $_SESSION['flash'] ?? null;
if (isset($_SESSION['flash'])) unset($_SESSION['flash']);
$stats     = getStats();
$allClaims = getClaimRequests();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Item Detail — <?= e($item['name']) ?> | CampusFind</title>
<link rel="stylesheet" href="../assets/style.css">
<style>
.detail-card { background: white; border-radius: 14px; border: 1px solid var(--border); padding: 1.5rem; margin-bottom: 1.5rem; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.detail-field { margin-bottom: 0; }
.item-image-full {
  width: 100%; max-height: 320px; object-fit: cover;
  border-radius: 10px; border: 1px solid var(--border);
  margin-bottom: 1.2rem; display: block;
}
.no-image-box {
  width:100%; height:120px; background:var(--cream);
  border:2px dashed var(--border-strong); border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  color:var(--text-light); font-size:13px; margin-bottom:1.2rem;
  gap: 8px;
}
</style>
</head>
<body>

<nav>
  <a class="nav-brand" href="../index.php">
    <div class="nav-logo">CF</div>
    <div>
      <span class="nav-title">CampusFind</span>
      <span class="nav-sub">Admin Panel</span>
    </div>
  </a>
  <div class="nav-actions">
    <span style="font-size:12px;color:rgba(255,255,255,0.55);margin-right:4px;">👤 <?= e($_SESSION['admin_username']) ?></span>
    <a class="nav-btn nav-btn-ghost" href="javascript:history.back()">← Back</a>
    <a class="nav-btn nav-btn-ghost" href="logout.php" onclick="return confirm('Log out?')">Logout</a>
  </div>
</nav>

<div class="admin-layout">
  <div class="admin-sidebar">
    <div class="admin-sidebar-title">Management</div>
    <a class="admin-nav-item" href="index.php">
      <span>⏳</span> Pending Review
      <span class="admin-nav-count pending"><?= $stats['pending'] ?></span>
    </a>
    <a class="admin-nav-item" href="approved.php">
      <span>✅</span> Approved Posts
      <span class="admin-nav-count"><?= $stats['active'] + $stats['claimed'] ?></span>
    </a>
    <a class="admin-nav-item" href="claims.php">
      <span>📬</span> Claim Requests
      <span class="admin-nav-count pending"><?= count($allClaims) ?></span>
    </a>
    <div class="admin-sidebar-title">Overview</div>
    <a class="admin-nav-item" href="dashboard.php"><span>📊</span> Dashboard</a>
    <div class="admin-sidebar-title">Quick</div>
    <a class="admin-nav-item" href="../index.php"><span>↩</span> Back to Board</a>
    <a class="admin-nav-item" href="logout.php" onclick="return confirm('Log out?')"><span>🚪</span> Logout</a>
  </div>

  <div class="admin-main">
    <div class="admin-page-title"><?= e($item['name']) ?></div>
    <div class="admin-page-sub">Item #<?= $item['id'] ?> — Full details and claim history</div>

    <?php if ($flash): ?>
      <div class="alert alert-<?= e($flash['type']) ?>"><?= e($flash['msg']) ?></div>
    <?php endif; ?>

    <!-- Item Info -->
    <div class="detail-card">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:1.2rem;">
        <?= typeBadge($item['type']) ?>
        <?= statusPill($item['status']) ?>
        <span style="font-size:12px;color:var(--text-light);margin-left:auto;">Reported: <?= date('F j, Y g:i A', strtotime($item['created_at'])) ?></span>
      </div>

      <!-- Photo -->
      <?php if (!empty($item['image_path'])): ?>
        <img class="item-image-full" src="../<?= e($item['image_path']) ?>" alt="Photo of <?= e($item['name']) ?>">
      <?php else: ?>
        <div class="no-image-box"><span>📷</span> No photo uploaded for this item</div>
      <?php endif; ?>

      <div class="detail-grid">
        <div class="detail-field">
          <div class="detail-label">Item Name</div>
          <div class="detail-value" style="font-weight:600;font-size:16px;"><?= e($item['name']) ?></div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Category</div>
          <div class="detail-value"><?= e($item['category']) ?></div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Location</div>
          <div class="detail-value">📍 <?= e($item['location']) ?></div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Status</div>
          <div class="detail-value"><?= ucfirst($item['status']) ?></div>
        </div>
      </div>
      <div class="detail-field" style="margin-top:0.5rem;">
        <div class="detail-label">Description</div>
        <div class="detail-value"><?= e($item['description'] ?: 'No description provided.') ?></div>
      </div>

      <!-- Action buttons -->
      <div style="margin-top:1.5rem;display:flex;gap:10px;flex-wrap:wrap;">
        <?php if ($item['status'] === 'pending'): ?>
          <a class="btn-approve" href="actions.php?action=approve&id=<?= $item['id'] ?>&redirect=item_detail">✓ Approve Post</a>
          <a class="btn-reject"  href="actions.php?action=reject&id=<?= $item['id'] ?>&redirect=index" onclick="return confirm('Reject and delete this post?')">✕ Reject Post</a>
        <?php elseif ($item['status'] === 'approved'): ?>
          <a class="btn-gold"    href="actions.php?action=claimed&id=<?= $item['id'] ?>&redirect=item_detail" onclick="return confirm('Mark as claimed/reunited?')">★ Mark as Claimed</a>
          <a class="btn-reject"  href="actions.php?action=reject&id=<?= $item['id'] ?>&redirect=approved" onclick="return confirm('Remove this post from the board?')">Remove Post</a>
        <?php elseif ($item['status'] === 'claimed'): ?>
          <span style="font-size:13px;color:#166534;font-weight:600;">✓ This item has been reunited with its owner.</span>
        <?php endif; ?>
      </div>
    </div>

    <!-- Claim Requests -->
    <div class="detail-card">
      <div class="admin-table-title" style="margin-bottom:1rem;">Claim Requests (<?= count($item['claims']) ?>)</div>
      <?php if (empty($item['claims'])): ?>
        <div style="font-size:13px;color:var(--text-light);font-style:italic;padding:8px 0;">No claim requests submitted yet.</div>
      <?php else: ?>
        <div class="claim-list">
          <?php foreach ($item['claims'] as $c): ?>
          <div class="claim-item">
            <div class="claim-name"><?= $c['claimant_name'] ? e($c['claimant_name']) : 'Anonymous' ?></div>
            <?php if ($c['message']): ?>
              <div class="claim-msg">"<?= e($c['message']) ?>"</div>
            <?php endif; ?>
            <div class="claim-time"><?= date('M j, Y g:i A', strtotime($c['created_at'])) ?></div>
          </div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>

  </div>
</div>

</body>
</html>