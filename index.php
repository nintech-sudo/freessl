<?php
$ipaddr = $_SERVER['REMOTE_ADDR'];
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <title>NinTech | Free SSL</title>
    <link rel="icon" href="assets/img/logo-nintech.png">
</head>

<body>

    <div class="container" id="container">
        <div class="form-container validate">
            <form>
                <div class="form-header">
                    <div class="logo-header">
                        <a href="https://nin.id.vn/" rel="home" aria-current="page">
                            <img src="assets/img/logo-nintech.png" alt="logo_nintech"
                                onerror="this.src='assets/img/logo-nintech.png';"
                                decoding="async">
                        </a>
                        <h2><a style="text-decoration: none;" href="https://nin.id.vn/" rel="home" class="nintech-title"><span style="color: #2e3590;">Nin</span><span style="color: #eb1d23;">Tech</span></a></h2>
                    </div>
                </div>
                <div id="message" style="text-align: center; width: 100%;">
                </div>
                <p></p>
                <!-- Thêm overlay loading -->
                <div id="loadingOverlay" style="display: none;">
                    <div id="progress">0%</div>
                    <div style="width: 300px; height: 20px; background: #ddd; position: relative;">
                        <div id="progressFill" style="width: 0%; height: 100%; background: #4caf50;"></div>
                        <div id="snail" style="position: absolute; top: 0; left: 0; width: 30px; height: 20px;">🐌</div>
                    </div>
                </div>
                <div id="result" style="text-align: center; width: 100%; max-height: 540px; overflow-y: auto; overflow-x: hidden;">
                    <p></p>
                </div>
            </form>
        </div>

        <div class="form-container register">
            <form id="sslForm">
                <div class="form-header">
                    <div class="logo-header">
                        <a href="https://nin.id.vn/" rel="home" aria-current="page">
                            <img src="assets/img/logo-nintech.png" alt="logo_nintech"
                                onerror="this.src='assets/img/logo-nintech.png';"
                                decoding="async">
                        </a>
                        <h2><a style="text-decoration: none;" href="https://nin.id.vn/" rel="home" class="nintech-title"><span style="color: #2e3590;">Nin</span><span style="color: #eb1d23;">Tech</span></a></h2>
                    </div>
                </div>
                <h1>Free SSL Certificate Generator</h1>
                <p style="font-size: 18px;">Chứng chỉ SSL Let's Encrypt miễn phí có thời hạn 90 ngày.<br>Nếu bạn cần thời hạn lâu hơn? <a style="font-size: 14px;" href="https://vinahost.vn/sectigo-ssl/" target="_blank">Xem chi tiết.</a></p>
                <label for="domains">Nhập tên miền*</label>
                <input id="domains" type="text" name="domains" placeholder="your-domain.com, www.yourdomain.com">
                <label for="email">Nhập địa chỉ Email*</label>
                <input id="email" type="email" name="email" placeholder="your-email@gmail.com">

                <label for="email">Chọn phương thức xác thực*</label>
                <div class="radio-group">
                    <label>
                        <input type="radio" id="http" name="validation" value="http" checked>
                        <span style="font-size: 16px;">HTTP</span>
                    </label>

                    <label>
                        <input type="radio" id="dns" name="validation" value="dns">
                        <span style="font-size: 16px;">DNS</span>
                    </label>
                </div>

                <div class="checkbox-group">
                    <label for="agreeTos">
                        <input id="agreeTos" type="checkbox" name="agreeTos">
                        <strong>Đồng ý</strong> <a style="font-size: 16px" href="https://letsencrypt.org/documents/LE-SA-v1.3-September-21-2022.pdf"
                            target="_blank">Let's Encrypt SA (pdf)*</a>
                    </label>
                </div>

                <div id="error-msg" style="font-size: 14px !important; color: red;"></div>

                <button id="register" type="submit">Tạo chứng chỉ SSL miễn phí</button>
            </form>
        </div>
        <div class="toggle-container">
            <div class="toggle">
                <div class="toggle-panel toggle-left">
                    <h1>Hãy thực hiện bước tiếp theo!</h1>
                    <p>Trở về bước đầu tiên nếu bạn muốn đổi phương thức xác thực.</p>
                    <button class="hidden" id="home-page">Đổi phương thức xác thực</button>
                </div>
                <div class="toggle-panel toggle-right">
                    <h1>Chào mừng bạn!</h1>
                    <p>Nhập đầy đủ thông tin cần tạo chứng chỉ SSL Let's Encrypt trước khi thực hiện bước tiếp theo.</p>
                    <button class="hidden" id="validate-page" style="display: none;">Tiến hành xác thực</button>
                </div>
            </div>
        </div>
    </div>

    <script src="assets/js/script.js"></script>
    <script>
        // Thêm sự kiện submit cho form
        document.getElementById('sslForm').addEventListener('submit', function(event) {
            event.preventDefault(); // Ngăn chặn form submit mặc định

            // Hiển thị nút "Tiếp theo"
            document.getElementById('validate-page').style.display = 'block';

        });

        let messageDiv = document.getElementById("message");
        // Hàm cập nhật thông báo (hỗ trợ HTML)
        function showMessage(message) {
            messageDiv.innerHTML = `<p style="font-size: 16px;">${message}</p>`;
        }

    </script>
</body>

</html>