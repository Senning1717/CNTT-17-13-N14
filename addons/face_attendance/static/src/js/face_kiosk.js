/** @odoo-module **/

import { registry } from "@web/core/registry";
const { Component, useState } = owl;

export class FaceKiosk extends Component {
    setup() {
        this.state = useState({
            loading: true,
            lastEmployee: null,
            statusMessage: "Vui lòng đứng trước camera"
        });

        // Thay vì dùng onMounted, Odoo 17 khuyến khích dùng Promise trong setup 
        // hoặc gọi hàm sau khi component khởi tạo
        setTimeout(() => {
            this.startKiosk();
        }, 500);
    }

    async startKiosk() {
        const video = document.getElementById('kiosk_video');
        if (!video) return;

        const MODEL_URL = '/face_attendance/static/src/models';

        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            
            this.state.loading = false;
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            video.srcObject = stream;

            setInterval(async () => {
                if (this.state.loading) return;
                const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection) {
                    video.style.border = "5px solid #28a745";
                    this.processCheckIn(detection.descriptor);
                } else {
                    video.style.border = "5px solid #ccc";
                }
            }, 1000);
        } catch (err) {
            console.error("Lỗi AI/Camera:", err);
        }
    }

    async processCheckIn(descriptor) {
        const encodingStr = JSON.stringify(Array.from(descriptor));
        try {
            // Sử dụng rpc từ env
            const result = await this.env.services.rpc("/face_attendance/check_in", {
                live_encoding_str: encodingStr
            });

            if (result.status === 'success') {
                this.state.lastEmployee = result.employee_name;
                this.state.statusMessage = "NHẬN DIỆN THÀNH CÔNG!";
                
                // Tự động xóa tên sau 3 giây để người sau vào quét
                setTimeout(() => {
                    this.state.lastEmployee = null;
                    this.state.statusMessage = "Vui lòng đứng trước camera";
                }, 3000);
            }
        } catch (err) {
            // Lỗi im lặng để không hiện popup làm phiền kiosk
        }
    }
}

FaceKiosk.template = "face_attendance.FaceKiosk";
registry.category("actions").add("face_attendance_kiosk", FaceKiosk);
