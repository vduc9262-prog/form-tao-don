/* =========================
   FR-16 & FR-18 · Tạo đơn
   ========================= */

// ----- Config (mock – thay bằng data từ trang chi tiết) -----
const ORDER = {
    pricePerDay: 150000,
    days: 2,
    serviceRate: 0.05,
    insurancePerDay: 15000,
    deliveryFees: {
        self: 0,
        delivery: 50000,
        airport: 80000
    }
};

const HOLD_SECONDS = 10 * 60; // 10 phút giữ chỗ

// ----- State -----
let remaining = HOLD_SECONDS;
let timerId = null;
let selectedDelivery = "self";

// ----- DOM -----
const countdownEl = document.getElementById("countdown");
const holdBar = document.getElementById("hold-bar");
const holdBanner = document.getElementById("hold-banner");
const addressBox = document.getElementById("address-box");
const noteInput = document.getElementById("order-note");
const noteCount = document.getElementById("note-count");
const expiredModal = document.getElementById("expired-modal");

const costDays = document.getElementById("cost-days");
const costRental = document.getElementById("cost-rental");
const costService = document.getElementById("cost-service");
const costInsurance = document.getElementById("cost-insurance");
const costDeliveryLine = document.getElementById("cost-delivery-line");
const costDeliveryLabel = document.getElementById("cost-delivery-label");
const costDelivery = document.getElementById("cost-delivery");
const costTotal = document.getElementById("cost-total");

// ----- Helpers -----
function formatVND(n) {
    return n.toLocaleString("vi-VN") + "đ";
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ----- Countdown (FR-18) -----
function startCountdown() {
    remaining = HOLD_SECONDS;
    updateCountdownUI();

    timerId = setInterval(() => {
        remaining--;
        updateCountdownUI();

        if (remaining <= 0) {
            clearInterval(timerId);
            onHoldExpired();
        }
    }, 1000);
}

function updateCountdownUI() {
    countdownEl.textContent = formatTime(remaining);

    const pct = (remaining / HOLD_SECONDS) * 100;
    holdBar.style.width = pct + "%";

    // Urgent when < 2 minutes
    if (remaining <= 120) {
        holdBanner.classList.add("urgent");
    } else {
        holdBanner.classList.remove("urgent");
    }
}

function onHoldExpired() {
    expiredModal.hidden = false;
    document.body.style.overflow = "hidden";
}

document.getElementById("btn-restart").addEventListener("click", () => {
    expiredModal.hidden = true;
    document.body.style.overflow = "";
    startCountdown();
});

// ----- Delivery method (FR-16) -----
document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener("change", () => {
        selectedDelivery = radio.value;
        addressBox.hidden = selectedDelivery === "self";
        updateCost();
    });
});

// ----- Notes char count -----
noteInput.addEventListener("input", () => {
    const len = noteInput.value.length;
    if (len > 300) {
        noteInput.value = noteInput.value.slice(0, 300);
    }
    noteCount.textContent = noteInput.value.length;
});

// ----- Cost table -----
function updateCost() {
    const rental = ORDER.pricePerDay * ORDER.days;
    const service = Math.round(rental * ORDER.serviceRate);
    const insurance = ORDER.insurancePerDay * ORDER.days;
    const deliveryFee = ORDER.deliveryFees[selectedDelivery] || 0;

    costDays.textContent = ORDER.days;
    costRental.textContent = formatVND(rental);
    costService.textContent = formatVND(service);
    costInsurance.textContent = formatVND(insurance);

    if (deliveryFee > 0) {
        costDeliveryLine.hidden = false;
        const labels = {
            delivery: "Phí giao tận nơi",
            airport: "Phí nhận sân bay / ga"
        };
        costDeliveryLabel.textContent = labels[selectedDelivery] || "Phí giao nhận";
        costDelivery.textContent = formatVND(deliveryFee);
    } else {
        costDeliveryLine.hidden = true;
    }

    const total = rental + service + insurance + deliveryFee;
    costTotal.textContent = formatVND(total);
}

// ----- Submit -----
document.getElementById("btn-submit").addEventListener("click", () => {
    const name = document.getElementById("contact-name").value.trim();
    const phone = document.getElementById("contact-phone").value.trim();

    if (!name) {
        alert("Vui lòng nhập họ tên.");
        document.getElementById("contact-name").focus();
        return;
    }

    if (!phone) {
        alert("Vui lòng nhập số điện thoại.");
        document.getElementById("contact-phone").focus();
        return;
    }

    if (selectedDelivery !== "self") {
        const addr = document.getElementById("delivery-address").value.trim();
        if (!addr) {
            alert("Vui lòng nhập địa chỉ nhận xe.");
            document.getElementById("delivery-address").focus();
            return;
        }
    }

    // Demo – thay bằng POST /api/orders
    const payload = {
        vehicle: "Honda Vision 2024",
        days: ORDER.days,
        delivery: selectedDelivery,
        address: document.getElementById("delivery-address")?.value || null,
        note: noteInput.value.trim(),
        contact: {
            name,
            phone,
            email: document.getElementById("contact-email").value.trim()
        },
        total: costTotal.textContent
    };

    console.log("Order payload:", payload);
    alert(
        "Đơn đã được tạo!\n\n" +
        "Tổng: " + costTotal.textContent + "\n" +
        "Hình thức: " + selectedDelivery + "\n\n" +
        "(Chuyển sang bước thanh toán – demo)"
    );
});

document.getElementById("btn-back").addEventListener("click", () => {
    // Demo – quay lại trang chi tiết
    alert("Quay lại trang chi tiết xe (demo)");
});

// ----- Init -----
updateCost();
startCountdown();
