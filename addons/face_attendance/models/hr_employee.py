from odoo import models, fields
import json
import numpy as np

class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    face_encoding = fields.Text(string="Face Encoding")

    def check_face_recognition(self, live_encoding_str):
        self.ensure_one()
        if not self.face_encoding:
            return False
        
        # Chuyển chuỗi JSON từ trình duyệt thành mảng số
        saved_encoding = np.array(json.loads(self.face_encoding))
        live_encoding = np.array(json.loads(live_encoding_str))

        # Tính khoảng cách Euclidean (Càng nhỏ càng giống)
        dist = np.linalg.norm(saved_encoding - live_encoding)
        
        # Ngưỡng 0.6 là chuẩn của face-api.js (nhỏ hơn 0.6 là cùng 1 người)
        return dist < 0.5
