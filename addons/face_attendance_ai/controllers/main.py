# -*- coding: utf-8 -*-
from odoo import http, fields
from odoo.http import request
import face_recognition
import base64
import io
import json
import numpy as np

class FaceController(http.Controller):

    # --- NEW: FACE ATTENDANCE ---
    @http.route('/face_attendance/check', type='json', auth="user")
    def check_face(self, image_base64, **kwargs):
        try:
            header, encoded = image_base64.split(",", 1)
            img_data = base64.b64decode(encoded)
            unknown_img = face_recognition.load_image_file(io.BytesIO(img_data))
            unknown_encodings = face_recognition.face_encodings(unknown_img)

            if not unknown_encodings:
                return {'status': 'error', 'message': 'Không thấy mặt!'}

            all_staff = request.env['nhan_vien'].sudo().search([('face_encoding', '!=', False)])
            
            for staff in all_staff:
                known_encoding = np.array(json.loads(staff.face_encoding))
                results = face_recognition.compare_faces([known_encoding], unknown_encodings[0], tolerance=0.5)
                
                if results[0]:
                    return self._record_attendance(staff)

            return {'status': 'error', 'message': 'Không khớp nhân viên nào!'}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}

    def _record_attendance(self, staff):
        today = fields.Date.today()
        attendance = request.env['cham_cong'].sudo().search([
            ('nhan_vien_id', '=', staff.id),
            ('ngay_cham_cong', '=', today)
        ], limit=1)

        if not attendance:
            request.env['cham_cong'].sudo().create({
                'nhan_vien_id': staff.id,
                'ngay_cham_cong': today,
                'gio_vao': fields.Datetime.now(),
            })
            return {'status': 'success', 'message': f'Chào {staff.ho_va_ten}, Check-in thành công!'}
        else:
            attendance.sudo().write({'gio_ra': fields.Datetime.now()})
            return {'status': 'success', 'message': f'Tạm biệt {staff.ho_va_ten}, Check-out thành công!'}
