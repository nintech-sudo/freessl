<?php
// Require thu vien
require 'vendor/autoload.php';

use League\Flysystem\Filesystem;
use League\Flysystem\Local\LocalFilesystemAdapter;
use Afosto\Acme\Client;

// Thiet lap thu muc session tuy chinh
$sessionPath = __DIR__ . '/sessions';
if (!is_dir($sessionPath)) {
    mkdir($sessionPath, 0770, true) or die(json_encode(['error' => 'Khong the tao thu muc sessions']));
}
session_save_path($sessionPath);

// Khoi tao session
if (!session_start()) {
    error_log("Loi: Khong the khoi dong session");
    echo json_encode(['error' => 'Khong the khoi dong session']);
    exit;
}

// Thiet lap header JSON
header('Content-Type: application/json');

// Duong dan luu tru
$storagePath = __DIR__ . '/data';
$sslPath = __DIR__ . '/ssl';

// Tao thu muc neu chua ton tai
if (!is_dir($storagePath)) {
    mkdir($storagePath, 0755, true) or die(json_encode(['error' => 'Khong the tao thu muc data']));
}
if (!is_dir($sslPath)) {
    mkdir($sslPath, 0755, true) or die(json_encode(['error' => 'Khong the tao thu muc ssl']));
}

// Khoi tao filesystem
$adapter = new LocalFilesystemAdapter($storagePath);
$filesystem = new Filesystem($adapter);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'generate') {
        $email = $_POST['email'] ?? '';
        $domains = array_filter(array_map('trim', explode(',', $_POST['domains'] ?? '')));
        $validation = $_POST['validation'] ?? 'dns';

        // Kiem tra du lieu dau vao
        if (empty($email) || empty($domains)) {
            echo json_encode(['error' => 'Thieu email hoac domain']);
            exit;
        }

        // Kiem tra wildcard domain
        $isWildcard = false;
        foreach ($domains as $domain) {
            if (strpos($domain, '*.') === 0) {
                $isWildcard = true;
                if ($validation !== 'dns') {
                    echo json_encode(['error' => 'Wildcard domain chi ho tro xac thuc DNS']);
                    exit;
                }
                break;
            }
        }

        try {
            // Format email va tao thu muc
            $emailFormatted = preg_replace('/[@.]+/', '-', $email);
            $emailDir = $storagePath . '/le/' . $emailFormatted;
            $accountFile = $emailDir . '/account.pem';
            $validationFile = $emailDir . '/last_validation.txt';

            // Kiem tra phuong thuc xac thuc cuoi cung
            $lastValidation = file_exists($validationFile) ? file_get_contents($validationFile) : null;
            $register = !file_exists($accountFile);

            // Neu phuong thuc xac thuc thay doi, xoa thu muc cu
            if (
                ($lastValidation !== null && $lastValidation !== $validation) ||
                (isset($_SESSION['validation']) && $_SESSION['validation'] !== $validation)
            ) {
                if (is_dir($emailDir)) {
                    $files = new RecursiveIteratorIterator(
                        new RecursiveDirectoryIterator($emailDir, RecursiveDirectoryIterator::SKIP_DOTS),
                        RecursiveIteratorIterator::CHILD_FIRST
                    );
                    foreach ($files as $fileinfo) {
                        $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
                        $todo($fileinfo->getRealPath());
                    }
                    rmdir($emailDir) or die(json_encode(['error' => 'Khong the xoa thu muc email cu']));
                }
                $register = true;
                session_unset();
            }

            // Luu thong tin vao session
            $_SESSION['email'] = $email;
            $_SESSION['validation'] = $validation;
            $_SESSION['mode'] = Client::MODE_LIVE;
            $_SESSION['isWildcard'] = $isWildcard;

            // Tao thu muc email neu chua ton tai
            if (!is_dir($emailDir)) {
                mkdir($emailDir, 0755, true) or die(json_encode(['error' => "Khong the tao thu muc $emailDir"]));
            }

            // Khoi tao client voi contact la mang
            $clientConfig = [
                'username' => $email,
                'fs'       => $filesystem,
                'mode'     => $_SESSION['mode'],
                'register' => $register,
                'contact'  => ['mailto:' . $email], // Dam bao contact la mang
                'debug'    => true,
            ];

            // Debug: Ghi log cau hinh client
            error_log("Client config (generate): " . json_encode($clientConfig));

            // Khoi tao client
            $client = new Client($clientConfig);

            // Tao order
            $order = $client->createOrder($domains);
            $_SESSION['order'] = serialize($order);
            $_SESSION['domains'] = $domains;

            // Kiem tra trang thai order
            if ($order->getStatus() === 'invalid' || $order->getStatus() === 'valid') {
                throw new Exception("Order da o trang thai {$order->getStatus()}, khong the tao challenge moi.");
            }

            // Lay authorizations
            $authorizations = $client->authorize($order);
            $_SESSION['authorizations'] = serialize($authorizations);

            $authInfo = [];
            foreach ($authorizations as $index => $authorization) {
                $domain = $authorization->getDomain();

                if ($validation === 'http' && !$isWildcard) {
                    $file = $authorization->getFile();
                    if ($file === false || $file === null) {
                        error_log("Loi: Khong the lay thong tin file xac thuc HTTP cho domain " . $domain);
                        echo json_encode(['error' => 'Khong the lay thong tin file xac thuc HTTP cho domain ' . $domain]);
                        exit;
                    }

                    $path = ".well-known/acme-challenge/" . $file->getFilename();
                    $fullPath = __DIR__ . '/' . $path;

                    if (!is_dir(dirname($fullPath))) {
                        mkdir(dirname($fullPath), 0755, true) or die(json_encode(['error' => 'Khong the tao thu muc xac thuc HTTP cho ' . $domain]));
                    }

                    file_put_contents($fullPath, $file->getContents()) or die(json_encode(['error' => 'Khong the ghi file xac thuc HTTP cho ' . $domain]));

                    $authInfo[] = [
                        'type' => 'http',
                        'url' => "http://{$domain}/{$path}",
                        'content' => $file->getContents(),
                    ];
                } else {
                    $txtRecord = $authorization->getTxtRecord();
                    if ($txtRecord === false || $txtRecord === null) {
                        error_log("Loi: Khong the lay thong tin TXT record cho domain $domain");
                        echo json_encode(['error' => "Khong the lay thong tin TXT record cho domain $domain"]);
                        exit;
                    }

                    $authInfo[] = [
                        'type' => 'dns',
                        'name' => $txtRecord->getName(),
                        'value' => $txtRecord->getValue(),
                    ];
                }
            }
            $_SESSION['authInfo'] = $authInfo;

            // Luu phuong thuc xac thuc
            file_put_contents($validationFile, $validation) or die(json_encode(['error' => 'Khong the ghi file last_validation.txt']));

            echo json_encode([
                'success' => true,
                'message' => 'Hay xac minh rang ban so huu domain: ' . implode(', ', $domains),
                'authInfo' => $authInfo
            ]);
        } catch (Exception $e) {
            error_log("Loi khi tao SSL: " . $e->getMessage());
            echo json_encode(['error' => 'Loi khi tao SSL: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'validate' || $action === 'retry-validate') {
        $email = $_POST['email'] ?? '';
        $domains = array_filter(array_map('trim', explode(',', $_POST['domains'] ?? '')));

        // Kiem tra du lieu dau vao
        if (empty($email) || empty($domains)) {
            echo json_encode(['error' => 'Thieu email hoac domain trong yeu cau xac thuc']);
            exit;
        }

        // Kiem tra session
        if (
            !isset($_SESSION['order'], $_SESSION['authorizations'], $_SESSION['domains'], $_SESSION['email'], $_SESSION['mode'], $_SESSION['validation'], $_SESSION['authInfo'], $_SESSION['isWildcard']) ||
            $_SESSION['email'] !== $email || implode(',', $_SESSION['domains']) !== implode(',', $domains)
        ) {
            echo json_encode(['error' => 'Khong tim thay thong tin xac thuc hoac du lieu khong khop']);
            exit;
        }

        // Lay du lieu tu session
        $order = unserialize($_SESSION['order']);
        $domains = $_SESSION['domains'];
        $authorizations = unserialize($_SESSION['authorizations']);
        $email = $_SESSION['email'];
        $validation = $_SESSION['validation'];
        $mode = $_SESSION['mode'];
        $authInfo = $_SESSION['authInfo'];
        $isWildcard = $_SESSION['isWildcard'];

        try {
            // Khoi tao client voi contact
            $emailDir = $storagePath . '/le/' . preg_replace('/[@.]+/', '-', $email);
            $accountFile = $emailDir . '/account.pem';
            $register = !file_exists($accountFile);

            $clientConfig = [
                'username' => $email,
                'fs'       => $filesystem,
                'mode'     => $mode,
                'register' => $register,
                'contact'  => ['mailto:' . $email], // Dam bao contact la mang
                'debug'    => true,
            ];

            // Debug: Ghi log cau hinh client
            error_log("Client config (validate): " . json_encode($clientConfig));

            $client = new Client($clientConfig);

            // Xac thuc challenges
            foreach ($authorizations as $authorization) {
                $challenge = ($validation === 'dns') ? $authorization->getDnsChallenge() : $authorization->getHttpChallenge();
                $client->validate($challenge, 15);
            }

            // Kiem tra trang thai order
            if ($client->isReady($order)) {
                $certificate = $client->getCertificate($order);
                if (!$certificate || empty($certificate->getCertificate())) {
                    echo json_encode(['error' => 'Chung chi chua san sang hoac bi loi']);
                    exit;
                }

                // Luu chung chi
                $filePrefix = $isWildcard ? 'wildcard_' : '';
                $certPath = "{$sslPath}/{$filePrefix}{$domains[0]}.cert";
                $keyPath = "{$sslPath}/{$filePrefix}{$domains[0]}.key";

                file_put_contents($certPath, $certificate->getCertificate()) or die(json_encode(['error' => 'Khong the ghi file chung chi']));
                file_put_contents($keyPath, $certificate->getPrivateKey()) or die(json_encode(['error' => 'Khong the ghi file private key']));

                $certContent = file_get_contents($certPath);
                if ($certContent === false) {
                    echo json_encode(['error' => 'Khong the doc noi dung file cert+ca']);
                    exit;
                }

                $keyContent = file_get_contents($keyPath);
                if ($keyContent === false) {
                    echo json_encode(['error' => 'Khong the doc noi dung file private key']);
                    exit;
                }

                // Xoa session sau khi thanh cong
                session_destroy();

                echo json_encode([
                    'success' => true,
                    'message' => '✅ Chung chi da duoc cap thanh cong!',
                    'certLink' => "ssl/{$filePrefix}{$domains[0]}.cert",
                    'keyLink' => "ssl/{$filePrefix}{$domains[0]}.key",
                    'certContent' => $certContent,
                    'keyContent' => $keyContent
                ]);
            } else {
                echo json_encode([
                    'error' => 'Xac thuc that bai. Vui long thay doi dia chi email hoac phuong thuc xac thuc va thu lai.',
                    'authInfo' => $authInfo
                ]);
            }
        } catch (Exception $e) {
            error_log("Loi xac thuc: " . $e->getMessage());
            echo json_encode(['error' => 'Loi xac thuc: ' . $e->getMessage()]);
        }
        exit;
    }

    echo json_encode(['error' => 'Hanh dong khong hop le']);
    exit;
}

echo json_encode(['error' => 'Yeu cau khong hop le']);
exit;