<?php
// ============================================================
//  admin/dashboard.php — Dashboard Overview
// ============================================================
session_start();
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth_guard.php';

$stats     = getStats();
$allClaims = getClaimRequests();

$db = getDB();
$recent = $db->query("SELECT * FROM items ORDER BY created_at DESC LIMIT 8")->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin — Dashboard | CampusFind</title>
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
    <span style="font-size:12px;color:rgba(255,255,255,0.55);margin-right:4px;">👤 <?= e($_SESSION['admin_username']) ?></span>
    <a class="nav-btn nav-btn-ghost" href="../index.php">← Public Board</a>
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
    <a class="admin-nav-item active" href="dashboard.php"><span>📊</span> Dashboard</a>
    <div class="admin-sidebar-title">Quick</div>
    <a class="admin-nav-item" href="../index.php"><span>↩</span> Back to Board</a>
    <a class="admin-nav-item" href="logout.php" onclick="return confirm('Log out?')"><span>🚪</span> Logout</a>
  </div>

  <div class="admin-main">
    <div class="admin-page-title">Dashboard</div>
    <div class="admin-page-sub">Overview of the Campus Lost &amp; Found Registry.</div>

    <div class="admin-stats-row">
      <div class="stat-card">
        <div class="stat-card-label">Total Posts</div>
        <div class="stat-card-num" style="color:var(--maroon)"><?= $db->query("SELECT COUNT(*) FROM items")->fetchColumn() ?></div>
        <div class="stat-card-sub">All time</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Pending Review</div>
        <div class="stat-card-num" style="color:#854D0E"><?= $stats['pending'] ?></div>
        <div class="stat-card-sub">Need action</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Claim Requests</div>
        <div class="stat-card-num" style="color:var(--gold-dark)"><?= count($allClaims) ?></div>
        <div class="stat-card-sub">Total submitted</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Reunited</div>
        <div class="stat-card-num" style="color:#166534"><?= $stats['claimed'] ?></div>
        <div class="stat-card-sub">Successfully matched</div>
      </div>
    </div>

    <div class="admin-table-wrap">
      <div class="admin-table-header">
        <span class="admin-table-title">Recent Activity</span>
        <a href="approved.php" style="font-size:12px;color:var(--maroon);">View all →</a>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Item</th>
            <th>Type</th>
            <th>Category</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($recent as $item): ?>
          <tr>
            <td style="color:var(--text-light);font-size:11px;"><?= $item['id'] ?></td>
            <td>
              <?php if (!empty($item['image_path'])): ?>
                <img src="../<?= e($item['image_path']) ?>" alt="Item photo"
                     style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--border);">
              <?php else: ?>
                <span style="font-size:18px;display:block;text-align:center;color:var(--text-light);">📷</span>
              <?php endif; ?>
            </td>
            <td><div class="td-title"><?= e($item['name']) ?></div></td>
            <td><?= typeBadge($item['type']) ?></td>
            <td style="font-size:12px;"><?= e($item['category']) ?></td>
            <td><?= statusPill($item['status']) ?></td>
            <td style="font-size:11px;color:var(--text-light);"><?= date('M j, Y', strtotime($item['created_at'])) ?></td>
            <td>
              <a class="btn-view-sm" href="item_detail.php?id=<?= $item['id'] ?>">View</a>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

</body>
</html>