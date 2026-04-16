<?php
// ============================================================
//  admin/claims.php — Claim Requests
// ============================================================
session_start();
require_once __DIR__ . '/../includes/functions.php';

$flash = $_SESSION['flash'] ?? null;
if (isset($_SESSION['flash'])) unset($_SESSION['flash']);

$claims    = getClaimRequests();
$stats     = getStats();
$allClaims = $claims;
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin — Claim Requests | CampusFind</title>
<link rel="stylesheet" href="../assets/style.css">
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
    <a class="nav-btn nav-btn-ghost" href="../index.php">← Public Board</a>
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
    <a class="admin-nav-item active" href="claims.php">
      <span>📬</span> Claim Requests
      <span class="admin-nav-count pending"><?= count($allClaims) ?></span>
    </a>
    <div class="admin-sidebar-title">Overview</div>
    <a class="admin-nav-item" href="dashboard.php"><span>📊</span> Dashboard</a>
    <div class="admin-sidebar-title">Quick</div>
    <a class="admin-nav-item" href="../index.php"><span>↩</span> Back to Board</a>
  </div>

  <div class="admin-main">
    <div class="admin-page-title">Claim Requests</div>
    <div class="admin-page-sub">Review claim requests submitted by students and staff.</div>

    <?php if ($flash): ?>
      <div class="alert alert-<?= e($flash['type']) ?>"><?= e($flash['msg']) ?></div>
    <?php endif; ?>

    <div class="admin-table-wrap">
      <div class="admin-table-header">
        <span class="admin-table-title">All Claim Requests (<?= count($claims) ?>)</span>
      </div>
      <?php if (empty($claims)): ?>
        <div class="empty-state">
          <div class="empty-icon">📬</div>
          <div class="empty-title">No claim requests</div>
          <div class="empty-sub">Claim requests from users will appear here.</div>
        </div>
      <?php else: ?>
        <table>
          <thead>
            <tr>
              <th>Item Claimed</th>
              <th>Type</th>
              <th>Claimant Name</th>
              <th>Message</th>
              <th>Date Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($claims as $c): ?>
            <tr>
              <td>
                <div class="td-title"><?= e($c['item_name']) ?></div>
                <div class="td-sub">Item #<?= $c['item_id'] ?></div>
              </td>
              <td><?= typeBadge($c['item_type']) ?></td>
              <td style="font-size:13px;font-weight:500;">
                <?= $c['claimant_name'] ? e($c['claimant_name']) : '<em style="color:var(--text-light)">Anonymous</em>' ?>
              </td>
              <td style="font-size:12px;color:var(--text-muted);font-style:italic;max-width:200px;">
                <?= $c['message'] ? e(mb_substr($c['message'], 0, 80)) . (strlen($c['message']) > 80 ? '…' : '') : '—' ?>
              </td>
              <td style="font-size:11px;color:var(--text-light);"><?= date('M j, Y g:i A', strtotime($c['created_at'])) ?></td>
              <td>
                <div class="action-btns">
                  <a class="btn-view-sm" href="item_detail.php?id=<?= $c['item_id'] ?>">View Item</a>
                  <a class="btn-gold" href="actions.php?action=claimed&id=<?= $c['item_id'] ?>" onclick="return confirm('Mark this item as claimed/reunited?')">Mark Claimed</a>
                </div>
              </td>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      <?php endif; ?>
    </div>
  </div>
</div>

</body>
</html>
