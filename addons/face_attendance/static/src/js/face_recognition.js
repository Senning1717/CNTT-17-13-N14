/** @odoo-module **/

let currentDescriptor = null;
let currentStream = null; // Thêm biến để quản lý camera

document.addEventListener('click', async function (ev) {
    const scanBtn = ev.target.closest('.action_scan_face_btn') || ev.target.closest('button[name="action_scan_face"]');

    if (scanBtn) {
        ev.preventDefault();
        ev.stopPropagation();
        const video = document.getElementById('video');
        const MODEL_URL = '/face_attendance/static/src/models';

        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            console.log(">>> AI Sẵn sàng!");

            currentStream = await navigator.mediaDevices.getUserMedia({ video: {} });
            video.srcObject = currentStream;

            video.onplaying = () => {
                const interval = setInterval(async () => {
                    // Nếu camera đã tắt thì dừng vòng lặp
                    if (!video.srcObject) {
                        clearInterval(interval);
                        return;
                    }

                    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (detection) {
                        video.style.border = "5px solid #28a745";
                        currentDescriptor = detection.descriptor;
                    } else {
                        video.style.border = "5px solid #dc3545";
                        currentDescriptor = null;
                    }
                }, 200);
            };
        } catch (err) {
            console.error("Lỗi Camera/AI:", err);
        }
    }

    const saveBtn = ev.target.closest('.action_save_face_btn');
    if (saveBtn) {
        ev.preventDefault();
        ev.stopPropagation();

        if (!currentDescriptor) {
            alert("AI chưa bắt được mặt (Viền phải màu xanh)!");
            return;
        }

        const encodingStr = JSON.stringify(Array.from(currentDescriptor));
        const targetField = document.querySelector('textarea[name="face_encoding"]') ||
                            document.querySelector('input[name="face_encoding"]') ||
                            document.querySelector('[name="face_encoding"] textarea');

        if (targetField) {
            targetField.value = encodingStr;
            targetField.dispatchEvent(new Event('input', { bubbles: true }));
            targetField.dispatchEvent(new Event('change', { bubbles: true }));
            targetField.dispatchEvent(new Event('blur', { bubbles: true }));

            alert("Đã trích xuất mã mặt thành công! \n\nLưu ý: Hãy nhấn nút SAVE (đám mây) của Odoo.");
            
            // TỰ ĐỘNG TẮT CAMERA SAU KHI LƯU XONG
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                document.getElementById('video').srcObject = null;
            }
        } else {
            alert("Vẫn không tìm thấy ô nhập liệu. Hãy nhấn nút EDIT (Sửa) hồ sơ nhân viên trước!");
        }
    }
}, true); // ĐÂY LÀ DẤU ĐÓNG QUAN TRỌNG BẠN ĐANG THIẾU
