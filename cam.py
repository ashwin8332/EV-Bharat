import cv2
import numpy as np
import urllib.request

# ESP32-CAM image URL
url = 'http://192.168.1.11/cam-hi.jpg'

whT = 416
confThreshold = 0.25
nmsThreshold = 0.3

# Load class names
classesfile = 'coco.names'
classNames = []

with open(classesfile, 'rt') as f:
    classNames = f.read().rstrip('\n').split('\n')

# Load YOLO model
modelConfig = 'yolov3.cfg'
modelWeights = 'yolov3.weights'

net = cv2.dnn.readNetFromDarknet(modelConfig, modelWeights)
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)


def findObject(outputs, im):

    hT, wT, _ = im.shape
    bbox = []
    classIds = []
    confs = []

    for output in outputs:
        for det in output:

            objectness = float(det[4])
            scores = det[5:]
            classId = np.argmax(scores)
            confidence = float(scores[classId]) * objectness

            if confidence > confThreshold:

                w = int(det[2] * wT)
                h = int(det[3] * hT)

                x = int((det[0] * wT) - w / 2)
                y = int((det[1] * hT) - h / 2)

                bbox.append([x, y, w, h])
                classIds.append(classId)
                confs.append(float(confidence))

    indices = cv2.dnn.NMSBoxes(bbox, confs, confThreshold, nmsThreshold)

    if len(indices) > 0:
        for i in np.array(indices).flatten():

            box = bbox[i]
            x, y, w, h = box

            label = str(classNames[classIds[i]])
            confidence = int(confs[i] * 100)

            cv2.rectangle(im, (x, y), (x+w, y+h), (255, 0, 255), 2)
            cv2.putText(im,
                        f'{label.upper()} {confidence}%',
                        (x, y-10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (255, 0, 255),
                        2)


while True:

    # Get image from ESP32-CAM
    try:
        img_resp = urllib.request.urlopen(url, timeout=2)
        imgnp = np.array(bytearray(img_resp.read()), dtype=np.uint8)
        im = cv2.imdecode(imgnp, cv2.IMREAD_COLOR)
    except Exception:
        if cv2.waitKey(1) == 27:
            break
        continue

    if im is None:
        if cv2.waitKey(1) == 27:
            break
        continue

    blob = cv2.dnn.blobFromImage(im, 1/255, (whT, whT), [0,0,0], 1, crop=False)
    net.setInput(blob)

    layernames = net.getLayerNames()
    outputNames = [layernames[int(i) - 1] for i in np.array(net.getUnconnectedOutLayers()).flatten()]

    outputs = net.forward(outputNames)

    findObject(outputs, im)

    cv2.imshow('ESP32-CAM YOLO Detection', im)

    if cv2.waitKey(1) == 27:
        break

cv2.destroyAllWindows()