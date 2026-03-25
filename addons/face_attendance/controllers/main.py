# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
import json

class FaceAttendanceController(http.Controller):

    @http.route('/face_attendance/check_in', type='json', auth='user', csrf=False)
    def face_check_in(self, live_encoding_str):
        # Tìm tất cả nhân viên đã có mã mặt
        employees = request.env['hr.employee'].sudo().search([('face_encoding', '!=', False)])
        
        for employee in employees:
            # Gọi hàm so sánh logic Euclidean mà bạn đã viết trong models
            if employee.check_face_recognition(live_encoding_str):
                # Thực hiện Check-in/Check-out (tự động đảo trạng thái)
                employee.sudo()._attendance_action_change()
                return {
                    'status': 'success',
                    'employee_name': employee.name,
                    'type': 'vào' if employee.attendance_state == 'checked_in' else 'ra'
                }
        
        return {'status': 'failed', 'message': 'Không tìm thấy khuôn mặt trong hệ thống!'}
