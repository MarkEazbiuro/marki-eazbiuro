<?php
declare(strict_types=1);

/*
 * Jednorazowa naprawa serwisu marki.eazbiuro.pl.
 * Usuwa wyłącznie pliki i katalogi utworzone przez wcześniejsze paczki
 * wygenerowane w tej rozmowie. Nie usuwa index.html ani nieznanych plików hostingu.
 * Po prawidłowym wykonaniu skrypt usuwa sam siebie.
 */

header('Content-Type: text/html; charset=UTF-8');
header('X-Robots-Tag: noindex, nofollow', true);

$root = realpath(__DIR__);
if ($root === false) {
    http_response_code(500);
    exit('Nie można ustalić katalogu głównego.');
}

$generatedDirectories = [
    '3m', 'a-z-biuro', 'adler', 'aha', 'ajax', 'aku-sp-z-o-o', 'amex', 'amos',
    'anna-zaradna', 'aqua-polonia', 'argo', 'ariel', 'astra', 'barbara', 'bhp',
    'bi-office', 'bic', 'bigo', 'biurfol', 'black-point', 'bref', 'brennenstuhl',
    'brewis', 'brita', 'bros', 'brother', 'canson', 'carioca', 'cashmir', 'cif',
    'cillit', 'cirrus', 'cisowianka', 'clin', 'clinex', 'coca-cola', 'color-copy',
    'cricco', 'cztery-pory-roku', 'deli', 'derwent', 'diplomat', 'domestos-profess',
    'donau', 'donau-eco', 'donau-expert', 'donau-home', 'donau-professional',
    'donau-safety', 'donau-tech', 'donau-travel', 'duracell', 'dymo', 'eagle',
    'eco-shine', 'edding', 'ellis', 'energizer', 'esselte', 'faber-castell',
    'fellowes', 'fiorello', 'fixi', 'floor', 'forlux', 'assets', 'kategorie',
    'kontakt-i-zrodla', 'mapa-serwisu', 'marki-a-z', 'modele', 'o-serwisie',
    'popularne-marki', 'producenci', 'serie'
];

$generatedFiles = [
    '404.html', '_headers', 'page-manifest.json', 'robots.txt', 'sitemap.xml',
    'PAGE_BATCH_02.md', 'QA_BATCH_02.txt', 'QA_WIZUALNY.txt'
];

function pathInsideRoot(string $root, string $path): bool
{
    $normalizedRoot = rtrim(str_replace('\\', '/', $root), '/');
    $normalizedPath = str_replace('\\', '/', $path);
    return $normalizedPath === $normalizedRoot || str_starts_with($normalizedPath, $normalizedRoot . '/');
}

function removeTree(string $root, string $path, array &$log): void
{
    if (!file_exists($path) && !is_link($path)) {
        return;
    }

    $parent = realpath(dirname($path));
    if ($parent === false || !pathInsideRoot($root, $parent)) {
        $log[] = 'POMINIĘTO (poza katalogiem głównym): ' . htmlspecialchars($path, ENT_QUOTES, 'UTF-8');
        return;
    }

    if (is_link($path) || is_file($path)) {
        if (@unlink($path)) {
            $log[] = 'Usunięto plik: ' . basename($path);
        } else {
            $log[] = 'BŁĄD usuwania pliku: ' . basename($path);
        }
        return;
    }

    $items = scandir($path);
    if ($items === false) {
        $log[] = 'BŁĄD odczytu katalogu: ' . basename($path);
        return;
    }

    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        removeTree($root, $path . DIRECTORY_SEPARATOR . $item, $log);
    }

    if (@rmdir($path)) {
        $log[] = 'Usunięto katalog: ' . basename($path) . '/';
    } else {
        $log[] = 'BŁĄD usuwania katalogu: ' . basename($path) . '/';
    }
}

$existingTargets = [];
foreach ($generatedDirectories as $name) {
    $path = $root . DIRECTORY_SEPARATOR . $name;
    if (file_exists($path) || is_link($path)) {
        $existingTargets[] = $name . '/';
    }
}
foreach ($generatedFiles as $name) {
    $path = $root . DIRECTORY_SEPARATOR . $name;
    if (file_exists($path) || is_link($path)) {
        $existingTargets[] = $name;
    }
}

$executed = false;
$log = [];
$error = null;

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    if (($_POST['confirm'] ?? '') !== 'USUN_PODSTRONY') {
        $error = 'Nieprawidłowe potwierdzenie.';
    } elseif (!is_file($root . DIRECTORY_SEPARATOR . 'index.html')) {
        $error = 'Przerwano: w katalogu nie ma pliku index.html. Nic nie usunięto.';
    } else {
        foreach ($generatedDirectories as $name) {
            removeTree($root, $root . DIRECTORY_SEPARATOR . $name, $log);
        }
        foreach ($generatedFiles as $name) {
            removeTree($root, $root . DIRECTORY_SEPARATOR . $name, $log);
        }
        $executed = true;
    }
}

?><!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Naprawa — usuń wygenerowane podstrony</title>
<style>
body{font-family:Arial,sans-serif;background:#f4f6f8;color:#20262d;margin:0;padding:32px}
main{max-width:850px;margin:auto;background:#fff;padding:28px;border:1px solid #dfe4e8;border-radius:12px;box-shadow:0 12px 36px rgba(0,0,0,.08)}
h1{margin-top:0;color:#b40000}.warn{padding:14px 16px;background:#fff3cd;border:1px solid #ffe69c;border-radius:8px}.ok{padding:14px 16px;background:#d1e7dd;border:1px solid #a3cfbb;border-radius:8px}.err{padding:14px 16px;background:#f8d7da;border:1px solid #f1aeb5;border-radius:8px}button{border:0;border-radius:8px;background:#b40000;color:#fff;font-weight:700;padding:13px 18px;cursor:pointer}code{background:#eef1f4;padding:2px 5px;border-radius:4px}li{margin:.25rem 0}.muted{color:#68727d;font-size:.92rem}
</style>
</head>
<body><main>
<h1>Jednorazowa naprawa serwisu</h1>
<?php if ($executed): ?>
  <div class="ok"><strong>Naprawa zakończona.</strong> Pozostawiono główny plik <code>index.html</code>. Usunięto znalezione podstrony i pliki z wcześniejszych paczek.</div>
  <?php if ($log): ?><h2>Raport</h2><ul><?php foreach ($log as $entry): ?><li><?= $entry ?></li><?php endforeach; ?></ul><?php endif; ?>
  <p><a href="/">Przejdź do strony głównej</a></p>
  <p class="muted">Skrypt próbuje teraz usunąć sam siebie. Gdyby pozostał na serwerze, usuń ręcznie plik <code>NAPRAWA_USUN_PODSTRONY.php</code>.</p>
  <?php @unlink(__FILE__); ?>
<?php else: ?>
  <?php if ($error): ?><div class="err"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div><?php endif; ?>
  <div class="warn"><strong>Uwaga:</strong> operacja usuwa wyłącznie katalogi i pliki utworzone przez wcześniejsze paczki z tej rozmowy. Nie usuwa <code>index.html</code>, plików ukrytych ani nieznanych plików hostingu.</div>
  <h2>Znalezione elementy do usunięcia: <?= count($existingTargets) ?></h2>
  <?php if ($existingTargets): ?>
    <ul><?php foreach ($existingTargets as $target): ?><li><?= htmlspecialchars($target, ENT_QUOTES, 'UTF-8') ?></li><?php endforeach; ?></ul>
    <form method="post">
      <input type="hidden" name="confirm" value="USUN_PODSTRONY">
      <button type="submit">Usuń wygenerowane podstrony</button>
    </form>
  <?php else: ?>
    <p>Nie znaleziono elementów z wcześniejszych paczek. Strona jest już oczyszczona albo pliki znajdują się w innym katalogu.</p>
  <?php endif; ?>
<?php endif; ?>
</main></body></html>
