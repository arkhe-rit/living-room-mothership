from __future__ import print_function
import cv2, sys, json, base64, cProfile, pstats, io, math
import numpy as np

MAX_RECURSION_DEPTH = 20
MIN_MATCH_COUNT = (
    15  # Minimum no. of positive feature matches to consider something a whole object
)
DETECTOR_ALG = "sift"  # SIFT, ORB, BRISK, or AKAZE
DETECTOR = None
MATCHER = None
BLOB_DETECTOR = None
IS_DEBUG = False


def log(s):
    print("LOG: " + s, file=sys.stderr)

def notify_state(s):
    print("STATE: " + s, file=sys.stderr)

def start_loop():
    # -- 0.) Initialize data from JS and read in + process images
    params = json.loads(sys.stdin.readline())  # Read in parameters from JS
    log("Logging params")
    log(str(params))
    refs = params["refs"]  # Reference image path
    global IS_DEBUG
    # IS_DEBUG = True
    IS_DEBUG = params["debug"]  # Debug draw

    refs_dict = {}
    for refPathName, refPath in refs.items():
        refs_dict[refPathName] = cv2.imread(
            cv2.samples.findFile(refPath), cv2.IMREAD_GRAYSCALE
        )  # Read image from filepath, in grayscale - https://www.geeksforgeeks.org/python-opencv-cv2-imread-method/
        if refs_dict is None:
            raise TypeError(
                "Unable to parse the input data!"
            )  # Raise an exception if improper data is given to the image variables that does not trip an exception on its own

    refs_dict["passport"] = cv2.imread(
        "./src/observer/img/uspassport.png", cv2.IMREAD_GRAYSCALE
    )  # USE FOR DEBUGGING/TESTINGv

    # Initialize detector & matcher
    global DETECTOR
    global MATCHER
    DETECTOR, MATCHER = init_fd()
    
    global BLOB_DETECTOR
    BLOB_DETECTOR = create_blob_detector()

    while True:
        log("Get to the choppa")

        params = json.loads(sys.stdin.readline()) 
        log("Received image: " + str("image" in params and len(params["image"]) > 0))
        bitmap = np.frombuffer(
            base64.b64decode(params["image"]), np.uint8
        )  # Decode base64 image data from the buffer to a numpy int array
        found_cards = feature_detect(bitmap, refs_dict)
        
        log("done")

        print(json.dumps(found_cards))
        sys.stdout.flush()

        if IS_DEBUG:
            break

def feature_detect_in_dev(bitmap, refs_dict):
    img_of_desktop = cv2.imdecode(bitmap, cv2.IMREAD_GRAYSCALE)
    
    thresh = cv2.adaptiveThreshold(img_of_desktop, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 13, 30)
    cv2.imshow('Binary image', thresh)
    cv2.waitKey(0)

    contours, hierarchy = cv2.findContours(
        image=thresh, mode=cv2.RETR_LIST, method=cv2.CHAIN_APPROX_SIMPLE
    )
    # TODO apply contour approximation https://docs.opencv.org/4.x/dd/d49/tutorial_py_contour_features.html
    not_small_contours = list(filter(lambda c: cv2.contourArea(c) > 300, contours))
    
    # draw contours on the original image
    image_copy = img_of_desktop.copy()
    cv2.drawContours(image=image_copy, contours=not_small_contours, contourIdx=-1, color=(0, 0, 0), thickness=2, lineType=cv2.LINE_AA)

    cv2.imshow('Contours', image_copy)
    cv2.waitKey(0)

    def cntr_to_box(cnt):
        rect = cv2.minAreaRect(cnt)
        box = cv2.boxPoints(rect)
        return np.int0(box)
    rects = list(map(cntr_to_box, not_small_contours))
    image_copy_rects = img_of_desktop.copy()
    cv2.drawContours(image_copy_rects,rects,-1,(0,0,0), thickness=2, lineType=cv2.LINE_AA)

    cv2.imshow('Boxes', image_copy_rects)
    cv2.waitKey(0)

    # color_mask = np.zeros(img_of_desktop, np.uint8)
    color_mask = np.zeros(img_of_desktop.shape[:2], dtype="uint8")
    def mean_color_is_whiteish(cnt):
        color_mask[...]=0
        cv2.drawContours(color_mask,[cnt],0,255,-1)
        cv2.imshow('color mask', color_mask)
        cv2.waitKey(0)

        mean_color = cv2.mean(img_of_desktop, color_mask)
        log(str(mean_color))
        return mean_color[0] < 200
    white_contours = list(filter(mean_color_is_whiteish, rects))
    log('white contours list' + str(len(not_small_contours)))
    image_copy_whites = img_of_desktop.copy()
    cv2.drawContours(image_copy_whites,white_contours,-1,(0,0,0), thickness=2, lineType=cv2.LINE_AA)

    cv2.imshow('White contours', image_copy_whites)
    cv2.waitKey(0)


    return []


def feature_detect(bitmap, refs_dict):
    # Decode to an image array, in grayscale - https://www.geeksforgeeks.org/python-opencv-imdecode-function/
    img_of_desktop = cv2.imdecode(bitmap, cv2.IMREAD_GRAYSCALE)
    # cv2.imshow("frame", img_of_desktop)
    # cv2.waitKey()

    # ret, thresh = cv2.threshold(img_of_desktop, 100, 255, cv2.THRESH_BINARY)
    # if IS_DEBUG:
    #     cv2.imshow('Binary image', thresh)
    #     cv2.waitKey()
    # img_of_desktop = thresh

    queryImg = img_of_desktop.copy()
    foundMask = np.zeros(
        queryImg.shape[:2], dtype="uint8"
    )  # Initial mask matching the query dimensions with each pixel set to 0
    foundMask = cv2.bitwise_not(
        foundMask
    )  # Needs to be reversed so we are removing the image with the mask, rather than removing everything but the image
    matchesMask = None


    blobKp = BLOB_DETECTOR.detect(img_of_desktop)
    img_of_desktop_with_blobs = cv2.drawKeypoints(
        img_of_desktop,
        blobKp,
        np.array([]),
        (0, 0, 255),
        cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS,
    )

    if IS_DEBUG:
        cv2.imshow("BLOB", img_of_desktop_with_blobs)
        cv2.waitKey(0)

    # -- 3.) Detect keypoints & compute descriptors
    found_cards = []

    for refName, refImg in refs_dict.items():
        # refImg = quick_resize(refImg, 50)

        found_refs_gen = parse_reference(
            queryImg,
            refImg,
            foundMask,
            matchesMask,
            refName,
            blobKp,
        )
        found_refs = [ref for ref in found_refs_gen]

        found_cards.extend(found_refs)

    return found_cards


# Get query & reference keypoints and descriptors
detect_card_memo = {}

def ref_img_detect_keypoints(refName, ref):
    if refName in detect_card_memo:
        return detect_card_memo.get(refName)
    else:
        keypoints, descriptors = DETECTOR.detectAndCompute(ref, None)
        detect_card_memo[refName] = (keypoints, descriptors)
        return keypoints, descriptors


def detect_card(query, ref, refName, mask=None):
    keypoints1, descriptors1 = DETECTOR.detectAndCompute(query, mask)

    # log("ref: " + str(ref) + "\nmask: " + str(mask))
    ref_keypoints, ref_descriptors = ref_img_detect_keypoints(refName, ref)

    return keypoints1, ref_keypoints, descriptors1, ref_descriptors


def recalculate_query(query, mask=None):
    keypoints, descriptors = DETECTOR.detectAndCompute(query, mask)

    return keypoints1, descriptors1


# One iteration of checking if a reference is present in the query
def parse_reference(
    query,
    ref,
    foundMask,
    matchesMask,
    refName,
    blobKp,
    recursionDepth=0,
):
    if recursionDepth > MAX_RECURSION_DEPTH:
        return

    desktop_keypoints, ref_keypoints, desktop_descriptors, ref_descriptors = detect_card(query, ref, refName, foundMask)

    if DETECTOR_ALG == "sift" or DETECTOR_ALG == "orb":
        good_matches = match_flann(desktop_descriptors, ref_descriptors, foundMask)
    else:
        good_matches = match_bf(desktop_descriptors, ref_descriptors)

    def within_some_blob(pt):
        dist_to_nearest = math.inf
        nearest_blob_kp = None
        for kp in blobKp:
            dist_to_blob = math.hypot(pt[0] - kp.pt[0], pt[1] - kp.pt[1])
            if dist_to_blob < dist_to_nearest:
                dist_to_nearest = min(dist_to_nearest, dist_to_blob)
                nearest_blob_kp = kp
        return (
            nearest_blob_kp is not None and dist_to_nearest < nearest_blob_kp.size
        )  # shouldn't this be size / 2? Seems to work better though

    # keep only the matches found within a recognized card-blob
    good_matches = [m for m in good_matches if within_some_blob(desktop_keypoints[m.queryIdx].pt)]

    # -- 4.) Use matches and homography to guess object bounds & write to JSON
    # Quick crash course on homography:
    # Consider a flat plane, like the table or desk you may or may not be working on. If your code breaks for the 23rd time in a day, you might be inclined to flip your table.
    # In doing so, the plane of your desk would now be at a different rotation. To represent fun stuff like that on a computer, a computer needs to know how to interpret that
    # flat plane going through a 3-dimensional movement (being flipped in anger) within a 2-dimensional viewport (your computer screen). Enter: the homography.
    # In essence, a homography represents the relation between a surface at different rotations and transformations. From the homography matrix, you can calculate things like
    # perspective changes, which is what we're trying to use it for down below so that our feature detector can recognize images we give it at different orientations.
    # https://docs.opencv.org/4.x/d9/dab/tutorial_homography.html
    if len(good_matches) > MIN_MATCH_COUNT:
        src_pts = np.float32([desktop_keypoints[m.queryIdx].pt for m in good_matches]).reshape(
            -1, 1, 2
        )
        dst_pts = np.float32([ref_keypoints[m.trainIdx].pt for m in good_matches]).reshape(
            -1, 1, 2
        )

        M, mask = cv2.findHomography(dst_pts, src_pts, cv2.RANSAC, 10.0)
        matchesMask = mask.ravel().tolist()
        h, w = ref.shape

        pts = np.float32([[0, 0], [0, h - 1], [w - 1, h - 1], [w - 1, 0]]).reshape(
            -1, 1, 2
        )

        # We're only looking for 3 x 5 cards
        dim_ratio = min(h, w) / max(h, w)
        is_3x5 = 2.5 / 5 < dim_ratio and dim_ratio < 3.5 / 5
        # if enough src_points are in a blob

        if M is not None and M.all() and is_3x5:
            dst = cv2.perspectiveTransform(pts, M)
            query = cv2.polylines(
                query, [np.int32(dst)], True, (200, 100, 200), 3, cv2.LINE_AA
            )  # Add lines showing the bounds of the detected object

            float16_info = np.finfo(np.float16)
            min_num = float(float16_info.min)
            max_num = float(float16_info.max)

            def clamp(n):
                return min(max(min_num, float(n)), max_num)

            points = [dst[0][0], dst[1][0], dst[2][0], dst[3][0]]
            points = [[clamp(p[0]), clamp(p[1])] for p in points]

            center = centroid(
                dst[0], dst[1], dst[2], dst[3]
            )  # Calculate the center point
            center = [clamp(center[0]), clamp(center[1])]

            yield {  # Send the data we want back
                "object": refName,  # Type of object
                "points": np.float16(points).tolist(),  # Corner points
                "center": np.float16(center).tolist(),  # Center point
            }

            # Masking time
            foundMask = cv2.fillPoly(foundMask, [np.int32(dst)], (0, 0, 0))
            if IS_DEBUG:
                cv2.imshow("Mask", foundMask)

            # Mask the query image
            query = cv2.bitwise_and(query, query, mask=cv2.bitwise_not(foundMask))

            # -- 5.) Draw & show matches if debug enabled
            if IS_DEBUG:
                debug_draw(query, ref, desktop_keypoints, ref_keypoints, good_matches, matchesMask)

        # See if there is anyting else
        yield from parse_reference(
            query,
            ref,
            foundMask,
            matchesMask,
            refName,
            blobKp,
            recursionDepth + 1,
        )


# Initialize appropriate feature detector and matcher
def init_fd():
    FLANN_INDEX_KDTREE = 1
    FLANN_INDEX_LSH = 6

    if DETECTOR_ALG == "sift":
        detector = cv2.SIFT_create(
            nfeatures=0,
            nOctaveLayers=3,
            contrastThreshold=0.04,
            edgeThreshold=10,
            sigma=1.6,
        )
        nFLANN_INDEX_KDTREEorm = cv2.NORM_L2
        flann_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
        matcher = cv2.FlannBasedMatcher(flann_params, {})
    elif DETECTOR_ALG == "orb":
        detector = cv2.ORB_create()
        norm = cv2.NORM_HAMMING
        flann_params = dict(
            algorithm=FLANN_INDEX_LSH, table_number=6, key_size=12, multi_probe_level=2
        )
        matcher = cv2.FlannBasedMatcher(flann_params, {})
    elif DETECTOR_ALG == "brisk":
        detector = cv2.BRISK_create()
        norm = cv2.NORM_HAMMING
        matcher = cv2.BFMatcher(norm, crossCheck=True)
    elif DETECTOR_ALG == "akaze":
        detector = cv2.AKAZE_create()
        norm = cv2.NORM_HAMMING
        matcher = cv2.BFMatcher(norm, crossCheck=True)
    else:
        detector, matcher = None

    return detector, matcher

def create_blob_detector():
    blob_params = cv2.SimpleBlobDetector_Params()

    blob_params.filterByColor = True
    blob_params.blobColor = 255

    blob_params.minThreshold = 100
    blob_params.maxThreshold = 256
    blob_params.thresholdStep = 10

    blob_params.filterByArea = True
    blob_params.minArea = 1000
    blob_params.maxArea = 1350000

    blob_params.filterByCircularity = True
    blob_params.minCircularity = 0.5
    blob_params.maxCircularity = 0.9

    blob_params.filterByConvexity = True
    blob_params.minConvexity = 0.8

    blob_params.filterByInertia = True
    blob_params.minInertiaRatio = 0.4
    blob_params.maxInertiaRatio = 0.8

    blob_params.minDistBetweenBlobs = 0.0

    return cv2.SimpleBlobDetector_create(blob_params)



# FLANN matcher
def match_flann(desktop_descriptors, ref_descriptors, mask=None):
    knn_matches = MATCHER.knnMatch(desktop_descriptors, ref_descriptors, 2, mask)
    ratio_thresh = 0.4  # <-- This is a magic number, originally 0.7. Only change for experimentation and/or amusement.
    
    # A guy named Lowe who worked on SIFT came up with a handy way to identify false matches
    good_matches = []
    for (m, n) in knn_matches:  
        # The test compares the ratio between the two nearest matches of a given keypoint
        if m.distance < ratio_thresh * n.distance:  
            # If the ratio is below the threshold, it is considered a good match
            good_matches.append(m)
    return good_matches


# Brute Force matcher
def match_bf(desktop_descriptors, ref_descriptors):
    matches = MATCHER.match(desktop_descriptors, ref_descriptors)
    good_matches = sorted(matches, key=lambda x: x.distance)
    return good_matches


# Debug window drawing
def debug_draw(query, ref, desktop_keypoints, ref_keypoints, good_matches, matchesMask):

    draw_params = dict(
        matchColor=(200, 0, 100),
        singlePointColor=(0, 50, 200),
        matchesMask=matchesMask,
        flags=2,
    )
    img3 = cv2.drawMatches(query, desktop_keypoints, ref, ref_keypoints, good_matches, None, **draw_params)

    # print(str(good_matches.__len__()) + " good matches found", file=sys.stderr)
    cv2.imshow("Good matches found: " + str(good_matches.__len__()), img3)
    cv2.waitKey()


# Quickly resize an image by a percentage of the original if needed
def quick_resize(image, percent):
    return cv2.resize(
        image,
        [int(image.shape[1] * percent / 100), int(image.shape[0] * percent / 100)],
    )


# Calculate center point from 4 corner points.
def centroid(p1, p2, p3, p4):
    # The points are pulled out of the detector in a matrix so funny array syntax occurs
    xList = [
        p1[0][0],
        p2[0][0],
        p3[0][0],
        p4[0][0],
    ]
    yList = [p1[0][1], p2[0][1], p3[0][1], p4[0][1]]
    listLen = 4.0
    x = (math.fsum(xList)) / listLen
    y = (math.fsum(yList)) / listLen
    return (np.float16(x), np.float16(y))


start_loop()
