# -*- coding: utf-8 -*-
{
    'name': "Face Attendance AI",
    'version': '1.0',
    'category': 'Human Resources',
    'summary': 'Tích hợp điểm danh khuôn mặt vào module có sẵn',
    'depends': ['nhan_su', 'cham_cong'], 
    'data': [
        'views/menu.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'face_attendance_ai/static/src/js/face_attendance.js',
        ],
        'web.assets_qweb': [
            'face_attendance_ai/static/src/xml/face_attendance_template.xml',
        ],
    },
    'installable': True,
    'application': True,
}
