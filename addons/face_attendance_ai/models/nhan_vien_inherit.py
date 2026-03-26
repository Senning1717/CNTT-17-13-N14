# -*- coding: utf-8 -*-
from odoo import models, fields, api
import face_recognition
import base64
import io
import json

class NhanVienFace(models.Model):
    _inherit = 'nhan_vien'

    # --- NEW: FACE ATTENDANCE ---
    face_encoding = fields.Text("Face Encoding", readonly=True)

    # --- NEW: FACE ATTENDANCE ---
    def write(self, vals):
        res = super(NhanVienFace, self).write(vals)
        if 'anh' in vals and vals['anh']:
            for rec in self:
                rec._compute_face_encoding()
        return res

    # --- NEW: FACE ATTENDANCE ---
    def _compute_face_encoding(self):
        if self.anh:
            try:
                img_data = base64.b64decode(self.anh)
                image = face_recognition.load_image_file(io.BytesIO(img_data))
                encodings = face_recognition.face_encodings(image)
                if encodings:
                    self.face_encoding = json.dumps(encodings[0].tolist())
            except Exception as e:
                pass
