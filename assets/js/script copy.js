document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("sslForm");
  const domainsInput = document.getElementById("domains");
  const emailInput = document.getElementById("email");
  const agreeTosInput = document.getElementById("agreeTos");
  const errorMsg = document.getElementById("error-msg");
  const container = document.getElementById("container");
  const loginBtn = document.getElementById("home-page");
  const validateBtn = document.getElementById("validate-page");
  const registerBtn = document.getElementById("register");

  // Regex kiểm tra domain
  const domainRegex =
    /^(?:\*\.)?(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?:,\s*)?)+$/;
  // Regex kiểm tra email
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Hàm hiển thị thông báo lỗi
  function showError(input, message) {
    const existingError = input.nextElementSibling;
    if (existingError && existingError.className === "error-message") {
      existingError.remove();
    }

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.color = "red";
    errorDiv.style.fontSize = "12px";
    errorDiv.textContent = message;
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
    input.style.borderColor = "red";
  }

  // Hàm xóa thông báo lỗi
  function clearError(input) {
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.className === "error-message") {
      errorDiv.remove();
    }
    input.style.borderColor = "";
  }

  // Hàm kiểm tra domain
  function validateDomains(value) {
    if (!value) {
      showError(domainsInput, "Vui lòng nhập ít nhất một tên miền");
      return false;
    }

    const domains = value.split(",").map((domain) => domain.trim());
    for (let domain of domains) {
      if (!domainRegex.test(domain)) {
        showError(
          domainsInput,
          "Định dạng tên miền không hợp lệ. Ví dụ: example.com"
        );
        return false;
      }
    }

    clearError(domainsInput);
    return true;
  }
  // Hàm kiểm tra và giới hạn phương thức xác thực nếu domain là wildcard
  function validateAuthMethod(domainValue) {
    const httpRadio = document.getElementById("http");
    const dnsRadio = document.getElementById("dns");
    const domains = domainValue.split(",").map((domain) => domain.trim());

    // Kiểm tra xem có domain nào là wildcard không
    const hasWildcard = domains.some((domain) => domain.startsWith("*."));

    if (hasWildcard) {
      // Nếu có wildcard, chỉ cho phép chọn DNS
      dnsRadio.checked = true; // Chọn DNS
      httpRadio.disabled = true; // Vô hiệu hóa HTTP
      // showError(
      //   document.getElementById("domains"),
      //   "Chỉ có thể chọn DNS cho domain wildcard."
      // );
    } else {
      // Nếu không có wildcard, cho phép chọn cả HTTP và DNS
      httpRadio.disabled = false;
      clearError(document.getElementById("domains"));
    }
  }
  // Hàm kiểm tra email
  function validateEmail(value) {
    if (!value) {
      showError(emailInput, "Vui lòng nhập địa chỉ email");
      return false;
    }

    if (!emailRegex.test(value)) {
      showError(
        emailInput,
        "Định dạng email không hợp lệ. Ví dụ: user@example.com"
      );
      return false;
    }

    clearError(emailInput);
    return true;
  }

  // Hàm kiểm tra checkbox agreeTos
  function validateAgreeTos() {
    if (!agreeTosInput.checked) {
      errorMsg.textContent =
        "Vui lòng đồng ý với Let's Encrypt Subscriber Agreement";
      errorMsg.style.display = "block";
      return false;
    }
    errorMsg.style.display = "none";
    return true;
  }

  // Hàm kiểm tra toàn bộ form
  function isFormValid() {
    const isDomainsValid = validateDomains(domainsInput.value.trim());
    const isEmailValid = validateEmail(emailInput.value.trim());
    const isTosAgreed = validateAgreeTos();
    return isDomainsValid && isEmailValid && isTosAgreed;
  }

  // Thêm sự kiện input để kiểm tra realtime
  domainsInput.addEventListener("input", function () {
    validateDomains(this.value.trim());
  });

  emailInput.addEventListener("input", function () {
    validateEmail(this.value.trim());
  });

  // Sự kiện khi người dùng nhập vào trường domain
  document.getElementById("domains").addEventListener("input", () => {
    const domainValue = document.getElementById("domains").value;
    if (validateDomains(domainValue)) {
      validateAuthMethod(domainValue);
    }
  });

  agreeTosInput.addEventListener("change", function () {
    if (this.checked) {
      errorMsg.style.display = "none";
    }
  });

  // Xử lý sự kiện click cho các nút nếu tồn tại
  if (registerBtn && container) {
    registerBtn.addEventListener("click", () => {
      if (isFormValid()) {
        container.classList.add("active");
        container.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
  if (validateBtn && container) {
    validateBtn.addEventListener("click", () => {
      if (isFormValid()) {
        container.classList.add("active");
        container.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  if (loginBtn && container) {
    loginBtn.addEventListener("click", () => {
      container.classList.remove("active");
      container.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Hàm hiển thị loading
  function showLoading() {
    const overlay = document.getElementById("loadingOverlay");
    const progress = document.getElementById("progress");
    const progressFill = document.getElementById("progressFill");
    const snail = document.getElementById("snail");
    overlay.style.display = "flex";

    let percentage = 0;
    const interval = setInterval(() => {
      percentage += Math.random() * 10;
      if (percentage >= 90) percentage = 90;

      const displayPercentage = Math.round(percentage);
      progress.textContent = `${displayPercentage}%`;
      progressFill.style.width = `${displayPercentage}%`;

      const maxLeft = 300 - 30; // Chiều dài thanh (300px) - kích thước ốc sên (30px)
      const snailPosition = (displayPercentage / 100) * maxLeft;
      snail.style.left = `${snailPosition}px`;
    }, 500);

    return interval;
  }

  // Hàm ẩn loading
  function hideLoading(interval) {
    clearInterval(interval);
    const overlay = document.getElementById("loadingOverlay");
    const progress = document.getElementById("progress");
    const progressFill = document.getElementById("progressFill");
    const snail = document.getElementById("snail");

    progress.textContent = "100%";
    progressFill.style.width = "100%";
    snail.style.left = `${300 - 30}px`;

    setTimeout(() => {
      overlay.style.display = "none";
      progress.textContent = "0%";
      progressFill.style.width = "0%";
      snail.style.left = "0px";
    }, 300);
  }

  // Hàm kiểm tra phân giải DNS
  async function checkDNSResolution(authInfo, dnsStatus, validateBtn) {
    dnsStatus.textContent = "Đang kiểm tra DNS...";
    dnsStatus.style.color = "black";

    for (const auth of authInfo) {
      if (auth.type === "dns") {
        const domain = auth.name; // Ví dụ: _acme-challenge.example.com
        const expectedValue = auth.value;

        try {
          const response = await fetch(
            `https://1.1.1.1/dns-query?name=${domain}&type=TXT`,
            {
              headers: {
                Accept: "application/dns-json",
              },
            }
          );
          const data = await response.json();
          console.log("Kết quả DNS:", data);

          if (data.Status === 0 && data.Answer) {
            const txtRecords = data.Answer.filter(
              (answer) => answer.type === 16
            ).map((answer) => answer.data.replace(/"/g, ""));
            console.log("TXT Records:", txtRecords);
            if (txtRecords.includes(expectedValue)) {
              dnsStatus.textContent = "DNS đã khớp!";
              dnsStatus.style.color = "green";
              validateBtn.disabled = false;
              return true;
            } else {
              dnsStatus.textContent =
                "DNS chưa khớp với record TXT. Vui lòng kiểm tra lại.";
              dnsStatus.style.color = "red";
              validateBtn.disabled = true;
              return false;
            }
          } else {
            dnsStatus.textContent =
              "Không tìm thấy bản ghi TXT. Vui lòng kiểm tra DNS.";
            dnsStatus.style.color = "red";
            validateBtn.disabled = true;
            return false;
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra DNS:", error);
          dnsStatus.textContent = "Lỗi khi kiểm tra DNS. Vui lòng thử lại.";
          dnsStatus.style.color = "red";
          validateBtn.disabled = true;
          return false;
        }
      }
    }
    // Nếu không phải DNS, trả về false để không xử lý ở đây
    return false;
  }

  // Hàm kiểm tra xác thực HTTP
  async function checkHTTPValidation(authInfo, dnsStatus, validateBtn) {
    dnsStatus.textContent = "Đang kiểm tra HTTP...";
    dnsStatus.style.color = "black";

    for (const auth of authInfo) {
      if (auth.type === "http") {
        const url = auth.url; // URL cần kiểm tra
        const expectedContent = auth.content; // Nội dung mong đợi

        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "text/plain",
            },
          });
          console.log("Kết quả HTTP:", response);

          if (response.ok) {
            // Kiểm tra status 200
            const content = await response.text();
            console.log("Nội dung trả về:", content);

            if (content.trim() === expectedContent.trim()) {
              dnsStatus.textContent = "HTTP đã khớp!";
              dnsStatus.style.color = "green";
              validateBtn.disabled = false;
              return true;
            } else {
              dnsStatus.textContent =
                "Nội dung HTTP không khớp. Vui lòng kiểm tra lại.";
              dnsStatus.style.color = "red";
              validateBtn.disabled = true;
              return false;
            }
          } else {
            dnsStatus.textContent = `Không thể truy cập URL (${response.status}). Vui lòng kiểm tra lại.`;
            dnsStatus.style.color = "red";
            validateBtn.disabled = true;
            return false;
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra HTTP:", error);
          dnsStatus.textContent = "Lỗi khi kiểm tra HTTP. Vui lòng thử lại.";
          dnsStatus.style.color = "red";
          validateBtn.disabled = true;
          return false;
        }
      }
    }
    // Nếu không phải HTTP, trả về false để không xử lý ở đây
    return false;
  }

  // Hàm tổng hợp để gọi hàm kiểm tra phù hợp
  async function checkValidation(authInfo, dnsStatus, validateBtn) {
    const isDNS = authInfo.some((auth) => auth.type === "dns");
    const isHTTP = authInfo.some((auth) => auth.type === "http");

    if (isDNS) {
      return await checkDNSResolution(authInfo, dnsStatus, validateBtn);
    } else if (isHTTP) {
      return await checkHTTPValidation(authInfo, dnsStatus, validateBtn);
    } else {
      dnsStatus.textContent = "Không có phương thức xác thực hợp lệ.";
      dnsStatus.style.color = "red";
      validateBtn.disabled = true;
      return false;
    }
  }

  // // Sửa lại hàm showCountdown để dùng hàm tổng hợp
  // function showCountdown(resultDiv, authInfo) {
  //   let timeLeft = 60;
  //   resultDiv.innerHTML = `<p>Vui lòng chờ thử lại sau ... <span id="countdown">${timeLeft}</span> giây</p>`;

  //   form.style.pointerEvents = "none";
  //   domainsInput.disabled = true;
  //   emailInput.disabled = true;
  //   agreeTosInput.disabled = true;

  //   const countdownInterval = setInterval(() => {
  //     timeLeft--;
  //     document.getElementById("countdown").textContent = timeLeft;

  //     if (timeLeft <= 0) {
  //       clearInterval(countdownInterval);
  //       form.style.pointerEvents = "auto";
  //       domainsInput.disabled = false;
  //       emailInput.disabled = false;
  //       agreeTosInput.disabled = false;

  //       resultDiv.innerHTML = `<p>Xác thực chưa hoàn tất. Vui lòng kiểm tra trước khi xác thực.</p>
  //                            <p id="dns-status">Chưa kiểm tra.</p>`;
  //       authInfo.forEach((auth) => {
  //         if (auth.type === "dns") {
  //           resultDiv.innerHTML += `
  //           <p><strong>Thêm bản ghi TXT vào trang quản trị DNS:</strong></p>
  //           <p style="display: block; text-align: left; word-wrap: break-word;overflow-wrap: break-word;white-space: normal;width: 100%; font-size: 16px;"><strong>Name:</strong> ${auth.name}</p>
  //           <p style="display: block; text-align: left; word-wrap: break-word;overflow-wrap: break-word;white-space: normal;width: 100%; font-size: 16px;"><strong>Value:</strong> ${auth.value}</p>
  //         `;
  //         } else if (auth.type === "http") {
  //           resultDiv.innerHTML += `
  //           <p><strong>Tạo file xác thực trên Server/Hosting:</strong></p>
  //           <p style="display: block; text-align: left; word-wrap: break-word;overflow-wrap: break-word;white-space: normal;width: 100%; font-size: 16px;"><strong>URL:</strong> <a href="${auth.url}" target="_blank">${auth.url}</a></p>
  //           <p style="display: block; text-align: left; word-wrap: break-word;overflow-wrap: break-word;white-space: normal;width: 100%; font-size: 16px;"><strong>Nội dung:</strong> ${auth.content}</p>
  //         `;
  //         }
  //       });
  //       resultDiv.innerHTML += `
  //       <button type="button" class="dns-check-btn" id="checkBtn">Kiểm tra</button>
  //       <button type="button" class="validate-submit" id="validateBtn" disabled>Xác thực</button>`;

  //       const checkBtn = document.getElementById("checkBtn");
  //       const validateBtn = document.getElementById("validateBtn");
  //       const dnsStatus = document.getElementById("dns-status");

  //       checkBtn.addEventListener("click", () => {
  //         checkValidation(authInfo, dnsStatus, validateBtn).then((isValid) => {
  //           if (isValid && !validateBtn.onclick) {
  //             validateBtn.addEventListener("click", validateSSL);
  //           }
  //         });
  //       });
  //     }
  //   }, 1000);
  // }

  // Hàm xử lý xác thực SSL
  function validateSSL(event) {
    event.preventDefault();

    let loadingInterval = showLoading();

    const email = emailInput.value.trim();
    const domains = domainsInput.value.trim();

    let validateData = new FormData();
    validateData.append("action", "retry-validate");
    validateData.append("ajax", "true");
    validateData.append("email", email);
    validateData.append("domains", domains);

    fetch("generate-ssl.php", {
      method: "POST",
      body: validateData,
      credentials: "same-origin",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => {
        console.log("Phản hồi từ server (validateSSL):", text);
        if (!text || text.trim() === "") {
          throw new Error("Phản hồi từ server trống");
        }
        try {
          const data = JSON.parse(text);
          hideLoading(loadingInterval);
          let resultDiv = document.getElementById("result");

          if (data.error) {
            console.log("Lỗi nhận được:", data.error);
            if (
              data.error.includes(
                "Chưa thể phân phối hoặc xác thực không hợp lệ"
              )
            ) {
              showCountdown(resultDiv, data.authInfo || []);
            } else {
              resultDiv.innerHTML = `<p style="color: red;">${data.error}</p>`;
            }
          } else {
            showMessage(`<h3>Chứng chỉ đã được cấp thành công 🎉🎉🎉</h3>`);
            resultDiv.innerHTML = `
          <p></p>
          <textarea style="width: 85%; height: 200px; margin: 10px auto; display: block; resize: vertical; padding: 10px; font-family: monospace; background-color: #f9f9f9; border: 1px solid #ccc;">${data.certContent}</textarea>
          <p><a style="font-size: 14px; padding: 5px 10px; border-radius: 4px; text-decoration: none; color: #f7f7f7; background-color: #f37032; font-weight: bold;" href="${data.certLink}" download>👉 Tải CERT + CA Bundle</a></p>
          <p></p>
          <textarea style="width: 85%; height: 200px; margin: 10px auto; display: block; resize: vertical; padding: 10px; font-family: monospace; background-color: #f9f9f9; border: 1px solid #ccc;">${data.keyContent}</textarea>
          <p><a style="font-size: 14px; padding: 5px 10px; border-radius: 4px; text-decoration: none; color: #f7f7f7; background-color: #f37032; font-weight: bold;" href="${data.keyLink}" download>👉 Tải Private Key</a></p>
      `;
          }
        } catch (e) {
          throw new Error("Lỗi phân tích JSON: " + e.message);
        }
      })
      .catch((error) => {
        hideLoading(loadingInterval);
        document.getElementById(
          "result"
        ).innerHTML = `<p style="color: red;">Lỗi: ${error.message}</p>`;
      });
  }

  // Sửa lại phần submit form để dùng hàm tổng hợp
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    showMessage(`<p>Đang khởi tạo....</p>`);
    if (isFormValid() && container) {
      container.scrollIntoView({ behavior: "smooth" });
      container.classList.add("active");

      let loadingInterval = showLoading();
      let formData = new FormData(this);
      formData.append("ajax", "true");
      formData.append("action", "generate");


      // console.log("Dữ liệu gửi đi:", [...formData]);
      // Debug dữ liệu gửi đi
      console.log("Dữ liệu FormData gửi đi:", Object.fromEntries(formData));

      fetch("generate-ssl.php", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.text();
        })
        .then((text) => {
          console.log("Phản hồi từ server (submit):", text);
          if (!text || text.trim() === "") {
            throw new Error("Phản hồi từ server trống");
          }

          try {
            const data = JSON.parse(text);
            hideLoading(loadingInterval);
            let resultDiv = document.getElementById("result");
            resultDiv.innerHTML = "";

            if (data.error) {
              resultDiv.innerHTML = `<p style="color: red;">${data.error}</p>`;
            } else if (data.success) {
              const domainValue = document.getElementById("domains").value;
              showMessage(`<h3>Hãy xác minh rằng bạn sở hữu domain:</h3> <p style="font-size: 16px; font-weight: bold; color: #f37032;">${domainValue}</p>`);

              if (data.authInfo) {
                resultDiv.innerHTML += `<p id="dns-status"></p>`;
                data.authInfo.forEach((auth) => {
                  if (auth.type === "dns") {
                    resultDiv.innerHTML += `
                    <h3><strong>Thêm bản ghi TXT vào trang quản trị DNS:</strong></h3>
                    <p style="display: block; text-align: left; word-wrap: break-word;overflow-wrap: break-word;white-space: normal;width: 100%; font-size: 16px;"><strong>Name:</strong> ${auth.name}</p>
                    <p style="display: block; text-align: left; word-wrap: break-word;overflow-wrap: break-word;white-space: normal;width: 100%; font-size: 16px;"><strong>Value:</strong> ${auth.value}</p>
                  `;
                  } else if (auth.type === "http") {
                    resultDiv.innerHTML += `
                    <h3><strong>Tạo file xác thực trên Server/Hosting</strong></h3>
                    <p style="display: block; text-align: left; word-wrap: break-word;overflow-wrap: break-word;white-space: normal;width: 100%; font-size: 16px;"><strong>URL:</strong> <a href="${auth.url}" target="_blank">${auth.url}</a></p>
                    <p style="display: block; text-align: left; word-wrap: break-word;overflow-wrap: break-word;white-space: normal;width: 100%; font-size: 16px;"><strong>Nội dung:</strong> ${auth.content}</p>
                  `;
                  }
                });

                resultDiv.innerHTML += `
                <button type="button" class="dns-check-btn" id="checkBtn">Kiểm tra</button>
                <button type="button" class="validate-submit" id="validateBtn" disabled>Xác thực</button>`;

                const checkBtn = document.getElementById("checkBtn");
                const validateBtn = document.getElementById("validateBtn");
                const dnsStatus = document.getElementById("dns-status");

                checkBtn.addEventListener("click", () => {
                  checkValidation(data.authInfo, dnsStatus, validateBtn).then(
                    (isValid) => {
                      if (isValid && !validateBtn.onclick) {
                        validateBtn.addEventListener("click", validateSSL);
                      }
                    }
                  );
                });
              }
            }
          } catch (e) {
            throw new Error("Lỗi phân tích JSON: " + e.message);
          }
        })
        .catch((error) => {
          hideLoading(loadingInterval);
          document.getElementById(
            "result"
          ).innerHTML = `<p style="color: red;">Lỗi: ${error.message}</p>`;
        });
    }
  });
});
