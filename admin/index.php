<?php
// ============================================================
//  admin/index.php — Admin Panel: Pending Review
// ============================================================
session_start();
require_once __DIR__ . '/../includes/functions.php';

$flash   = $_SESSION['flash'] ?? null;
if (isset($_SESSION['flash'])) unset($_SESSION['flash']);

$pending  = getAdminItems('pending');
$stats    = getStats();
$allClaims= getClaimRequests();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin — Pending Review | CampusFind</title>
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
  <!-- SIDEBAR -->
  <div class="admin-sidebar">
    <div class="admin-sidebar-title">Management</div>
    <a class="admin-nav-item active" href="index.php">
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
    <a class="admin-nav-item" href="dashboard.php">
      <span>📊</span> Dashboard
    </a>
    <div class="admin-sidebar-title">Quick</div>
    <a class="admin-nav-item" href="../index.php">
      <span>↩</span> Back to Board
    </a>
  </div>

  <!-- MAIN -->
  <div class="admin-main">
    <div class="admin-page-title">Pending Review</div>
    <div class="admin-page-sub">Review and approve or reject anonymous submissions before they go public.</div>

    <?php if ($flash): ?>
      <div class="alert alert-<?= e($flash['type']) ?>"><?= e($flash['msg']) ?></div>
    <?php endif; ?>

    <div class="admin-table-wrap">
      <div class="admin-table-header">
        <span class="admin-table-title">Awaiting Approval (<?= count($pending) ?>)</span>
      </div>
      <?php if (empty($pending)): ?>
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <div class="empty-title">All clear!</div>
          <div class="empty-sub">No posts pending review.</div>
        </div>
      <?php else: ?>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Type</th>
              <th>Location</th>
              <th>Category</th>
              <th>Reported</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($pending as $item): ?>
            <tr>
              <td style="color:var(--text-light);font-size:11px;"><?= $item['id'] ?></td>
              <td>
                <div class="td-title"><?= e($item['name']) ?></div>
                <div class="td-sub"><?= e(mb_substr($item['description'] ?? '', 0, 60)) ?><?= strlen($item['description'] ?? '') > 60 ? '…' : '' ?></div>
              </td>
              <td><?= typeBadge($item['type']) ?></td>
              <td style="font-size:12px;"><?= e($item['location']) ?></td>
              <td style="font-size:12px;"><?= e($item['category']) ?></td>
              <td style="font-size:11px;color:var(--text-light);"><?= date('M j, Y', strtotime($item['created_at'])) ?></td>
              <td>
                <div class="action-btns">
                  <a class="btn-approve" href="actions.php?action=approve&id=<?= $item['id'] ?>">✓ Approve</a>
                  <a class="btn-reject"  href="actions.php?action=reject&id=<?= $item['id'] ?>" onclick="return confirm('Reject and remove this post?')">✕ Reject</a>
                  <a class="btn-view-sm" href="item_detail.php?id=<?= $item['id'] ?>">View</a>
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
