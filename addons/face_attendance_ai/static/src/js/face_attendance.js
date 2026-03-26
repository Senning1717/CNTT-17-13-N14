odoo.define('face_attendance_ai.kiosk', function (require) {
    "use strict";
    var AbstractAction = require('web.AbstractAction');
    var core = require('web.core');
    var rpc = require('web.rpc');

    var FaceAttendanceKiosk = AbstractAction.extend({
        template: 'FaceAttendanceKiosk',
        
	start: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                // --- NEW: WAIT FOR DOM ---
                setTimeout(function() {
                    self.init_camera();
                }, 500);
                self.$('#btn-scan').click(self.proxy('take_snapshot'));
            });
        },

        init_camera: function () {
            var video = document.getElementById('video');
            // Kiểm tra xem video có tồn tại không trước khi gán
            if (video && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(function (stream) {
                        video.srcObject = stream;
                        video.play();
                    })
                    .catch(function (err) {
                        console.error("Không thể mở camera: ", err);
                        alert("Không tìm thấy Camera hoặc trình duyệt chặn quyền truy cập!");
                    });
            }
        },	
        take_snapshot: function () {
            var self = this;
            var canvas = document.getElementById('canvas');
            var video = document.getElementById('video');
            var context = canvas.getContext('2d');
            
            // Vẽ ảnh từ video vào canvas
            context.drawImage(video, 0, 0, 640, 480);
            var imageData = canvas.toDataURL('image/jpeg');

            // --- NEW: SEND TO BACKEND ---
            rpc.query({
                route: '/face_attendance/check',
                params: { image_base64: imageData },
            }).then(function (res) {
                var $msg = self.$('#result-message');
                $msg.show().text(res.message);
                if (res.status === 'success') {
                    $msg.removeClass('alert-danger').addClass('alert-success');
                } else {
                    $msg.removeClass('alert-success').addClass('alert-danger');
                }
            });
        }
    });

    core.action_registry.add('face_attendance_kiosk_action', FaceAttendanceKiosk);
    return FaceAttendanceKiosk;
});
