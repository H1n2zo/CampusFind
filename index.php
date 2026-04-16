<?php
// ============================================================
//  index.php — Public Lost & Found Board
// ============================================================
session_start();
require_once __DIR__ . '/includes/functions.php';

$type     = isset($_GET['type'])     && in_array($_GET['type'], ['lost','found']) ? $_GET['type'] : '';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$search   = isset($_GET['search'])   ? trim($_GET['search'])   : '';
$flash    = $_SESSION['flash'] ?? null;
if (isset($_SESSION['flash'])) unset($_SESSION['flash']);

$stats = getStats();
$items = getPublicItems($type, $category, $search);
$cats  = categories();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CampusFind — Lost &amp; Found Registry</title>
<link rel="stylesheet" href="assets/style.css">
<style>
.card-img {
  width:100%; height:160px; object-fit:cover;
  border-bottom:1px solid var(--border); display:block;
}
.card-img-placeholder {
  width:100%; height:90px; background:var(--cream);
  display:flex; align-items:center; justify-content:center;
  font-size:28px; border-bottom:1px solid var(--border);
  color:var(--text-light);
}
.upload-preview-wrap { margin-top:8px; }
.upload-preview-img  { max-width:100%; max-height:140px; border-radius:8px; border:1px solid var(--border); display:none; }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <a class="nav-brand" href="index.php">
    <div class="nav-logo">CF</div>
    <div>
      <span class="nav-title">CampusFind</span>
      <span class="nav-sub">Lost &amp; Found Registry</span>
    </div>
  </a>
  <div class="nav-actions">
    <button class="nav-btn nav-btn-ghost" onclick="openReportModal()">+ Report Item</button>
    <a class="nav-btn nav-btn-gold" href="admin/index.php">Admin Panel</a>
  </div>
</nav>

<!-- HERO -->
<div class="hero">
  <div class="hero-content">
    <h1>Campus <span class="hero-accent">Lost &amp; Found</span><br>Registry</h1>
    <p>Centralized digital bulletin board for reporting lost items and posting found ones. Help reunite belongings with their owners.</p>
    <div class="hero-stats">
      <div class="hero-stat">
        <span class="hero-stat-num"><?= $stats['active'] ?></span>
        <span class="hero-stat-label">Active Posts</span>
      </div>
      <div class="hero-stat">
        <span class="hero-stat-num"><?= $stats['lost'] ?></span>
        <span class="hero-stat-label">Lost Items</span>
      </div>
      <div class="hero-stat">
        <span class="hero-stat-num"><?= $stats['found'] ?></span>
        <span class="hero-stat-label">Found Items</span>
      </div>
      <div class="hero-stat">
        <span class="hero-stat-num"><?= $stats['claimed'] ?></span>
        <span class="hero-stat-label">Reunited</span>
      </div>
    </div>
  </div>
</div>

<!-- TOOLBAR -->
<div class="toolbar">
  <div class="tabs">
    <?php
    $allCount  = $stats['active'] + $stats['claimed'];
    $lostCount = getDB()->query("SELECT COUNT(*) FROM items WHERE status IN ('approved','claimed') AND type='lost'")->fetchColumn();
    $foundCount= getDB()->query("SELECT COUNT(*) FROM items WHERE status IN ('approved','claimed') AND type='found'")->fetchColumn();
    ?>
    <a class="tab <?= $type === '' ? 'active' : '' ?>" href="index.php?category=<?= urlencode($category) ?>&search=<?= urlencode($search) ?>">
      All Items <span class="tab-badge"><?= $allCount ?></span>
    </a>
    <a class="tab <?= $type === 'lost' ? 'active' : '' ?>" href="index.php?type=lost&category=<?= urlencode($category) ?>&search=<?= urlencode($search) ?>">
      Lost <span class="tab-badge"><?= $lostCount ?></span>
    </a>
    <a class="tab <?= $type === 'found' ? 'active' : '' ?>" href="index.php?type=found&category=<?= urlencode($category) ?>&search=<?= urlencode($search) ?>">
      Found <span class="tab-badge gold"><?= $foundCount ?></span>
    </a>
  </div>
  <form class="toolbar-right" method="GET" action="index.php">
    <?php if ($type): ?><input type="hidden" name="type" value="<?= e($type) ?>"><?php endif; ?>
    <input class="search-input" type="text" name="search" placeholder="Search items…" value="<?= e($search) ?>">
    <select class="filter-select" name="category" onchange="this.form.submit()">
      <option value="">All Categories</option>
      <?php foreach ($cats as $cat): ?>
        <option value="<?= e($cat) ?>" <?= $category === $cat ? 'selected' : '' ?>><?= e($cat) ?></option>
      <?php endforeach; ?>
    </select>
    <button type="submit" class="nav-btn nav-btn-maroon" style="padding:7px 14px;font-size:13px;">Filter</button>
  </form>
</div>

<!-- FLASH MESSAGE -->
<?php if ($flash): ?>
<div class="main" style="padding-bottom:0;">
  <div class="alert alert-<?= e($flash['type']) ?>"><?= e($flash['msg']) ?></div>
</div>
<?php endif; ?>

<!-- CARDS -->
<div class="main">
  <?php if (empty($items)): ?>
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <div class="empty-title">No items found</div>
      <div class="empty-sub">Try adjusting your filters or be the first to report an item.</div>
    </div>
  <?php else: ?>
    <div class="cards-grid">
      <?php foreach ($items as $item): ?>
        <?php
          $isClaimed  = $item['status'] === 'claimed';
          $badgeClass = $isClaimed ? 'badge-claimed' : ($item['type'] === 'lost' ? 'badge-lost' : 'badge-found');
          $badgeLabel = $isClaimed ? 'Claimed' : ucfirst($item['type']);
          $dateStr    = date('M j, Y', strtotime($item['created_at']));
        ?>
        <div class="item-card">
          <!-- Photo -->
          <?php if (!empty($item['image_path'])): ?>
            <img class="card-img" src="<?= e($item['image_path']) ?>" alt="<?= e($item['name']) ?>">
          <?php else: ?>
            <div class="card-img-placeholder">
              <?= $isClaimed ? '✅' : ($item['type'] === 'lost' ? '🔍' : '📦') ?>
            </div>
          <?php endif; ?>

          <div class="card-header">
            <span class="card-type-badge <?= $badgeClass ?>"><?= $badgeLabel ?></span>
            <span class="card-date"><?= $dateStr ?></span>
          </div>
          <div class="card-body">
            <div class="card-title"><?= e($item['name']) ?></div>
            <div class="card-location">📍 <?= e($item['location']) ?></div>
            <div class="card-desc"><?= e($item['description'] ?: 'No additional description provided.') ?></div>
            <span class="card-category"><?= e($item['category']) ?></span>
          </div>
          <div class="card-footer">
            <?php if ($isClaimed): ?>
              <span class="btn-claimed-tag">✓ Item has been claimed</span>
            <?php else: ?>
              <button class="btn btn-claim" onclick='openClaimModal(<?= $item['id'] ?>, <?= json_encode($item['name']) ?>)'>Claim Request</button>
              <button class="btn btn-details" onclick='openDetailModal(<?= json_encode($item) ?>)'>Details</button>
            <?php endif; ?>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>

<!-- ══ REPORT MODAL ══ -->
<div id="modal-report" class="modal-overlay" onclick="closeOverlay(event,'modal-report')">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title">Report an Item</span>
      <button class="modal-close" onclick="closeModal('modal-report')">✕</button>
    </div>
    <form method="POST" action="ajax/submit_report.php" id="form-report" enctype="multipart/form-data">
      <div class="modal-body">
        <div class="report-type-row">
          <div class="report-type-btn" id="rtype-lost" onclick="selectType('lost')">
            <span class="rtype-icon">😟</span>
            <span class="rtype-label">I Lost Something</span>
          </div>
          <div class="report-type-btn" id="rtype-found" onclick="selectType('found')">
            <span class="rtype-icon">🎉</span>
            <span class="rtype-label">I Found Something</span>
          </div>
        </div>
        <input type="hidden" name="type" id="report-type-val">
        <p class="form-error" id="err-type" style="display:block;margin-bottom:8px;">Please select Lost or Found.</p>
        <div class="form-group">
          <label class="form-label">Item Name *</label>
          <input class="form-input" name="name" id="report-name" type="text" placeholder="e.g. Black Samsung Galaxy S24…" required>
        </div>
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select class="form-select" name="category" required>
            <option value="">Select category…</option>
            <?php foreach ($cats as $cat): ?>
              <option value="<?= e($cat) ?>"><?= e($cat) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Location *</label>
          <input class="form-input" name="location" type="text" placeholder="e.g. Library 2nd Floor…" required>
        </div>
        <div class="form-group">
          <label class="form-label">Description <span class="form-optional">(optional)</span></label>
          <textarea class="form-textarea" name="description" rows="3" placeholder="Color, brand, distinguishing features…"></textarea>
        </div>
        <!-- Photo upload -->
        <div class="form-group">
          <label class="form-label">Photo <span class="form-optional">(optional — helps identification)</span></label>
          <input class="form-input" type="file" name="item_image" id="item-image-input"
                 accept="image/jpeg,image/png,image/gif,image/webp"
                 onchange="previewUpload(this)" style="padding:6px 10px;">
          <div class="upload-preview-wrap">
            <img id="upload-preview" class="upload-preview-img" alt="Preview">
          </div>
          <p class="form-hint">JPG, PNG, GIF or WebP · max 5 MB</p>
        </div>
        <p class="form-hint">Post will be reviewed by admin before appearing on the board.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-full btn-cancel" onclick="closeModal('modal-report')">Cancel</button>
        <button type="submit" class="btn btn-full btn-submit">Submit Report</button>
      </div>
    </form>
  </div>
</div>

<!-- ══ CLAIM MODAL ══ -->
<div id="modal-claim" class="modal-overlay" onclick="closeOverlay(event,'modal-claim')">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title" id="claim-modal-title">Claim Request</span>
      <button class="modal-close" onclick="closeModal('modal-claim')">✕</button>
    </div>
    <form method="POST" action="ajax/submit_claim.php">
      <input type="hidden" name="item_id" id="claim-item-id">
      <div class="modal-body">
        <div class="detail-section">
          <div class="detail-label">Item</div>
          <div class="detail-value" id="claim-item-name" style="font-weight:600;font-size:15px;"></div>
        </div>
        <div class="form-group" style="margin-top:1rem;">
          <label class="form-label">Your Name <span class="form-optional">(optional)</span></label>
          <input class="form-input" name="claimant_name" type="text" placeholder="Leave blank to remain anonymous">
        </div>
        <div class="form-group">
          <label class="form-label">Message <span class="form-optional">(optional but recommended)</span></label>
          <textarea class="form-textarea" name="message" rows="3" placeholder="Describe the item further to verify ownership…"></textarea>
          <p class="form-hint">Adding identifying details helps admin verify your claim faster.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-full btn-cancel" onclick="closeModal('modal-claim')">Cancel</button>
        <button type="submit" class="btn btn-full btn-submit">Send Claim Request</button>
      </div>
    </form>
  </div>
</div>

<!-- ══ DETAIL MODAL ══ -->
<div id="modal-detail" class="modal-overlay" onclick="closeOverlay(event,'modal-detail')">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title">Item Details</span>
      <button class="modal-close" onclick="closeModal('modal-detail')">✕</button>
    </div>
    <div class="modal-body" id="detail-body"></div>
    <div class="modal-footer">
      <button class="btn btn-full btn-cancel" onclick="closeModal('modal-detail')">Close</button>
      <button class="btn btn-full btn-submit" id="detail-claim-btn">Send Claim Request</button>
    </div>
  </div>
</div>

<script>
let selectedType = null;
let detailItemId = null;

function openReportModal() {
  selectedType = null;
  document.getElementById('report-type-val').value = '';
  document.getElementById('err-type').style.display = 'none';
  document.getElementById('rtype-lost').className  = 'report-type-btn';
  document.getElementById('rtype-found').className = 'report-type-btn';
  document.getElementById('upload-preview').style.display = 'none';
  document.getElementById('item-image-input').value = '';
  document.getElementById('modal-report').classList.add('open');
}

function selectType(t) {
  selectedType = t;
  document.getElementById('report-type-val').value = t;
  document.getElementById('err-type').style.display = 'none';
  document.getElementById('rtype-lost').className  = 'report-type-btn' + (t === 'lost'  ? ' selected-lost'  : '');
  document.getElementById('rtype-found').className = 'report-type-btn' + (t === 'found' ? ' selected-found' : '');
}

function previewUpload(input) {
  const preview = document.getElementById('upload-preview');
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    preview.style.display = 'none';
  }
}

document.getElementById('form-report').addEventListener('submit', function(e) {
  if (!selectedType) {
    e.preventDefault();
    document.getElementById('err-type').style.display = 'block';
  }
});

function openClaimModal(id, name) {
  document.getElementById('claim-item-id').value   = id;
  document.getElementById('claim-item-name').textContent = name;
  document.getElementById('claim-modal-title').textContent = 'Claim: ' + name;
  document.getElementById('modal-claim').classList.add('open');
}

function openDetailModal(item) {
  detailItemId = item.id;
  const imgHtml = item.image_path
    ? `<img src="${escHtml(item.image_path)}" alt="Item photo" style="width:100%;max-height:200px;object-fit:cover;border-radius:10px;border:1px solid #ddd;margin-bottom:1rem;">`
    : '';
  document.getElementById('detail-body').innerHTML = `
    ${imgHtml}
    <div class="detail-section"><div class="detail-label">Type</div><div class="detail-value">${item.type.charAt(0).toUpperCase()+item.type.slice(1)} Item</div></div>
    <div class="detail-section"><div class="detail-label">Item Name</div><div class="detail-value" style="font-weight:600;font-size:16px;">${escHtml(item.name)}</div></div>
    <div class="detail-section"><div class="detail-label">Category</div><div class="detail-value">${escHtml(item.category)}</div></div>
    <div class="detail-section"><div class="detail-label">Location</div><div class="detail-value">${escHtml(item.location)}</div></div>
    <div class="detail-section"><div class="detail-label">Description</div><div class="detail-value">${escHtml(item.description || 'No description provided.')}</div></div>
    <div class="detail-section"><div class="detail-label">Date Reported</div><div class="detail-value">${item.created_at}</div></div>
  `;
  document.getElementById('detail-claim-btn').onclick = function() {
    closeModal('modal-detail');
    openClaimModal(item.id, item.name);
  };
  document.getElementById('modal-detail').classList.add('open');
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function closeModal(id)  { document.getElementById(id).classList.remove('open'); }
function closeOverlay(e, id) { if (e.target.id === id) closeModal(id); }
</script>
</body>
</html>