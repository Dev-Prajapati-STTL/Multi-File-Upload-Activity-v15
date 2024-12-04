# -*- coding: utf-8 -*-
{
    'name': "Multi-File Upload v15",
    'version' : '15.0.1.0',
    'summary': "",
    'sequence': 10,
    'description': "",
    'category': 'Uncategorized',
    'depends': ['mail', 'web'],
    'assets': {
        'web.assets_backend': [
            'sttl_multiple_files_activity/static/src/js/file_uploader.js',
            'sttl_multiple_files_activity/static/src/js/activity.js',
        ],
    },
    'auto_install': True,  # Automatically installs your module when the 'mail' module is installed
    'installable': True,
    'application': False,
    "price": 0,
    "author": "Silver Touch Technologies Limited",
    "website": "https://www.silvertouch.com/",
    'images': ['static/description/banner.png'],
    "currency": "USD",
    'license': 'LGPL-3',
}
