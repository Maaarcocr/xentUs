# -*- coding: utf-8 -*-
"""
Created on Thu Apr  7 18:53:49 2016

@author: marco
"""

from flask import Flask, request, render_template, jsonify
from werkzeug import secure_filename
import boto3
ALLOWED_EXTENSIONS = set(['mp3', 'wav'])
BASE_URL = 'https://s3-us-west-2.amazonaws.com/elasticbeanstalk-us-west-2-861661283536/audios/'
BUCKET = 'elasticbeanstalk-us-west-2-861661283536'
application = Flask(__name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@application.route('/', methods=['GET'])
def show():
    return render_template('index.html')
@application.route('/put', methods=['POST'])
def upload():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            s3 = boto3.resource('s3')
            bucket = s3.Bucket(BUCKET)
            bucket.put_object(ACL = 'public-read', Body = file, Key = 'audios/'+filename)
            return jsonify({'url': BASE_URL + filename, 'title': filename.rsplit('.', 1)[0], 'nameS3': filename})
    return ''

@application.route('/delete', methods=['POST'])
def delete():
    if request.method == 'POST':
        name = request.json.get('name')
        print(request.json.get('name'))
        s3 = boto3.resource('s3')
        bucket = s3.Bucket(BUCKET)
        bucket.delete_objects(Delete={
            'Objects' : [{'Key':'audios/'+name}]        
        })
        #(request.form.get('name', default='DUEPALLE'))
        return 'deleted'

if __name__ == '__main__':
    application.run(debug=True)