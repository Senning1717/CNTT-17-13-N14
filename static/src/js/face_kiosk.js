/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, useState, onWillStart, onMounted } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";

export class FaceKiosk extends Component {
    setup() {
        this.state = useState({
            statusMessage: "Vui lòng đứng trước camera",
            statusClass: "text-info",
            loading: true,
            lastEmployee: null,
            lastAction: ""
        });

        onMounted(() => {
            this.startKiosk();
        });
    }

    async startKiosk() {
        const video = document.getElementById('kiosk_video');
        const MODEL_URL = '/face_attendance/static/src/models';

        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        this.state.loading = false;
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;

        setInterval(async () => {
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection) {
                video.style.border = "5px solid #28a745";
                this.processCheckIn(detection.descriptor);
            } else {
                video.style.border = "5px solid #ccc";
            }
        }, 1000); // Quét mỗi giây 1 lần
    }

    async processCheckIn(descriptor) {
        const encodingStr = JSON.stringify(Array.from(descriptor));
        try {
            const result = await rpc("/face_attendance/check_in", {
                live_encoding_str: encodingStr
            });

            if (result.status === 'success') {
                this.state.statusMessage = "NHẬN DIỆN THÀNH CÔNG!";
                this.state.statusClass = "text-success";
                this.state.lastEmployee = result.employee_name;
                this.state.lastAction = result.type;
            }
        } catch (err) {
            console.error("Lỗi RPC:", err);
        }
    }
}

FaceKiosk.template = "face_attendance.FaceKiosk";
registry.category("actions").add("face_attendance_kiosk", FaceKiosk);
