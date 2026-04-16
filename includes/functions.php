<?php
// ============================================================
//  includes/functions.php — Shared helper functions
// ============================================================

require_once __DIR__ . '/db.php';

// ── sanitize output ──────────────────────────────────────────
function e(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

// ── fetch board stats ────────────────────────────────────────
function getStats(): array {
    $db = getDB();
    $row = $db->query("
        SELECT
            SUM(status = 'approved') AS active,
            SUM(status = 'approved' AND type = 'lost')  AS lost,
            SUM(status = 'approved' AND type = 'found') AS found,
            SUM(status = 'claimed')  AS claimed,
            SUM(status = 'pending')  AS pending
        FROM items
    ")->fetch();
    return array_map('intval', $row);
}

// ── fetch approved items (public board) ──────────────────────
function getPublicItems(string $type = '', string $category = '', string $search = ''): array {
    $db = getDB();
    $where = ["i.status IN ('approved','claimed')"];
    $params = [];

    if ($type && in_array($type, ['lost','found'])) {
        $where[] = 'i.type = :type';
        $params[':type'] = $type;
    }
    if ($category) {
        $where[] = 'i.category = :category';
        $params[':category'] = $category;
    }
    if ($search) {
        $where[] = '(i.name LIKE :search OR i.description LIKE :search2)';
        $params[':search']  = '%' . $search . '%';
        $params[':search2'] = '%' . $search . '%';
    }

    $sql = "SELECT i.*,
                   COUNT(c.id) AS claim_count
            FROM items i
            LEFT JOIN claim_requests c ON c.item_id = i.id
            WHERE " . implode(' AND ', $where) . "
            GROUP BY i.id
            ORDER BY i.created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

// ── fetch all items for admin ─────────────────────────────────
function getAdminItems(string $status = ''): array {
    $db = getDB();
    $where = $status ? 'WHERE i.status = :status' : '';
    $params = $status ? [':status' => $status] : [];

    $sql = "SELECT i.*,
                   COUNT(c.id) AS claim_count
            FROM items i
            LEFT JOIN claim_requests c ON c.item_id = i.id
            $where
            GROUP BY i.id
            ORDER BY i.created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

// ── fetch claim requests for admin ────────────────────────────
function getClaimRequests(): array {
    $db = getDB();
    return $db->query("
        SELECT c.*, i.name AS item_name, i.type AS item_type
        FROM claim_requests c
        JOIN items i ON i.id = c.item_id
        ORDER BY c.created_at DESC
    ")->fetchAll();
}

// ── fetch single item with its claims ─────────────────────────
function getItemWithClaims(int $id): ?array {
    $db = getDB();
    $item = $db->prepare("SELECT * FROM items WHERE id = ?");
    $item->execute([$id]);
    $row = $item->fetch();
    if (!$row) return null;

    $claims = $db->prepare("SELECT * FROM claim_requests WHERE item_id = ? ORDER BY created_at DESC");
    $claims->execute([$id]);
    $row['claims'] = $claims->fetchAll();
    return $row;
}

// ── badge / pill helpers ──────────────────────────────────────
function statusPill(string $status): string {
    $map = [
        'pending'  => ['status-pending',  'Pending'],
        'approved' => ['status-approved', 'Approved'],
        'rejected' => ['status-rejected', 'Rejected'],
        'claimed'  => ['status-claimed',  'Claimed'],
    ];
    [$cls, $label] = $map[$status] ?? ['status-pending', $status];
    return "<span class=\"status-pill {$cls}\">" . e($label) . "</span>";
}

function typeBadge(string $type): string {
    if ($type === 'lost')  return '<span class="status-pill badge-lost">Lost</span>';
    if ($type === 'found') return '<span class="status-pill badge-found">Found</span>';
    return '';
}

// ── categories list ───────────────────────────────────────────
function categories(): array {
    return ['Electronics','Clothing','Accessories','Documents','Bags','Keys','Books','Other'];
}
