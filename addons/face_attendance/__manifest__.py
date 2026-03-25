# -*- coding: utf-8 -*-
{
    'name': 'Face Recognition Attendance',
    'version': '1.0',
    'category': 'Human Resources',
    'summary': 'Chấm công bằng nhận diện khuôn mặt',
    'depends': ['hr', 'hr_attendance'],
    'data': [
        'views/hr_employee_views.xml',
        'views/face_kiosk_views.xml',
    ],
	'assets': {
        	'web.assets_backend': [
            	'face_attendance/static/src/js/face-api.min.js',
            	'face_attendance/static/src/js/face_kiosk.js',
            	'face_attendance/static/src/css/face_kiosk.css',
        ],
	'web.assets_qweb': [
        'face_attendance/static/src/xml/face_kiosk.xml',  # ✅ đúng chỗ
    ],
    },
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
