<?php
// ============================================================
//  admin/approved.php — Approved Posts
// ============================================================
session_start();
require_once __DIR__ . '/../includes/functions.php';

$flash = $_SESSION['flash'] ?? null;
if (isset($_SESSION['flash'])) unset($_SESSION['flash']);

$approved  = getAdminItems('approved');
$claimed   = getAdminItems('claimed');
$items     = array_merge($approved, $claimed);
usort($items, fn($a,$b) => strtotime($b['created_at']) - strtotime($a['created_at']));

$stats     = getStats();
$allClaims = getClaimRequests();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin — Approved Posts | CampusFind</title>
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
    <a class="admin-nav-item active" href="approved.php">
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
  </div>

  <div class="admin-main">
    <div class="admin-page-title">Approved Posts</div>
    <div class="admin-page-sub">All live posts visible on the public board.</div>

    <?php if ($flash): ?>
      <div class="alert alert-<?= e($flash['type']) ?>"><?= e($flash['msg']) ?></div>
    <?php endif; ?>

    <div class="admin-table-wrap">
      <div class="admin-table-header">
        <span class="admin-table-title">Live Posts (<?= count($items) ?>)</span>
      </div>
      <?php if (empty($items)): ?>
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-title">No approved posts yet</div>
          <div class="empty-sub">Approved submissions will appear here.</div>
        </div>
      <?php else: ?>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Type</th>
              <th>Location</th>
              <th>Status</th>
              <th>Claims</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($items as $item): ?>
            <tr>
              <td style="color:var(--text-light);font-size:11px;"><?= $item['id'] ?></td>
              <td>
                <div class="td-title"><?= e($item['name']) ?></div>
                <div class="td-sub"><?= e($item['category']) ?></div>
              </td>
              <td><?= typeBadge($item['type']) ?></td>
              <td style="font-size:12px;"><?= e($item['location']) ?></td>
              <td><?= statusPill($item['status']) ?></td>
              <td>
                <span style="font-size:12px;color:<?= $item['claim_count'] > 0 ? 'var(--gold-dark)' : 'var(--text-light)' ?>;">
                  <?= $item['claim_count'] ?> request<?= $item['claim_count'] != 1 ? 's' : '' ?>
                </span>
              </td>
              <td style="font-size:11px;color:var(--text-light);"><?= date('M j, Y', strtotime($item['created_at'])) ?></td>
              <td>
                <div class="action-btns">
                  <a class="btn-view-sm" href="item_detail.php?id=<?= $item['id'] ?>">View</a>
                  <?php if ($item['status'] !== 'claimed'): ?>
                    <a class="btn-gold" href="actions.php?action=claimed&id=<?= $item['id'] ?>" onclick="return confirm('Mark this item as claimed/reunited?')">Mark Claimed</a>
                  <?php endif; ?>
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
