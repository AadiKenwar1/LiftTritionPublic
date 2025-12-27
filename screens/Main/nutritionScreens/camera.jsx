import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState, useEffect} from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Button,
    Dimensions,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useIsFocused } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Camera UI Configuration - Easy to adjust positioning
const CAMERA_CONFIG = {
    frameOffset: 50,        // How much to move the crop frame up (negative = down)
    frameSelectorBottom: 160, // Distance from bottom for frame selection buttons
    bottomControlsBottom: 50, // Distance from bottom for capture button
    topControlsTop: 60,       // Distance from top for flash/exit buttons
};

// Crop offset configuration - Easy to adjust crop position
const CROP_OFFSET = {
    x: 0,  // Move crop left (negative) or right (positive)
    y: -50,  // Move crop up (negative) or down (positive)
};

// Define different frame types
const FRAME_TYPES = {
    WIDE: {
        name: 'Picture',
        width: screenWidth * 0.8,
        height: screenHeight * 0.3,
        icon: 'camera-outline',
    },
    TALL: {
        name: 'Nutrition Label',
        width: screenWidth * 0.6,
        height: screenHeight * 0.5,
        icon: 'phone-portrait-outline',
    },
    BARCODE: {
        name: 'Barcode',
        width: screenWidth * 0.85,
        height: screenHeight * 0.15,
        icon: 'barcode-outline',
    },
};

export default function CameraScreen() {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [flash, setFlash] = useState('off');
    const [currentFrame, setCurrentFrame] = useState('WIDE');
    const navigation = useNavigation();
    const cameraRef = useRef(null);
    const cameraKeyRef = useRef(0); // Track camera remounts for barcode mode transitions

    const isFocused = useIsFocused();
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (!isFocused) {
            setIsCameraReady(false);
        }
    }, [isFocused]);

    const handleCameraReady = () => {
        setIsCameraReady(true);
        setIsTransitioning(false);
    };

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>
                    We need your permission to show the camera
                </Text>
                <Button
                    onPress={requestPermission}
                    title='Grant Permission'
                />
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    };

    const toggleFlash = () => {
        setFlash((current) => {
            if (current === 'off') return 'on';
            if (current === 'on') return 'auto';
            return 'off';
        });
    };

    const selectFrame = (frameType) => {
        // If switching to/from barcode mode, force camera remount for clean state
        const wasBarcode = currentFrame === 'BARCODE';
        const willBeBarcode = frameType === 'BARCODE';
        
        if (wasBarcode !== willBeBarcode) {
            // Force camera remount when switching to/from barcode mode
            setIsTransitioning(true);
            setIsCameraReady(false);
            cameraKeyRef.current += 1;
        }
        
        setCurrentFrame(frameType);
        if (frameType === 'BARCODE') {
            setIsScanning(true);
            setScannedBarcode(null);
        } else {
            setIsScanning(false);
            setScannedBarcode(null);
        }
    };

    const handleBarCodeScanned = ({ type, data }) => {
        if (currentFrame !== 'BARCODE' || !isScanning) {
            return;
        }
        
        setIsScanning(false);
        setScannedBarcode(data);
        Alert.alert(
            'Barcode Scanned!',
            `Barcode: ${data}\n\nWould you like to process this barcode?`,
            [
                {
                    text: 'Cancel',
                    onPress: () => {
                        setIsScanning(true);
                        setScannedBarcode(null);
                    },
                    style: 'cancel',
                },
                {
                    text: 'Process',
                    onPress: () => sendBarcodeToAnalyze(data),
                },
            ]
        );
    };

    const sendBarcodeToAnalyze = (barcodeData) => {
        navigation.navigate('Tabs', {
            screen: 'Log',
            params: { barcodeData: barcodeData, cameraMode: 'BARCODE' },
        });
    };

    const getCurrentFrameData = () => FRAME_TYPES[currentFrame];

    const takePicture = async () => {
        const photo = await cameraRef.current?.takePictureAsync({
            flash: flash,
            quality: 1,
        });

        if (photo?.uri) {
            // Crop the image to the overlay area
            const croppedPhoto = await cropImage(
                photo.uri,
                photo.width,
                photo.height
            );
            console.log('Photo taken and cropped:', croppedPhoto.uri);
            
            // Automatically send the photo without preview
            sendPictureToAnalyze(croppedPhoto.uri);
        }
    };

    const cropImage = async (imageUri, imageWidth, imageHeight) => {
        try {
            const frameData = getCurrentFrameData();

            // Calculate the crop parameters
            const aspectRatio = imageWidth / imageHeight;
            const screenAspectRatio = screenWidth / screenHeight;

            // Calculate the actual image dimensions as displayed on screen
            let displayWidth, displayHeight;
            if (aspectRatio > screenAspectRatio) {
                // Image is wider than screen
                displayHeight = screenHeight;
                displayWidth = screenHeight * aspectRatio;
            } else {
                // Image is taller than screen
                displayWidth = screenWidth;
                displayHeight = screenWidth / aspectRatio;
            }

            // Calculate scale factor
            const scaleX = imageWidth / displayWidth;
            const scaleY = imageHeight / displayHeight;

            // Calculate crop area in image coordinates
            const cropX = (((screenWidth - frameData.width) / 2) + CROP_OFFSET.x) * scaleX;
            const cropY = (((screenHeight - frameData.height) / 2) + CROP_OFFSET.y) * scaleY;
            const cropWidth = frameData.width * scaleX;
            const cropHeight = frameData.height * scaleY;

            const croppedImage = await manipulateAsync(
                imageUri,
                [
                    {
                        crop: {
                            originX: cropX,
                            originY: cropY,
                            width: cropWidth,
                            height: cropHeight,
                        },
                    },
                ],
                { compress: 0.8, format: SaveFormat.JPEG }
            );

            return croppedImage;
        } catch (error) {
            console.error('Error cropping image:', error);
            return { uri: imageUri }; // Return original if cropping fails
        }
    };

    const exitCamera = () => {
        navigation.goBack();
    };

    const getFlashIcon = () => {
        switch (flash) {
            case 'on':
                return 'flash';
            case 'auto':
                return 'flash-outline';
            default:
                return 'flash-off';
        }
    };

    const sendPictureToAnalyze = (photoUri) => {
        navigation.navigate('Tabs', {
            screen: 'Log',
            params: { photoUri: photoUri, cameraMode: currentFrame },
        });
    };

    // Corner component for modern frame styling
    const FrameCorner = ({ style }) => (
        <View style={[styles.frameCorner, style]} />
    );

    return (
        <View style={styles.container}>
            {isFocused && (
                <>
                    <CameraView
                        key={`camera-${cameraKeyRef.current}`}
                        style={styles.camera}
                        facing={facing}
                        flash={flash}
                        ref={cameraRef}
                        onCameraReady={handleCameraReady}
                        onBarcodeScanned={currentFrame === 'BARCODE' && isScanning ? handleBarCodeScanned : undefined}
                        barcodeScannerSettings={
                            currentFrame === 'BARCODE' && isScanning
                                ? {
                                      barcodeTypes: [
                                          'ean13',
                                          'ean8',
                                          'upc_a',
                                          'upc_e',
                                          'code128',
                                          'code39',
                                          'code93',
                                          'codabar',
                                          'itf14',
                                          'aztec',
                                          'datamatrix',
                                          'pdf417',
                                          'qr',
                                      ],
                                  }
                                : null
                        }
                    >
                        {/* Top controls */}
                        <View style={styles.topControls}>
                            <TouchableOpacity
                                style={styles.flashButton}
                                onPress={toggleFlash}
                            >
                                <Ionicons
                                    name={getFlashIcon()}
                                    size={20}
                                    color='white'
                                />
                                <Text style={styles.flashText}>
                                    {flash.toUpperCase()}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.exitButton}
                                onPress={exitCamera}
                            >
                                <Ionicons
                                    name='close'
                                    size={24}
                                    color='white'
                                />
                            </TouchableOpacity>
                        </View>

                                                 {/* Crop Overlay */}
                         <View style={styles.overlayContainer}>
                             {/* Dark overlay areas */}
                             <View
                                 style={[
                                     styles.topOverlay,
                                     {
                                                                                   maxHeight:
                                              (screenHeight -
                                                  getCurrentFrameData().height) /
                                              2 - CAMERA_CONFIG.frameOffset,
                                     },
                                 ]}
                             />
                             <View
                                 style={[
                                     styles.middleRow,
                                     { height: getCurrentFrameData().height },
                                 ]}
                             >
                                 <View
                                     style={[
                                         styles.leftOverlay,
                                         {
                                             width:
                                                 (screenWidth -
                                                     getCurrentFrameData()
                                                         .width) /
                                                 2,
                                         },
                                     ]}
                                 />
                                 <View
                                     style={[
                                         styles.cropArea,
                                         {
                                             width: getCurrentFrameData().width,
                                             height: getCurrentFrameData()
                                                 .height,
                                         },
                                     ]}
                                 >
                                    {/* Modern corner-only frame */}
                                    <FrameCorner style={styles.topLeftCorner} />
                                    <FrameCorner
                                        style={styles.topRightCorner}
                                    />
                                    <FrameCorner
                                        style={styles.bottomLeftCorner}
                                    />
                                    <FrameCorner
                                        style={styles.bottomRightCorner}
                                    />

                                </View>
                                <View
                                    style={[
                                        styles.rightOverlay,
                                        {
                                            width:
                                                (screenWidth -
                                                    getCurrentFrameData()
                                                        .width) /
                                                2,
                                        },
                                    ]}
                                />
                            </View>
                            <View
                                style={[
                                    styles.bottomOverlay,
                                    {
                                        maxHeight:
                                            (screenHeight -
                                                getCurrentFrameData().height) /
                                            1 ,
                                    },
                                ]}
                            />
                        </View>

                        {/* Frame Selection Buttons */}
                        <View style={styles.frameSelector}>
                            {Object.entries(FRAME_TYPES).map(([key, frame]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.frameSelectorButton,
                                        currentFrame === key &&
                                            styles.frameSelectorButtonActive,
                                    ]}
                                    onPress={() => selectFrame(key)}
                                >
                                    <Ionicons
                                        name={frame.icon}
                                        size={18}
                                        color={
                                            currentFrame === key
                                                ? '#00FF88'
                                                : 'white'
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.frameSelectorText,
                                            currentFrame === key &&
                                                styles.frameSelectorTextActive,
                                        ]}
                                    >
                                        {frame.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Barcode scanning instructions */}
                        {currentFrame === 'BARCODE' && (
                            <View style={styles.barcodeInstructions}>
                            </View>
                        )}

                        {/* Bottom controls */}
                        <View style={styles.bottomControls}>
                            <TouchableOpacity
                                style={styles.flipButton}
                                onPress={toggleCameraFacing}
                            >
                                <Ionicons
                                    name='camera-reverse'
                                    size={28}
                                    color='#333'
                                />
                            </TouchableOpacity>

                            {currentFrame !== 'BARCODE' && (
                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={takePicture}
                                >
                                    <View style={styles.captureButtonInner} />
                                </TouchableOpacity>
                            )}

                            <View style={styles.placeholder} />
                        </View>
                    </CameraView>
                    {/* Black overlay during transition to prevent white flash */}
                    {isTransitioning && (
                        <View style={styles.transitionOverlay} />
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000000',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    topControls: {
        position: 'absolute',
        top: CAMERA_CONFIG.topControlsTop,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 2,
    },
    flashButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 25,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
    },
    flashText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
    },
    frameButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 25,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 70,
    },
    frameText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
    },
    frameSelector: {
        position: 'absolute',
        bottom: CAMERA_CONFIG.frameSelectorBottom,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        zIndex: 2,
    },
    frameSelectorButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        borderWidth: 2,
        borderColor: 'white',
    },
    frameSelectorButtonActive: {
        backgroundColor: 'rgba(0, 255, 136, 0.2)',
        borderColor: '#00FF88',
    },
    frameSelectorText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 2,
    },
    frameSelectorTextActive: {
        color: '#00FF88',
    },
    exitButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 25,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    topOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    middleRow: {
        flexDirection: 'row',
    },
    leftOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    cropArea: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    rightOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    bottomOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    frameCorner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#00FF88',
        borderWidth: 3,
    },
    topLeftCorner: {
        top: -2,
        left: -2,
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderTopLeftRadius: 8,
    },
    topRightCorner: {
        top: -2,
        right: -2,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderTopRightRadius: 8,
    },
    bottomLeftCorner: {
        bottom: -2,
        left: -2,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomLeftRadius: 8,
    },
    bottomRightCorner: {
        bottom: -2,
        right: -2,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderBottomRightRadius: 8,
    },
    cropText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        position: 'absolute',
        bottom: -40,
    },
    bottomControls: {
        position: 'absolute',
        bottom: CAMERA_CONFIG.bottomControlsBottom,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        zIndex: 2,
    },
    flipButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 35,
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    captureButton: {
        backgroundColor: 'white',
        borderRadius: 45,
        width: 90,
        height: 90,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    captureButtonInner: {
        backgroundColor: 'white',
        borderRadius: 45,
        width: 80,
        height: 80,
        borderColor: 'black',
        borderWidth: 2,
    },
    placeholder: {
        width: 70,
        height: 70,
    },

    barcodeInstructions: {
        position: 'absolute',
        top: '50%',
        left: 20,
        right: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    barcodeInstructionsText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    transitionOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        zIndex: 9999,
    },
});
